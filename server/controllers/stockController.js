import { PrismaClient } from "@prisma/client";
import { logUserAction, logUpdateAction } from "../utils/audit.js";
const prisma = new PrismaClient();

const normalizeDirection = (dir) => (dir ? String(dir).toUpperCase() : null);

export const getStockMovements = async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(movements);
  } catch (error) {
    console.error("getStockMovements error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getStockMovementById = async (req, res) => {
  const { id } = req.params;
  try {
    const movement = await prisma.stockMovement.findUnique({
      where: { id: Number(id) },
      include: { product: true, user: true },
    });
    if (!movement) return res.status(404).json({ message: "Stock movement not found" });
    res.json(movement);
  } catch (error) {
    console.error("getStockMovementById error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createStockMovement = async (req, res) => {
  try {
    const {
      productId,
      direction = "IN",
      quantity,
      sourceType = null,
      sourceId = null,
      note = null,
    } = req.body;

    if (!productId || !quantity) return res.status(400).json({ message: "productId and quantity are required" });
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: "quantity must be a positive number" });

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const dir = normalizeDirection(direction);
    if (!["IN", "OUT"].includes(dir)) return res.status(400).json({ message: "direction must be IN or OUT" });

    const result = await prisma.$transaction(async (tx) => {
      const newStock = dir === "IN" ? product.stock + qty : product.stock - qty;
      if (newStock < 0) throw new Error("Insufficient stock for this OUT movement");

      const created = await tx.stockMovement.create({
        data: {
          productId: Number(productId),
          direction: dir,
          quantity: qty,
          sourceType: sourceType ?? null,
          sourceId: sourceId ? Number(sourceId) : null,
          note: note ?? null,
          createdBy: req.user?.id ?? null,
        },
      });

      const updatedProduct = await tx.product.update({
        where: { id: Number(productId) },
        data: { stock: newStock },
      });

      return { created, updatedProduct };
    });

    await logUserAction({ reqUser: req.user, action: "CREATE", entity: "StockMovement", target: result.created });

    res.status(201).json({ movement: result.created, product: result.updatedProduct });
  } catch (error) {
    console.error("createStockMovement error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateStockMovement = async (req, res) => {
  const { id } = req.params;
  try {
    const {
      productId,
      direction = "IN",
      quantity,
      sourceType = null,
      sourceId = null,
      note = null,
    } = req.body;

    if (!productId || !quantity) return res.status(400).json({ message: "productId and quantity are required" });
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: "quantity must be a positive number" });

    const movement = await prisma.stockMovement.findUnique({ where: { id: Number(id) } });
    if (!movement) return res.status(404).json({ message: "Stock movement not found" });

    const oldProduct = await prisma.product.findUnique({ where: { id: movement.productId } });
    const newProductRef = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!newProductRef) return res.status(404).json({ message: "Target product not found" });

    const oldDir = normalizeDirection(movement.direction);
    const newDir = normalizeDirection(direction);
    if (!["IN", "OUT"].includes(newDir)) return res.status(400).json({ message: "direction must be IN or OUT" });

    // Transaction: reverse old effect, apply new effect, update movement row
    const result = await prisma.$transaction(async (tx) => {
      // reverse old effect on old product
      let productAfterReverse;
      if (movement.productId === Number(productId)) {
        // same product: start from oldProduct
        productAfterReverse = oldProduct;
      } else {
        // different product: need to fetch both sides
        productAfterReverse = oldProduct;
      }

      // reverse effect on the old product
      const afterReverseOldStock = oldDir === "IN" ? productAfterReverse.stock - movement.quantity : productAfterReverse.stock + movement.quantity;
      if (afterReverseOldStock < 0) throw new Error("Reversing old movement would lead to negative stock — abort");

      const updatedOldProduct = await tx.product.update({
        where: { id: productAfterReverse.id },
        data: { stock: afterReverseOldStock },
      });

      // apply effect to new product (could be same as old)
      const targetProductBefore = movement.productId === Number(productId) ? updatedOldProduct : newProductRef;

      const afterApplyNewStock = newDir === "IN" ? targetProductBefore.stock + qty : targetProductBefore.stock - qty;
      if (afterApplyNewStock < 0) throw new Error("Applying new movement would lead to negative stock — abort");

      const updatedTargetProduct = await tx.product.update({
        where: { id: targetProductBefore.id },
        data: { stock: afterApplyNewStock },
      });

      // update movement record
      const updatedMovement = await tx.stockMovement.update({
        where: { id: Number(id) },
        data: {
          productId: Number(productId),
          direction: newDir,
          quantity: qty,
          sourceType: sourceType ?? null,
          sourceId: sourceId ? Number(sourceId) : null,
          note: note ?? null,
        },
      });

      return { updatedMovement, updatedOldProduct, updatedTargetProduct };
    });

    // audit log
    await logUpdateAction({
      reqUser: req.user,
      entity: "StockMovement",
      entityId: result.updatedMovement.id,
      oldData: movement,
      newData: result.updatedMovement,
    });

    res.json({ movement: result.updatedMovement, products: { old: result.updatedOldProduct, new: result.updatedTargetProduct } });
  } catch (error) {
    console.error("updateStockMovement error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteStockMovement = async (req, res) => {
  const { id } = req.params;
  try {
    const movement = await prisma.stockMovement.findUnique({ where: { id: Number(id) } });
    if (!movement) return res.status(404).json({ message: "Stock movement not found" });

    const product = await prisma.product.findUnique({ where: { id: movement.productId } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    // reverse effect and delete movement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const reversedStock = movement.direction.toUpperCase() === "IN" ? product.stock - movement.quantity : product.stock + movement.quantity;
      if (reversedStock < 0) throw new Error("Reversing this movement would lead to negative stock — abort");

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { stock: reversedStock },
      });

      const deleted = await tx.stockMovement.delete({ where: { id: Number(id) } });

      return { deleted, updatedProduct };
    });

    await logUserAction({ reqUser: req.user, action: "DELETE", entity: "StockMovement", target: result.deleted });

    res.json({ message: "Stock movement deleted", movement: result.deleted, product: result.updatedProduct });
  } catch (error) {
    console.error("deleteStockMovement error:", error);
    res.status(500).json({ error: error.message });
  }
};
