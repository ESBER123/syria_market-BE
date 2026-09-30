import prisma from "../utils/prisma.js";

export const createOffer = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const productId = Number(req.params.productId);

    const offeredPrice = Number(req.body.offeredPrice);

    if (!offeredPrice || offeredPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid offered price",
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        message: "You cannot make an offer on your own product",
      });
    }

    if (product.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      });
    }

    const offer = await prisma.offer.create({
      data: {
        offeredPrice,
        buyerId,
        sellerId: product.sellerId,
        productId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const acceptOffer = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const offerId = Number(req.params.offerId);

    const offer = await prisma.offer.findUnique({
      where: {
        id: offerId,
      },
      include: {
        product: true,
      },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Only the seller can accept this offer",
      });
    }

    if (offer.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This offer is no longer pending",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const acceptedOffer = await tx.offer.update({
        where: {
          id: offerId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      await tx.product.update({
        where: {
          id: offer.productId,
        },
        data: {
          status: "RESERVED",
        },
      });

      const order = await tx.order.create({
        data: {
          price: offer.offeredPrice,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          productId: offer.productId,
        },
      });

      return {
        acceptedOffer,
        order,
      };
    });

    return res.json({
      success: true,
      message: "Offer accepted",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const rejectOffer = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const offerId = Number(req.params.offerId);

    const offer = await prisma.offer.findUnique({
      where: {
        id: offerId,
      },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Only the seller can reject this offer",
      });
    }

    if (offer.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This offer is no longer pending",
      });
    }

    const rejectedOffer = await prisma.offer.update({
      where: {
        id: offerId,
      },
      data: {
        status: "REJECTED",
      },
    });

    return res.json({
      success: true,
      message: "Offer rejected",
      offer: rejectedOffer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const counterOffer = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const offerId = Number(req.params.offerId);

    const offeredPrice = Number(req.body.offeredPrice);

    if (!offeredPrice || offeredPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid offered price",
      });
    }

    const originalOffer = await prisma.offer.findUnique({
      where: {
        id: offerId,
      },
    });

    if (!originalOffer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (originalOffer.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: "Only the seller can counter this offer",
      });
    }

    if (originalOffer.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This offer is no longer pending",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.offer.update({
        where: {
          id: offerId,
        },
        data: {
          status: "COUNTERED",
        },
      });

      const newOffer = await tx.offer.create({
        data: {
          offeredPrice,
          buyerId: originalOffer.buyerId,
          sellerId: originalOffer.sellerId,
          productId: originalOffer.productId,
          parentOfferId: originalOffer.id,
        },
      });

      return newOffer;
    });

    return res.status(201).json({
      success: true,
      message: "Counter offer created",
      offer: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const acceptCounterOffer = async (req, res) => {
  try {
    const buyerId = req.user.userId;
    const offerId = Number(req.params.offerId);

    const offer = await prisma.offer.findUnique({
      where: {
        id: offerId,
      },
      include: {
        product: true,
      },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.buyerId !== buyerId) {
      return res.status(403).json({
        success: false,
        message: "Only the buyer can accept this offer",
      });
    }

    if (offer.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This offer is no longer pending",
      });
    }

    if (offer.product.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Product is no longer available",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const acceptedOffer = await tx.offer.update({
        where: {
          id: offerId,
        },
        data: {
          status: "ACCEPTED",
        },
      });

      await tx.product.update({
        where: {
          id: offer.productId,
        },
        data: {
          status: "RESERVED",
        },
      });

      const order = await tx.order.create({
        data: {
          price: offer.offeredPrice,
          buyerId: offer.buyerId,
          sellerId: offer.sellerId,
          productId: offer.productId,
        },
      });

      return {
        acceptedOffer,
        order,
      };
    });

    return res.json({
      success: true,
      message: "Offer accepted and order created",
      data: result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getMyOffers = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sentOffers = await prisma.offer.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        parentOffer: true,
        counterOffers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const receivedOffers = await prisma.offer.findMany({
      where: {
        sellerId: userId,
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
        parentOffer: true,
        counterOffers: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      sentOffers,
      receivedOffers,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getOfferById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const offerId = Number(req.params.offerId);

    const offer = await prisma.offer.findUnique({
      where: {
        id: offerId,
      },
      include: {
        product: {
          include: {
            images: true,
            seller: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
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
        parentOffer: true,
        counterOffers: true,
      },
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (offer.buyerId !== userId && offer.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this offer",
      });
    }

    return res.json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
