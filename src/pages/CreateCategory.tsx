import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineSave } from "react-icons/hi";
import {
  Sidebar,
  InputWithLabel,
  SimpleInput,
  WhiteButton,
} from "../components";
import SelectInput from "../components/SelectInput";
import api from "../utils/api";

const CategoryCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return alert("Name field cannot be empty!");
    try {
      await api.post("/categories", {
        name: formData.name.trim(),
        parentId: formData.parentId || null,
      });
      alert("Category Added");
      navigate("/categories");
    } catch (err) {
      console.error(err);
      alert("Failed to add Category");
    }
  };

  return (
    <div className="h-auto border-t border-blackSecondary flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="w-full">
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold dark:text-whiteSecondary">
            Add new category
          </h2>

          <div className="grid grid-cols-2 gap-10 mt-6 max-xl:grid-cols-1">
            <div className="flex flex-col gap-5">
              <InputWithLabel label="Category name">
                <SimpleInput
                  type="text"
                  placeholder="Enter category name..."
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Parent category (optional)">
                <SelectInput
                  selectList={[
                    { label: "-- no parent --", value: "" },
                    ...categories.map((c) => ({
                      label: c.name,
                      value: c.id.toString(),
                    })),
                  ]}
                  value={formData.parentId}
                  onChange={(e) => handleChange("parentId", e.target.value)}
                />
              </InputWithLabel>
            </div>
          </div>

          <div className="mt-6">
            <WhiteButton
              textSize="lg"
              width="48"
              py="2"
              text="Add category"
              onClick={handleSubmit}
            >
              <HiOutlineSave className="dark:text-blackPrimary text-whiteSecondary text-xl" />
            </WhiteButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCreate;
