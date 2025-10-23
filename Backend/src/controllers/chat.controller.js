const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({ title, user: user._id });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
    },
  });
}

async function getChats(req, res) {
  const user = req.user;
  const chats = await chatModel.find({ user: user._id, isDeleted: false }); // Exclude deleted chats
  res.status(200).json({
    message: "Chat retrieved successfully",
    chats: chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    })),
  });
}

async function getMessages(req, res) {
  const chatId = req.params.id;
  const messages = await messageModel
    .find({ chat: chatId })
    .sort({ createdAt: 1 });
  res.status(200).json({
    message: "message retrieved successfully",
    messages: messages,
  });
}

async function deleteChat(req, res) {
  try {
    const chatId = req.params.id;
    const user = req.user;

    // Check if chat exists and belongs to the user
    const chat = await chatModel.findOne({
      _id: chatId,
      user: user._id,
      isDeleted: false,
    });
    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found or unauthorized" });
    }

    // Soft delete: mark as deleted instead of actually deleting
    await chatModel.findByIdAndUpdate(chatId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    // Optional: You can still delete messages or keep them for recovery
    // await messageModel.deleteMany({chat: chatId});

    res.status(200).json({
      message: "Chat deleted successfully",
      deletedChatId: chatId,
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    res
      .status(500)
      .json({ message: "Internal server error while deleting chat" });
  }
}

async function renameChat(req, res) {
  try {
    const chatId = req.params.id;
    const { title } = req.body;
    const user = req.user;

    // Validate title
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Check if chat exists and belongs to the user
    const chat = await chatModel.findOne({
      _id: chatId,
      user: user._id,
      isDeleted: false,
    });
    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found or unauthorized" });
    }

    // Update chat title
    await chatModel.findByIdAndUpdate(chatId, {
      title: title.trim(),
      lastActivity: new Date(),
    });

    res.status(200).json({
      message: "Chat renamed successfully",
      chatId: chatId,
      newTitle: title.trim(),
    });
  } catch (error) {
    console.error("Rename chat error:", error);
    res
      .status(500)
      .json({ message: "Internal server error while renaming chat" });
  }
}

module.exports = {
  createChat,
  getChats,
  getMessages,
  deleteChat,
  renameChat,
};
