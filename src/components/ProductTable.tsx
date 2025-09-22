import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import ToggleSwitch from "../components/ToggleSwitch";

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
  imageUrl?: string | null;
  category?: { id: number; name: string; parent?: { id: number; name: string } | null };
}

const ProductTable = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (value: string | number) => {
    const number = typeof value === "string" ? parseFloat(value || "0") : value || 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
  };

  return (
    <table className="mt-6 w-full whitespace-nowrap text-left max-lg:block max-lg:overflow-x-scroll">
      <thead className="border-b border-white/10 text-sm leading-6 dark:text-whiteSecondary text-blackPrimary">
        <tr>
          <th className="py-2 pl-4 pr-8 font-semibold">Product</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Price</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Stock</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Category</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Status</th>
          <th className="py-2 pl-0 pr-4 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {products.map((product) => (
          <tr key={product.id}>
            <td className="py-4 pl-4 pr-8">
              <div className="flex items-center gap-x-4">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-32 w-32 rounded-lg bg-gray-200 object-cover shadow-md" />
                ) : (
                  <div className="h-12 w-12 rounded bg-gray-400 flex items-center justify-center text-white font-bold text-xs">
                    {product?.name ? product.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <div className="truncate text-sm font-medium">{product.name}</div>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 text-sm">{formatCurrency(product.price)}</td>
            <td className="py-4 pl-0 pr-4 text-sm">{product.stock}</td>
            <td className="py-4 pl-0 pr-4 text-sm">
              {product.category ? (
                product.category.parent ? (
                  <div>
                    <div className="font-medium">{product.category.parent.name}</div>
                    <div className="text-sm text-gray-500">- {product.category.name}</div>
                  </div>
                ) : (
                  <div>{product.category.name}</div>
                )
              ) : (
                "-"
              )}
            </td>
            <td className="py-4 pl-0 pr-4 text-sm">
              <ToggleSwitch
                checked={product.isActive}
                onChange={async () => {
                  try {
                    const res = await api.patch(`/products/${product.id}/toggle`);
                    setProducts(products.map(p => (p.id === product.id ? res.data : p)));
                  } catch (err) {
                    console.error("Failed to toggle status:", err);
                  }
                }}
              />
            </td>
            <td className="py-4 pl-0 pr-4 text-right text-sm">
              <div className="flex gap-x-1 justify-end">
                <Link to={`/products/edit/${product.id}`} className="border w-8 h-8 flex justify-center items-center">
                  <HiOutlinePencil />
                </Link>
                <Link to={`/products/${product.id}`} className="border w-8 h-8 flex justify-center items-center">
                  <HiOutlineEye />
                </Link>
                <button onClick={() => handleDelete(product.id)} className="border w-8 h-8 flex justify-center items-center">
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;