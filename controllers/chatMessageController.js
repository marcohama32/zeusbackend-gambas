const ChatMessage = require("../models/chatMessageModel");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Save chat message
// @route   POST /api/chat/message
exports.saveChatMessage = asyncHandler(async (req, res) => {
  const { text,senderAvatar,receiverAvatar,receiverName,receiverId } = req.body;

  const senderId = req.user.id;
  console.log("Name: ",text)
  const senderName = req.user.firstName;

  const newChatMessage = new ChatMessage({
    text,
    senderId,
    senderName,
    senderAvatar,
    receiverAvatar,
    receiverId,
    receiverName,
  });

  try {
    const savedMessage = await newChatMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error("Error saving chat message:", err);
    res.status(500).json({ error: "Error saving chat message" });
  }
});


exports.getChatMessages = asyncHandler(async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    // Fetch all chat messages between the sender and receiver from the database
    const chatMessages = await ChatMessage.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    console.log("Chat messages found:", chatMessages);

    // Send the messages as a response
    res.status(200).json(chatMessages);
  } catch (err) {
    console.error("Error fetching chat messages:", err);
    res.status(500).json({ error: "Error fetching chat messages" });
  }
});


exports.deleteChatMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.id;

  try {
    // Find the chat message by ID and delete it
    const deletedMessage = await ChatMessage.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: "Chat message not found" });
    }

    res.status(200).json({ message: "Chat message deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat message:", err);
    res.status(500).json({ error: "Error deleting chat message" });
  }
});

exports.updateChatMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.id;
  const { text } = req.body;

  try {
    // Find the chat message by ID and update its text
    const updatedMessage = await ChatMessage.findByIdAndUpdate(
      messageId,
      { text },
      { new: true } // This option returns the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Chat message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (err) {
    console.error("Error updating chat message:", err);
    res.status(500).json({ error: "Error updating chat message" });
  }
});