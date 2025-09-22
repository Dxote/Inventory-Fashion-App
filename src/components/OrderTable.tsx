import { useEffect, useState } from "react";
import api from "../utils/api";
import { HiOutlineTrash, HiOutlineEye } from "react-icons/hi";

interface Order {
  id: number;
  user?: { id: number; name: string } | null;
  items: { id: number; name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  deliveryMethod?: string | null;
  createdAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [pickupTarget, setPickupTarget] = useState<Order | null>(null);
  const [pickupCode, setPickupCode] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order?")) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders(orders.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order");
    }
  };

  const handleVerifyPickup = async () => {
    if (!pickupTarget) return;
    try {
      const res = await api.post(`/orders/${pickupTarget.id}/verify-pickup`, {
        code: pickupCode,
      });
      alert("Pickup verified!");
      setPickupTarget(null);
      setPickupCode("");
      fetchOrders();
    } catch (err: any) {
      console.error("Pickup verification failed:", err);
      alert(err.response?.data?.error || "Invalid pickup code");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);
  };

  const renderStatus = (status: string) => {
    const base = "px-2 py-1 rounded text-xs font-semibold";
    switch (status) {
      case "PENDING":
        return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
      case "PAID":
        return <span className={`${base} bg-blue-100 text-blue-800`}>Paid</span>;
      case "COMPLETE":
        return <span className={`${base} bg-green-100 text-green-800`}>Complete</span>;
      case "CANCEL":
        return <span className={`${base} bg-red-100 text-red-800`}>Cancel</span>;
      default:
        return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Orders</h2>

      <table className="w-full whitespace-nowrap text-left">
        <thead className="border-b border-white/10 text-sm leading-6 dark:text-whiteSecondary text-blackPrimary">
          <tr>
            <th className="py-2 pl-4 pr-8 font-semibold">Customer</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Items</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Total</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Status</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Method</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Created</th>
            <th className="py-2 pl-0 pr-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="py-3 pl-4 pr-8 text-sm">
                {order.user?.name ?? `#${order.user?.id ?? "-"}`}
              </td>
              <td className="py-3 pl-0 pr-4 text-sm">
                {order.items.length} item(s)
              </td>
              <td className="py-3 pl-0 pr-4 text-sm">{formatCurrency(order.total)}</td>
              <td className="py-3 pl-0 pr-4 text-sm">{renderStatus(order.status)}</td>
              <td className="py-3 pl-0 pr-4 text-sm">
                {order.deliveryMethod ?? "-"}
              </td>
              <td className="py-3 pl-0 pr-4 text-sm">
                {new Date(order.createdAt).toLocaleString()}
              </td>
              <td className="py-3 pl-0 pr-4 text-right text-sm">
                <div className="flex gap-x-1 justify-end">
                  <button
                    onClick={() => setSelected(order)}
                    className="border w-8 h-8 flex justify-center items-center"
                  >
                    <HiOutlineEye />
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="border w-8 h-8 flex justify-center items-center"
                  >
                    <HiOutlineTrash />
                  </button>
                  {order.deliveryMethod === "pickup" && order.status !== "COMPLETE" && (
                    <button
                      onClick={() => setPickupTarget(order)}
                      className="border px-2 py-1 text-xs ml-2"
                    >
                      Verify Pickup
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-blackPrimary p-6 rounded-lg max-w-lg w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4">Order #{selected.id}</h3>
            <p className="mb-2">
              <span className="font-semibold">Customer:</span>{" "}
              {selected.user?.name ?? "-"}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Status:</span> {selected.status}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Created:</span>{" "}
              {new Date(selected.createdAt).toLocaleString()}
            </p>
            <h4 className="font-semibold mt-4 mb-2">Items</h4>
            <ul className="space-y-1 text-sm">
              {selected.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(selected.total)}</span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal Verify Pickup */}
      {pickupTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-blackPrimary p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-4">
              Verify Pickup for Order #{pickupTarget.id}
            </h3>
            <input
              type="text"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              className="border p-2 w-full mb-4"
              placeholder="Enter pickup code"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPickupTarget(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyPickup}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;