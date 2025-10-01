const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");

function initiSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors:{
      origin:'http://localhost:5173',
      allowedHeaders:["Content-Type","Authorization"],
      credentials:true,
    }
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
          user: socket.user._id,
          chat: messagePayload.chat,
          text: messagePayload.content,
        },
      });

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
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

      //short term memory:
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });
      //long term memory
      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
            these are some previous messages from the chat, use them to generate response
            ${memory.map((item) => item.metadata.text).join("\n")}
            `,
            },
          ],
        },
      ];

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
        vectors: responseVectors, // Fixed typo here
        messageId: responseMessage._id,
        metadata: {
          user: socket.user._id,
          chat: messagePayload.chat,
          text: response,
        },
      });
    });
  });
}

module.exports = initiSocketServer;
