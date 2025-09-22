import express from "express";
import {
  getStockMovements,
  getStockMovementById,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
} from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getStockMovements);
router.get("/:id", getStockMovementById);
router.post("/", createStockMovement);
router.put("/:id", updateStockMovement);
router.delete("/:id", deleteStockMovement);

export default router;
