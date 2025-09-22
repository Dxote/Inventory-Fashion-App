import { HiOutlineSave } from "react-icons/hi";
import {
  ImageUpload,
  InputWithLabel,
  Sidebar,
  SimpleInput,
  WhiteButton,
} from "../components";
import SelectInput from "../components/SelectInput";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();

  const [parentCategories, setParentCategories] = useState<{ label: string; value: string }[]>([]);
  const [subCategories, setSubCategories] = useState<{ label: string; value: string }[]>([]);
  const [selectedParent, setSelectedParent] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  const formatCurrency = (value: string | number) => {
    const number = Number(value || 0);
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(number);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, catRes] = await Promise.all([api.get(`/products/${id}`), api.get("/categories")]);
        const allCategories = catRes.data;
        const parentMapped = allCategories
          .filter((cat: any) => !cat.parentId)
          .map((cat: any) => ({ label: cat.name, value: String(cat.id) }));
        setParentCategories([{ label: "Select categories", value: "" }, ...parentMapped]);

        const prod = productRes.data;
        // find product category and determine parent if any
        const prodCat = allCategories.find((c: any) => c.id === prod.categoryId);

        if (prodCat?.parentId) {
          setSelectedParent(String(prodCat.parentId));
          const subMapped = allCategories
            .filter((c: any) => c.parentId === prodCat.parentId)
            .map((c: any) => ({ label: c.name, value: String(c.id) }));
          setSubCategories([{ label: "Select Subcategories", value: "" }, ...subMapped]);
        } else {
          // if product category has no parent (category is a parent category)
          setSelectedParent("");
          setSubCategories([{ label: "Select Subcategories", value: "" }]);
        }

        setFormData({
          name: prod.name,
          description: prod.description || "",
          price: String(prod.price ?? ""),
          stock: String(prod.stock ?? ""),
          categoryId: prod.categoryId ? String(prod.categoryId) : "",
          imageUrl: prod.imageUrl || "",
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleParentChange = async (parentId: string) => {
    setSelectedParent(parentId);
    setFormData((p) => ({ ...p, categoryId: "" }));
    if (!parentId) {
      setSubCategories([{ label: "Select Subcategories", value: "" }]);
      return;
    }
    try {
      const res = await api.get(`/categories/${parentId}/subcategories`);
      const mapped = res.data.map((sub: any) => ({ label: sub.name, value: String(sub.id) }));
      setSubCategories([{ label: "Select Subcategories", value: "" }, ...mapped]);
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
      setSubCategories([{ label: "Select Subcategories", value: "" }]);
    }
  };

  // price input handler, keep numeric string
  const handlePriceInput = (raw: string) => {
    let cleaned = raw.replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) cleaned = parts[0] + "." + parts.slice(1).join("");
    setFormData((p) => ({ ...p, price: cleaned }));
  };

  const handleChange = (field: string, value: string) => {
    if (field === "price") return handlePriceInput(value);
    setFormData({ ...formData, [field]: value });
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) return alert("Product name required");
    try {
      await api.put(`/products/${id}`, {
        name: formData.name.trim(),
        description: formData.description || null,
        price: parseFloat(formData.price || "0"),
        stock: parseInt(formData.stock || "0", 10),
        imageUrl: formData.imageUrl || null,
        categoryId: formData.categoryId
          ? Number(formData.categoryId)
          : selectedParent
          ? Number(selectedParent)
          : null,
      });
      alert("Product updated!");
      window.location.href = "/products";
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product");
    }
  };

  return (
    <div className="h-auto border-t border-blackSecondary flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="w-full">
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold dark:text-whiteSecondary">Edit product</h2>

          <div className="grid grid-cols-2 gap-10 mt-6 max-xl:grid-cols-1">
            {/* Left form */}
            <div className="flex flex-col gap-5">
              <InputWithLabel label="Product name">
                <SimpleInput type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </InputWithLabel>

              <InputWithLabel label="Description">
                <textarea
                  className="w-full h-32 border-2 border-black p-2 resize-none focus:outline-none"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter description..."
                />
              </InputWithLabel>

              <InputWithLabel label="Price">
                <SimpleInput
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
                <div className="text-sm text-gray-500 mt-1">{formatCurrency(formData.price || 0)}</div>
              </InputWithLabel>

              <InputWithLabel label="Stock">
                <SimpleInput type="number" value={formData.stock} onChange={(e) => handleChange("stock", e.target.value)} />
              </InputWithLabel>

              <InputWithLabel label="Category Parent">
                <SelectInput selectList={parentCategories} value={selectedParent} onChange={(e) => handleParentChange(e.target.value)} />
              </InputWithLabel>

              {selectedParent && subCategories.length > 0 && (
                <InputWithLabel label="Subcategory">
                  <SelectInput selectList={subCategories} value={formData.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)} />
                </InputWithLabel>
              )}
            </div>

            {/* Right form */}
            <div className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold dark:text-whiteSecondary mb-3">Upload product image</h3>
              <ImageUpload uploadPath={`/products/${id}/upload`} fieldName="image" onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })} />
              {formData.imageUrl && (
                <div className="mt-4">
                  <img src={formData.imageUrl} alt="product" className="w-36 h-32 rounded-lg object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <WhiteButton textSize="lg" width="48" py="2" text="Update product" onClick={handleUpdate}>
              <HiOutlineSave className="dark:text-blackPrimary text-whiteSecondary text-xl" />
            </WhiteButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;