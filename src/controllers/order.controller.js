import prisma from "../utils/prisma.js";

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            buyerId: userId,
          },
          {
            sellerId: userId,
          },
        ],
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.params.orderId);

    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this order",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    return res.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
