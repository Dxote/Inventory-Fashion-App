import { HiOutlineSave, HiOutlineUpload } from "react-icons/hi";
import { InputWithLabel, Sidebar, SimpleInput, WhiteButton } from "../components";
import { useState, useEffect } from "react";
import api from "../utils/api";

const Profile = () => {
  const [inputObject, setInputObject] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    mobile: "",
    gender: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("");

  // Fetch user profile saat mount
  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      const user = res.data.user;
      setUserId(user.id);
      setRole(user.role);
      setInputObject({
        username: user.name,
        email: user.email,
        password: "",
        confirmPassword: "",
        address: user.address || "",
        mobile: user.mobile || "",
        gender: user.gender || "",
      });
      if (user.profileImageUrl) setProfileImage(user.profileImageUrl);
    } catch (err) {
      console.error(err);
    }
  };
  fetchProfile();
}, []);

const handleUpdateProfile = async () => {
  if (inputObject.password !== inputObject.confirmPassword) {
    alert("Password and confirm password do not match");
    return;
  }
  try {
    await api.patch(`/profile/${userId}`, {
  name: inputObject.username || undefined,
  email: inputObject.email || undefined,
  password: inputObject.password || undefined,
  address: inputObject.address || undefined,
  mobile: inputObject.mobile || undefined,
  gender: inputObject.gender || undefined,
});

    alert("Profile updated successfully");
    setInputObject({ ...inputObject, password: "", confirmPassword: "" });
  } catch (err) {
    console.error(err);
    alert("Error updating profile");
  }
};

const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profileImage", file);

  try {
    const res = await api.post(`/profile/${userId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setProfileImage(res.data.profileImageUrl);
    alert("Profile picture updated!");
  } catch (err) {
    console.error(err);
    alert("Error uploading profile picture");
  }
};


  return (
    <div className="h-auto border-t border-blackSecondary border-1 flex dark:bg-blackPrimary bg-whiteSecondary">
      <Sidebar />
      <div className="dark:bg-blackPrimary bg-whiteSecondary w-full">
        <div className="dark:bg-blackPrimary bg-whiteSecondary py-10">
          <div className="px-4 sm:px-6 lg:px-8 pb-8 border-b border-gray-800 flex justify-between items-center max-sm:flex-col max-sm:gap-5">
            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-bold leading-7 dark:text-whiteSecondary text-blackPrimary">
                Your Profile
              </h2>
              <p className="dark:text-whiteSecondary text-blackPrimary">
                Role: {role} {/* Role tampil tapi tidak bisa diubah */}
              </p>
            </div>
            <WhiteButton
              onClick={handleUpdateProfile}
              textSize="lg"
              width="48"
              py="2"
              text="Update profile"
            >
              <HiOutlineSave className="dark:text-blackPrimary text-whiteSecondary text-xl" />
            </WhiteButton>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 pb-8 pt-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center max-sm:flex-col max-sm:gap-10">
                <div className="flex items-center gap-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="rounded-full w-20 h-20"
              />
            ) : (
              <div className="rounded-full w-20 h-20 flex items-center justify-center bg-gray-400 text-white font-bold text-2xl">
                {inputObject.username
                  ? inputObject.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                    : "?"}
                </div>
              )}

                    <div>
                      <p className="dark:text-whiteSecondary text-blackPrimary text-xl">
                        {inputObject.username || "Loading..."}
                      </p>
                      <p className="dark:text-whiteSecondary text-blackPrimary">
                        {inputObject.email || ""}
                      </p>
                    </div>
                  </div>
                <label className="dark:bg-blackPrimary bg-whiteSecondary border border-gray-600 w-72 py-2 text-lg dark:hover:border-gray-500 hover:border-gray-400 duration-200 flex items-center justify-center gap-x-2 cursor-pointer">
                  <HiOutlineUpload className="dark:text-whiteSecondary text-blackPrimary text-xl" />
                  <span className="dark:text-whiteSecondary text-blackPrimary font-medium">
                    Change profile picture
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-3 mt-5">
                <InputWithLabel label="Your username">
                  <SimpleInput
                    type="text"
                    placeholder="Your username"
                    value={inputObject.username}
                    onChange={(e) =>
                      setInputObject({
                        ...inputObject,
                        username: e.target.value,
                      })
                    }
                  />
                </InputWithLabel>
                <InputWithLabel label="Your email">
                  <SimpleInput
                    type="text"
                    placeholder="Your email"
                    value={inputObject.email}
                    onChange={(e) =>
                      setInputObject({ ...inputObject, email: e.target.value })
                    }
                  />
                </InputWithLabel>
                <InputWithLabel label="Mobile phone">
                  <SimpleInput
                    type="text"
                    placeholder="Your mobile phone"
                    value={inputObject.mobile}
                    onChange={(e) =>
                      setInputObject({ ...inputObject, mobile: e.target.value })
                    }
                  />
                </InputWithLabel>
                <InputWithLabel label="Address">
                  <SimpleInput
                    type="text"
                    placeholder="Your address"
                    value={inputObject.address}
                    onChange={(e) =>
                      setInputObject({ ...inputObject, address: e.target.value })
                    }
                  />
                </InputWithLabel>
                <InputWithLabel label="Gender">
                  <SimpleInput
                    type="text"
                    placeholder="Your gender"
                    value={inputObject.gender}
                    onChange={(e) =>
                      setInputObject({ ...inputObject, gender: e.target.value })
                    }
                  />
                </InputWithLabel>
                <InputWithLabel label="New password">
                  <SimpleInput
                    type="password"
                    placeholder="Enter your new password..."
                    value={inputObject.password}
                    onChange={(e) =>
                      setInputObject({
                        ...inputObject,
                        password: e.target.value,
                      })
                    }
                  />
                </InputWithLabel>
                <InputWithLabel label="Confirm new password">
                  <SimpleInput
                    type="password"
                    placeholder="Confirm your new password..."
                    value={inputObject.confirmPassword}
                    onChange={(e) =>
                      setInputObject({
                        ...inputObject,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </InputWithLabel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
