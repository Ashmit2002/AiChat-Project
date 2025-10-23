const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

const router = express.Router();

/*POST /api/chat/ */
router.post("/", authMiddleware.authMiddleware, chatController.createChat);
/* GET /api/chat/ */
router.get("/", authMiddleware.authMiddleware, chatController.getChats);
/* GET /api/chat/messages/:id */
router.get(
  "/messages/:id",
  authMiddleware.authMiddleware,
  chatController.getMessages
);
/* DELETE /api/chat/:id */
router.delete("/:id", authMiddleware.authMiddleware, chatController.deleteChat);
/* PUT /api/chat/:id */
router.put("/:id", authMiddleware.authMiddleware, chatController.renameChat);

module.exports = router;
