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
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
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
    profileImageUrl: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        const [firstName, ...rest] = res.data.name.split(" ");
        setFormData({
          name: firstName,
          lastname: rest.join(" "),
          email: res.data.email,
          password: "",
          confirmPassword: "",
          role: res.data.role,
          gender: res.data.gender || genders[0].value,
          address: res.data.address || "",
          mobile: res.data.mobile || "",
          profileImageUrl: res.data.profileImageUrl || "",
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

const handleUpdate = async () => {
  if (formData.password && formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    await api.put(`/users/${id}`, {
      name: formData.name + " " + formData.lastname,
      email: formData.email,
      password: formData.password || undefined,
      role: formData.role,
      gender: formData.gender,
      address: formData.address,
      mobile: formData.mobile,
      profileImageUrl: formData.profileImageUrl,
    });
    alert("User updated!");
    window.location.href = "/users";
  } catch (error) {
    console.error(error);
    alert("Failed to update user");
  }
};

  return (
    <div className="h-auto border-t border-blackSecondary flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="w-full">
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold dark:text-whiteSecondary">
            Edit user
          </h2>

          <div className="grid grid-cols-2 gap-10 mt-6 max-xl:grid-cols-1">
            {/* Left form */}
            <div className="flex flex-col gap-5">
              <InputWithLabel label="Name">
                <SimpleInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Lastname">
                <SimpleInput
                  type="text"
                  value={formData.lastname}
                  onChange={(e) => handleChange("lastname", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Email">
                <SimpleInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Password">
                <SimpleInput
                  type="password"
                  placeholder="Enter new password (optional)"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </InputWithLabel>

              <InputWithLabel label="Confirm password">
                <SimpleInput
                  type="password"
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
                  type="number"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                />
              </InputWithLabel>

              <div>
                <h3 className="text-2xl font-bold dark:text-whiteSecondary mb-3">
                  Upload user image
                </h3>
                <ImageUpload
                  uploadPath={`/users/${id}/upload`} 
                  fieldName="image"                  
                  onUploadSuccess={(url) => {
                    console.log("Image uploaded URL:", url);
                    setFormData({ ...formData, profileImageUrl: url });
                  }}
                />

                {formData.profileImageUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.profileImageUrl}
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
              text="Update user"
              onClick={handleUpdate}
            >
              <HiOutlineSave className="dark:text-blackPrimary text-whiteSecondary text-xl" />
            </WhiteButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
