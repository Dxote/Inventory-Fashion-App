import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchCategory();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await api.get(`/categories/${id}`);
      setName(res.data.name);
      setParentId(res.data.parentId ?? "");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) return alert("Name field cannot be empty!");
    try {
      await api.put(`/categories/${id}`, { name: name.trim(), parentId: parentId || null });
      alert("✅ Category updated!");
      navigate("/categories");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update category");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Category</h2>

      <div className="mb-4">
        <label className="block mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="border px-3 py-2 w-full" />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Parent Category</label>
        <select value={parentId} onChange={(e) => setParentId(Number(e.target.value) || "")} className="border px-3 py-2 w-full">
          <option value="">No parent</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={handleUpdate} className="border px-4 py-2">Update</button>
      </div>
    </div>
  );
};

export default CategoryEdit;