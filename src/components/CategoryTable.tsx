import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineEye } from "react-icons/hi";

interface Category {
  id: number;
  name: string;
  parentId?: number | null;
  children?: Category[];
}

const CategoryTable = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      // hanya ambil parent (parentId == null)
      setCategories(res.data.filter((c: Category) => !c.parentId));
    } catch (err) {
      console.error(err);
      alert("Failed to load category");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete kategori");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Categories</h2>
      </div>

      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="py-2 px-2">Name</th>
            <th className="py-2 px-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b">
              <td className="py-2 px-2">{cat.name}</td>
              <td className="py-2 px-2 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => navigate(`/categories/${cat.id}`)}
                    className="border px-2 py-1"
                  >
                    <HiOutlineEye />
                  </button>
                  <button
                    onClick={() => navigate(`/categories/edit/${cat.id}`)}
                    className="border px-2 py-1"
                  >
                    <HiOutlinePencil />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="border px-2 py-1"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;