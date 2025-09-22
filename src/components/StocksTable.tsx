import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";

interface StockMovement {
  id: number;
  productId: number;
  direction: string;
  quantity: number;
  note?: string | null;
  createdAt: string;
  product?: { id: number; name: string; imageUrl?: string | null };
  user?: { id: number; name: string } | null;
}

const Stocks = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    try {
      const res = await api.get("/stocks");
      setMovements(res.data);
    } catch (err) {
      console.error("Failed to fetch stock movements", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this stock movement?")) return;
    try {
      await api.delete(`/stocks/${id}`);
      setMovements(movements.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete movement", err);
      alert("Failed to delete movement");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Stock Movements</h2>
      </div>

      <table className="mt-6 w-full whitespace-nowrap text-left max-lg:block max-lg:overflow-x-scroll">
        <thead className="border-b border-white/10 text-sm leading-6 dark:text-whiteSecondary text-blackPrimary">
          <tr>
            <th className="py-2 pl-4 pr-8 font-semibold">Product</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Direction</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Quantity</th>
            <th className="py-2 pl-0 pr-8 font-semibold">By</th>
            <th className="py-2 pl-0 pr-8 font-semibold">Time</th>
            <th className="py-2 pl-0 pr-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {movements.map((m) => (
            <tr key={m.id}>
              <td className="py-4 pl-4 pr-8">
                <div className="flex items-center gap-x-4">
                  {m.product?.imageUrl ? (
                    <img
                      src={m.product.imageUrl}
                      alt={m.product.name}
                      className="h-32 w-32 rounded-lg bg-gray-200 object-cover shadow-md"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-400 flex items-center justify-center text-white font-bold text-xs">
                      {m.product?.name ? m.product.name[0].toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="truncate text-sm font-medium">
                    {m.product?.name ?? `#${m.productId}`}
                  </div>
                </div>
              </td>
              <td className="py-4 pl-0 pr-4 text-sm">{m.direction}</td>
              <td className="py-4 pl-0 pr-4 text-sm">{m.quantity}</td>
              <td className="py-4 pl-0 pr-4 text-sm">{m.user?.name ?? "-"}</td>
              <td className="py-4 pl-0 pr-4 text-sm">
                {new Date(m.createdAt).toLocaleString()}
              </td>
              <td className="py-4 pl-0 pr-4 text-right text-sm">
                <div className="flex gap-x-1 justify-end">
                  <Link
                    to={`/stocks/edit/${m.id}`}
                    className="border w-8 h-8 flex justify-center items-center"
                  >
                    <HiOutlinePencil />
                  </Link>
                  <button
                    onClick={() => setSelectedMovement(m)}
                    className="border w-8 h-8 flex justify-center items-center"
                  >
                    <HiOutlineEye />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="border w-8 h-8 flex justify-center items-center"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Detail */}
      {selectedMovement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-[400px] relative">
            <button
              onClick={() => setSelectedMovement(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4">Movement Detail</h3>
            <p>
              <span className="font-semibold">Product:</span>{" "}
              {selectedMovement.product?.name ?? `#${selectedMovement.productId}`}
            </p>
            <p>
              <span className="font-semibold">Direction:</span>{" "}
              {selectedMovement.direction}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span>{" "}
              {selectedMovement.quantity}
            </p>
            <p>
              <span className="font-semibold">Source (By):</span>{" "}
              {selectedMovement.user?.name ?? "-"}
            </p>
            <p>
              <span className="font-semibold">Note:</span>{" "}
              {selectedMovement.note ?? "-"}
            </p>
            <p>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(selectedMovement.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;