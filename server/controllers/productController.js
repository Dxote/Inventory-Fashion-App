import { PrismaClient } from "@prisma/client";
import { logUserAction, logUpdateAction } from "../utils/audit.js";

const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: { include: { parent: true } } },
      orderBy: { id: "asc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: { include: { parent: true } } },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId, gender, imageUrl, isActive } = req.body;
  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        stock: stock || 0,
        categoryId: categoryId ? Number(categoryId) : null,
        gender: gender ? gender.toUpperCase() : null,
        imageUrl: imageUrl ?? null,
        isActive: isActive ?? true,
      },
    });

    await logUserAction({ reqUser: req.user, action: "CREATE", entity: "Product", target: newProduct });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("ERROR CREATE PRODUCT:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId, gender, imageUrl, isActive } = req.body;

  try {
    const oldProduct = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!oldProduct) return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description: description || null,
        price,
        stock,
        categoryId: categoryId ? Number(categoryId) : null,
        gender: gender ? gender.toUpperCase() : null,
        imageUrl: imageUrl ?? null,
        isActive,
      },
    });

    await logUpdateAction({
      reqUser: req.user,
      entity: "Product",
      entityId: updatedProduct.id,
      oldData: oldProduct,
      newData: updatedProduct,
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await prisma.product.delete({ where: { id: Number(id) } });

    await logUserAction({ reqUser: req.user, action: "DELETE", entity: "Product", target: deletedProduct });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// toggle
export const toggleProductStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { isActive: !product.isActive },
      include: { category: { include: { parent: true } } }, 
    });

    await logUpdateAction({
      reqUser: req.user,
      entity: "Product",
      entityId: updatedProduct.id,
      oldData: product,
      newData: updatedProduct,
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const { id } = req.params;

    if (!id) {
      return res.json({ message: "Upload success", url: imageUrl, filePath: `/uploads/${req.file.filename}` });
    }

    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { imageUrl },
    });

    return res.json({ message: "Product image uploaded", product: updatedProduct, url: imageUrl });
  } catch (err) {
    console.error("uploadProductImage error:", err);
    return res.status(500).json({ message: "Error uploading image", error: err.message });
  }
};
