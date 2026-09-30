import prisma from "../utils/prisma.js";

// =========================
// CREATE REVIEW
// =========================

export const createReview = async (req, res) => {
  try {
    const reviewerId = req.user.userId;
    const sellerId = Number(req.params.sellerId);

    const { rating, comment, orderId } = req.body;

    if (!Number.isInteger(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    if (!Number.isInteger(Number(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (reviewerId === sellerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    // Check order
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure this buyer owns the order
    if (order.buyerId !== reviewerId || order.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "You cannot review this order",
      });
    }

    // Only delivered orders can be reviewed
    if (order.status !== "DELIVERED") {
      return res.status(403).json({
        success: false,
        message: "You can only review a delivered order",
      });
    }

    // Check existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        orderId: order.id,
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You already reviewed this order",
      });
    }

    const review = await prisma.review.create({
      data: {
        rating: numericRating,
        comment: comment?.trim() || null,
        reviewerId,
        sellerId,
        orderId: order.id,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =========================
// GET SELLER REVIEWS
// =========================

export const getSellerReviews = async (req, res) => {
  try {
    const sellerId = Number(req.params.sellerId);

    if (!Number.isInteger(sellerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid seller ID",
      });
    }

    const seller = await prisma.user.findUnique({
      where: {
        id: sellerId,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    const reviews = await prisma.review.findMany({
      where: {
        sellerId,
      },
      include: {
        reviewer: {
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

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    return res.json({
      success: true,
      seller,
      reviews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
