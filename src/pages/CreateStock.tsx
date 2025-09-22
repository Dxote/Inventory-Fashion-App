import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  InputWithLabel,
  SimpleInput,
  WhiteButton,
} from "../components";
import SelectInput from "../components/SelectInput";
import { HiOutlineSave } from "react-icons/hi";

const CreateStock = () => {
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({
    productId: "",
    direction: "IN",
    quantity: "",
    note: "",
    sourceType: "",
    sourceId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    if (!form.productId) return alert("Select product");
    if (!form.quantity || Number(form.quantity) <= 0) return alert("Quantity must be > 0");

    try {
      await api.post("/stocks", {
        productId: Number(form.productId),
        direction: form.direction,
        quantity: Number(form.quantity),
        note: form.note || null,
        sourceType: form.sourceType || null,
        sourceId: form.sourceId ? Number(form.sourceId) : null,
      });
      alert("Stock movement created");
      navigate("/stocks");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Failed to create");
    }
  };

  return (
    <div className="h-auto border-t border-blackSecondary flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="w-full">
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold dark:text-whiteSecondary">Add Stock Movement</h2>

          <div className="grid grid-cols-2 gap-10 mt-6 max-xl:grid-cols-1">
            <div className="flex flex-col gap-5">
              <InputWithLabel label="Product">
                <SelectInput
                  selectList={[
                    { label: "-- Select Product --", value: "" },
                    ...products.map((p) => ({ label: p.name, value: String(p.id) })),
                  ]}
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                />
              </InputWithLabel>

              <InputWithLabel label="Direction">
                <SelectInput
                  selectList={[
                    { label: "IN", value: "IN" },
                    { label: "OUT", value: "OUT" },
                  ]}
                  value={form.direction}
                  onChange={(e) => setForm({ ...form, direction: e.target.value })}
                />
              </InputWithLabel>

              <InputWithLabel label="Quantity">
                <SimpleInput
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </InputWithLabel>

              {/* <InputWithLabel label="Source Type (optional)">
                <SimpleInput
                  type="text"
                  value={form.sourceType}
                  onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                />
              </InputWithLabel>

              <InputWithLabel label="Source ID (optional)">
                <SimpleInput
                  type="text"
                  value={form.sourceId}
                  onChange={(e) => setForm({ ...form, sourceId: e.target.value })}
                />
              </InputWithLabel> */}

              <InputWithLabel label="Note">
                <textarea
                  className="w-full h-28 border-2 border-black p-2 resize-none focus:outline-none"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </InputWithLabel>
            </div>
          </div>

          <div className="mt-6">
            <WhiteButton
              textSize="lg"
              width="48"
              py="2"
              text="Create Stock"
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

export default CreateStock;