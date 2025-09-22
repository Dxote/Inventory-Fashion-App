import { useEffect, useState } from "react";
import api from "../utils/api";
import { Sidebar, InputWithLabel, SimpleInput, WhiteButton, ImageUpload } from "../components";
import { HiOutlineSave } from "react-icons/hi";

const CompanyProfile = () => {
  const [company, setCompany] = useState({
    name: "",
    address: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/company");
        if (res.data) {
          setCompany(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompany();
  }, []);

  const handleSave = async () => {
  try {
    await api.patch("/company", {
      ...company,
      logoUrl: company.logoUrl,
    });
    alert("Company profile saved!");
  } catch (err) {
    console.error(err);
    alert("Failed to save company");
  }
};

  return (
    <div className="flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="p-6 w-full">
        <h2 className="text-3xl font-bold mb-4 dark:text-whiteSecondary text-blackPrimary">
          Company Profile
        </h2>
        <div className="flex flex-col gap-4 max-w-xl">
          {company.logoUrl && (
            <img src={company.logoUrl} alt="Logo" className="w-32 h-32 object-contain mb-4" />
          )}

          <ImageUpload
            onUploadSuccess={(url: string) =>
              setCompany((prev) => ({ ...prev, logoUrl: url }))
            }
          />

          <InputWithLabel label="Company Name">
            <SimpleInput
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              placeholder="Company Name"
            />
          </InputWithLabel>
          <InputWithLabel label="Address">
            <SimpleInput
              value={company.address}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              placeholder="Company Address"
            />
          </InputWithLabel>
          <InputWithLabel label="Postal Code">
            <SimpleInput
              type="text"
              value={company.postalCode}
              onChange={(e) =>setCompany({ ...company, postalCode: e.target.value })}
              placeholder="Company Postal Code"
            />
          </InputWithLabel>
          <InputWithLabel label="Phone">
            <SimpleInput
              value={company.phone}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              placeholder="Company Phone"
            />
          </InputWithLabel>
          <InputWithLabel label="Email">
            <SimpleInput
              value={company.email}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              placeholder="Company Email"
            />
          </InputWithLabel>
          <InputWithLabel label="Website">
            <SimpleInput
              value={company.website}
              onChange={(e) => setCompany({ ...company, website: e.target.value })}
              placeholder="Company Website"
            />
          </InputWithLabel>

          <WhiteButton onClick={handleSave} text="Save" textSize="lg" py="2" width="40">
            <HiOutlineSave className="dark:text-blackPrimary text-whiteSecondary text-xl" />
          </WhiteButton>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
