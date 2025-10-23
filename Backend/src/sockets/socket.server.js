const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");
const {
  createMemory,
  queryMemory,
  queryCrossChatMemory,
} = require("../service/vector.service");

function initiSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    //cookie ke andr ka data pdhne ke liye ye code hai
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
    let token = cookies.token || socket.handshake.headers["authorization"];
    if (!token) {
      next(new Error("Authentication Error: No Token"));
      return;
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      socket.user = user; // Assign the full user object
      next();
    } catch (error) {
      next(new Error("Authentication Error: Invalid Token"));
    }
  });

  io.on("connection", async (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      /*messagePayload = {chat:"chatId", content:"message content"}*/

      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: messagePayload.content,
          role: "user",
        }),
        //vector generate krre hai
        aiService.generateVector(messagePayload.content),
      ]);

      //vector ko memory me store krre hai
      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          user: socket.user._id.toString(), // Ensure string format
          chat: messagePayload.chat,
          text: messagePayload.content,
          timestamp: new Date().toISOString(),
          role: "user",
        },
      });

      const [currentChatMemory, crossChatMemory, chatHistory] =
        await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 5, // Current chat relevant memories
            metadata: {
              user: socket.user._id.toString(),
              chat: messagePayload.chat,
            },
          }),
          queryCrossChatMemory({
            queryVector: vectors,
            limit: 5, // Cross-chat relevant memories
            userId: socket.user._id.toString(),
            currentChatId: messagePayload.chat,
          }),
          messageModel
            .find({
              chat: messagePayload.chat,
            })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

      //short term memory (current chat):
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      //long term memory from current chat
      const currentChatContext = currentChatMemory
        .filter((item) => item.score > 0.7)
        .slice(0, 3)
        .map((item) => `[Current chat context]: ${item.metadata.text}`)
        .join("\n");

      //long term memory from other chats
      const crossChatContext = crossChatMemory
        .filter((item) => item.score > 0.75) // Higher threshold for cross-chat
        .slice(0, 3)
        .map((item) => `[Previous conversation]: ${item.metadata.text}`)
        .join("\n");

      const contextParts = [];
      if (currentChatContext) {
        contextParts.push(
          `Relevant context from this conversation:\n${currentChatContext}`
        );
      }
      if (crossChatContext) {
        contextParts.push(
          `Relevant context from previous conversations:\n${crossChatContext}`
        );
      }

      // Debug logging
      console.log(
        `[Memory Debug] Current chat memories found: ${currentChatMemory.length}`
      );
      console.log(
        `[Memory Debug] Cross-chat memories found: ${crossChatMemory.length}`
      );
      console.log(`[Memory Debug] Using ${contextParts.length} context parts`);

      const ltm =
        contextParts.length > 0
          ? [
              {
                role: "user",
                parts: [
                  {
                    text: `
${contextParts.join("\n\n")}

Please use this context to provide more informed and consistent responses. Reference previous discussions when relevant, and maintain consistency in your personality and knowledge about the user.
            `,
                  },
                ],
              },
            ]
          : [];

      const response = await aiService.generateResponse([...ltm, ...stm]);

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),
        aiService.generateVector(response),
      ]);
      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          user: socket.user._id.toString(), // Ensure string format
          chat: messagePayload.chat,
          text: response,
          timestamp: new Date().toISOString(),
          role: "model",
        },
      });
    });
  });
}

module.exports = initiSocketServer;
