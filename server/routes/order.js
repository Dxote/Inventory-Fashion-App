import { Router } from "express";
import {
  getOrders,
  getOrderById,
  deleteOrder,
  verifyPickupCode,
  handleMidtransNotification,
} from "../controllers/orderController.js";

const router = Router();

router.get("/", getOrders);
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);

// Pickup verification
router.post("/:id/verify-pickup", verifyPickupCode);

// Midtrans callback
router.post("/midtrans/notification", handleMidtransNotification);

export default router;