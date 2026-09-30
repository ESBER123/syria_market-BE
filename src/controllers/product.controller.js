import prisma from "../utils/prisma.js";
import { createProductSchema } from "../validators/product.validator.js";

export const createProduct = async (req, res) => {
  try {
    const result = createProductSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: result.error.flatten(),
      });
    }

    const {
      title,
      description,
      price,
      condition,
      size,
      brand,
      city,
      categoryId,
    } = result.data;

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        condition,
        size,
        brand,
        city,
        categoryId,
        sellerId: req.user.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getProductById = async (req, res) => {
  try {
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
      include: {
        images: true,
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            city: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

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

    if (product.sellerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own products",
      });
    }

    const { title, description, price, condition, size, brand, city } =
      req.body;

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        title,
        description,
        price,
        condition,
        size,
        brand,
        city,
      },
    });

    return res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

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

    if (product.sellerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own products",
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const uploadProductImages = async (req, res) => {
  try {
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

    if (product.sellerId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only upload images to your own product",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    const images = await prisma.productImage.createMany({
      data: req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        productId,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      count: images.count,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
