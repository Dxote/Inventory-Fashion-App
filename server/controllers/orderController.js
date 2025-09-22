import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import midtransClient from "midtrans-client";

const prisma = new PrismaClient();

// Init midtrans
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mapped = orders.map(o => ({
      id: o.id,
      user: o.user ? { id: o.user.id, name: o.user.name } : null,
      items: o.items.map(i => ({
        id: i.id,
        name: i.product.name,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      total: o.items.reduce(
        (acc, i) => acc + Number(i.price) * i.quantity,
        0
      ),
      status: o.status,
      deliveryMethod: o.deliveryMethod,
      createdAt: o.createdAt,
    }));

    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// POST verify code picup
export const verifyPickupCode = async (req, res) => {
  const { id } = req.params;
  const { code } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.deliveryMethod !== "pickup") {
      return res.status(400).json({ error: "This order is not pickup" });
    }

    const valid = await bcrypt.compare(code, order.pickupCode || "");
    if (!valid) return res.status(401).json({ error: "Invalid pickup code" });

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status: "COMPLETE" },
    });

    res.json({ message: "Pickup verified", order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify pickup" });
  }
};

// midtrans notif
export const handleMidtransNotification = async (req, res) => {
  try {
    const notif = await snap.transaction.notification(req.body);

    const { order_id, transaction_status, fraud_status } = notif;

    let paymentStatus = transaction_status;

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") paymentStatus = "challenge";
      else if (fraud_status === "accept") paymentStatus = "settlement";
    }

    const order = await prisma.order.update({
      where: { id: Number(order_id) },
      data: { paymentStatus },
    });

    res.json({ message: "Notification processed", order });
  } catch (err) {
    console.error("Midtrans notification error:", err);
    res.status(500).json({ error: "Failed to process notification" });
  }
};