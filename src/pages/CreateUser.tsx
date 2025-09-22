import { HiOutlineSave } from "react-icons/hi";
import {
  ImageUpload,
  InputWithLabel,
  Sidebar,
  SimpleInput,
  WhiteButton,
} from "../components";
import SelectInput from "../components/SelectInput";
import { roles, genders } from "../utils/data";
import { useState } from "react";
import api from "../utils/api";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: roles[0].value,
    gender: genders[0].value,
    address: "",
    mobile: "",
  });

  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const userData = {
      ...formData,
      name: formData.name + " " + formData.lastname,
      profileImageUrl: uploadedUrl,
    };

  console.log("uploadedUrl state:", uploadedUrl, typeof uploadedUrl);
  console.log("userData keys:", Object.keys(userData));
  console.log("userData JSON:", JSON.stringify(userData));

    try {
      const res = await api.post("/users", userData);
      console.log("User created:", res.data);
      alert("User created successfully!");
      window.location.href = "/users";
    } catch (err) {
      console.error("Error creating user:", err);
      alert("Failed to create user");
    }
  };

  return (
    <div className="h-auto border-t border-blackSecondary flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="w-full">
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold dark:text-whiteSecondary">
            Add new user
          </h2>

          <div className="grid grid-cols-2 gap-10 mt-6 max-xl:grid-cols-1">
            {/* Left form */}
            <div className="flex flex-col gap-5">
              <InputWithLabel label="Name">
                <SimpleInput
                  type="text"
                  placeholder="Enter first name..."
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Lastname">
                <SimpleInput
                  type="text"
                  placeholder="Enter last name..."
                  value={formData.lastname}
                  onChange={(e) => handleChange("lastname", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Email">
                <SimpleInput
                  type="email"
                  placeholder="Enter email..."
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Password">
                <SimpleInput
                  type="password"
                  placeholder="Enter password..."
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Confirm password">
                <SimpleInput
                  type="password"
                  placeholder="Confirm password..."
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                />
              </InputWithLabel>

              <InputWithLabel label="Select role">
                <SelectInput
                  selectList={roles}
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                />
              </InputWithLabel>
            </div>

            {/* Right form */}
            <div className="flex flex-col gap-5">
              <InputWithLabel label="Gender">
                <SelectInput
                  selectList={genders}
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Address">
                <textarea
                  className="w-full h-24 border-2 border-black p-2 resize-none focus:outline-none"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Enter address..."
                />
              </InputWithLabel>

              <InputWithLabel label="Mobile">
                <SimpleInput
                  type="text"
                  placeholder="Enter mobile number..."
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
              </InputWithLabel>

              <div>
                <h3 className="text-2xl font-bold dark:text-whiteSecondary mb-3">
                  Upload user image
                </h3>
                <ImageUpload
                  onUploadSuccess={(url) => {
                        console.log("Image uploaded URL (from component):", url);
                    setUploadedUrl(url); 
                  }}
                />
                {uploadedUrl && (
                  <div className="mt-4">
                    <img
                      src={uploadedUrl}
                      alt="profile"
                      className="w-36 h-32 rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-6">
            <WhiteButton
              textSize="lg"
              width="48"
              py="2"
              text="Publish user"
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

export default CreateUser;
