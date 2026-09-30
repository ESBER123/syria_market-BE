import prisma from "../utils/prisma.js";

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            seller: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
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

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Product already in favorites",
      });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
    });

    return res.status(201).json({
      success: true,
      favorite,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found",
      });
    }

    await prisma.favorite.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
