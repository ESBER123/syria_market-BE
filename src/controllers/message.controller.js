import prisma from "../utils/prisma.js";

// =========================
// SEND MESSAGE
// =========================

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const receiverId = Number(req.body.receiverId);
    const text = req.body.text?.trim();

    if (!receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: "Receiver and message text are required",
      });
    }

    if (receiverId === senderId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET CONVERSATION
// =========================

export const getConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const otherUserId = Number(req.params.userId);

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (otherUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation",
      });
    }

    const otherUser = await prisma.user.findUnique({
      where: {
        id: otherUserId,
      },
      select: {
        id: true,
        name: true,
        city: true,
        avatar: true,
      },
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      success: true,
      otherUser,
      messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET MY CONVERSATIONS
// =========================

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
          },
          {
            receiverId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const conversationsMap = new Map();

    for (const message of messages) {
      const otherUser =
        message.senderId === userId ? message.receiver : message.sender;

      if (!conversationsMap.has(otherUser.id)) {
        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: message,
        });
      }
    }

    return res.json({
      success: true,
      conversations: Array.from(conversationsMap.values()),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
