import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import { HiOutlineTrash, HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import WhiteButton from "../components/WhiteButton"; // pastikan path sesuai

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Category | null>(null);
  const [subName, setSubName] = useState("");

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/categories/${id}`);
      setCategory(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load category details");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const openModal = (sub?: Category) => {
    if (sub) {
      setEditingSub(sub);
      setSubName(sub.name);
    } else {
      setEditingSub(null);
      setSubName("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubName("");
    setEditingSub(null);
  };

  const handleSave = async () => {
    if (!subName.trim()) return;

    try {
      if (editingSub) {
        await api.put(`/categories/${editingSub.id}`, {
          name: subName,
          parentId: id,
        });
        alert("Subcategory updated successfully!");
      } else {
        await api.post("/categories", { name: subName, parentId: id });
        alert("Subcategory created successfully!");
      }
      closeModal();
      fetchDetail();
    } catch (err) {
      console.error(err);
      alert("Failed to save subcategory");
    }
  };

  const handleDeleteSub = async (subId: number) => {
    if (!confirm("Delete this sub-category?")) return;
    try {
      await api.delete(`/categories/${subId}`);
      alert("Subcategory deleted successfully!");
      fetchDetail();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete sub-category");
    }
  };

  if (!category) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">
          {category.name} — Subcategories
        </h2>
        <WhiteButton
          link="#"
          text="Add Subcategory"
          textSize="lg"
          py="2"
          width="48"
          onClick={() => openModal()}
        >
          <HiOutlinePlus className="dark:text-blackPrimary text-whiteSecondary" />
        </WhiteButton>
      </div>

      <table className="w-full border text-left">
        <thead>
          <tr>
            <th className="py-2 px-2">Name</th>
            <th className="py-2 px-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {category.children?.map((child) => (
            <tr key={child.id} className="border-b">
              <td className="py-2 px-2">{child.name}</td>
              <td className="py-2 px-2 text-right flex justify-end gap-2">
                <button
                  onClick={() => openModal(child)}
                  className="border px-2 py-1"
                >
                  <HiOutlinePencil />
                </button>
                <button
                  onClick={() => handleDeleteSub(child.id)}
                  className="border px-2 py-1"
                >
                  <HiOutlineTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingSub ? "Edit Subcategory" : "Add Subcategory"}
            </h3>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="Subcategory name"
              className="border px-2 py-1 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-black text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
