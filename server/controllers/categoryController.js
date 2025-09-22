import { PrismaClient } from "@prisma/client";
import { logUserAction, logUpdateAction } from "../utils/audit.js";
const prisma = new PrismaClient();

export const getCategories = async (req, res) => {
  try {
    // include children to support nested listing
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
      include: { children: true },
    });
    res.json(categories);
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubcategories = async (req, res) => {
  const { parentId } = req.params;
  try {
    const subcats = await prisma.category.findMany({
      where: { parentId: Number(parentId) },
    });
    res.json(subcats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { parent: true, children: true },
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    console.error("getCategoryById error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req, res) => {
  const { name, parentId } = req.body;
  try {
    const newCat = await prisma.category.create({
      data: {
        name,
        parentId: parentId ? Number(parentId) : null,
      },
    });

    await logUserAction?.({ reqUser: req.user, action: "CREATE", entity: "Category", target: newCat });

    res.status(201).json(newCat);
  } catch (error) {
    console.error("createCategory error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;
  try {
    const oldCat = await prisma.category.findUnique({ where: { id: Number(id) } });
    if (!oldCat) return res.status(404).json({ message: "Category not found" });

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name,
        parentId: parentId ? Number(parentId) : null,
      },
    });

    await logUpdateAction?.({
      reqUser: req.user,
      entity: "Category",
      entityId: updated.id,
      oldData: oldCat,
      newData: updated,
    });

    res.json(updated);
  } catch (error) {
    console.error("updateCategory error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // check if category has products or children, prevent deletion if needed
    const children = await prisma.category.count({ where: { parentId: Number(id) } });
    const products = await prisma.product.count({ where: { categoryId: Number(id) } });

    if (children > 0) {
      return res.status(400).json({ message: "Cannot delete category with sub-categories" });
    }
    if (products > 0) {
      return res.status(400).json({ message: "Cannot delete category assigned to products" });
    }

    const deleted = await prisma.category.delete({ where: { id: Number(id) } });

    await logUserAction?.({ reqUser: req.user, action: "DELETE", entity: "Category", target: deleted });

    res.json({ message: "Category deleted", category: deleted });
  } catch (error) {
    console.error("deleteCategory error:", error);
    res.status(500).json({ error: error.message });
  }
};
