import { FaReact } from "react-icons/fa6";
import { HiOutlineMoon, HiOutlineSun, HiOutlineBell, HiOutlineMenu } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSidebar } from "../features/dashboard/dashboardSlice";
import { Link, useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import { toggleDarkMode } from "../features/darkMode/darkModeSlice";
import { useEffect, useState } from "react";
import { logout } from "../utils/auth";
import api from "../utils/api"; 

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  profileImageUrl?: string;
}

const Header = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.darkMode);
  const [user, setUser] = useState<User | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

 const fetchUser = async () => {
  try {
    const res = await api.get("/auth/me");
    setUser(res.data.user);
  } catch (err) {
    console.error("Error fetching user:", err);
    setUser(null);
  }
};

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <header className="dark:bg-blackPrimary bg-whiteSecondary relative">
      <div className="flex justify-between items-center px-9 py-5 max-xl:flex-col max-xl:gap-y-7 max-[400px]:px-4">
        <HiOutlineMenu
          className="text-2xl dark:text-whiteSecondary text-blackPrimary absolute bottom-7 left-5 xl:hidden max-sm:static max-sm:order-1 cursor-pointer"
          onClick={() => dispatch(setSidebar())}
        />
        <Link to="/">
          <FaReact className="text-4xl dark:text-whiteSecondary text-blackPrimary hover:rotate-180 hover:duration-1000 hover:ease-in-out cursor-pointer" />
        </Link>
        <SearchInput />
        <div className="flex gap-4 items-center max-xl:justify-center relative">
          <span className="dark:text-whiteSecondary text-blackPrimary">EN</span>
          {darkMode ? (
            <HiOutlineSun
              onClick={() => dispatch(toggleDarkMode())}
              className="text-xl dark:text-whiteSecondary text-blackPrimary cursor-pointer"
            />
          ) : (
            <HiOutlineMoon
              onClick={() => dispatch(toggleDarkMode())}
              className="text-xl dark:text-whiteSecondary text-blackPrimary cursor-pointer"
            />
          )}
          <Link to="/notifications">
            <HiOutlineBell className="text-xl dark:text-whiteSecondary text-blackPrimary" />
          </Link>

          {/* Profile menu */}
          {/* Profile menu */}
      <div className="relative">
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={() => setOpenMenu(!openMenu)}
        >
          {user?.profileImageUrl ? (
  <img
    src={user.profileImageUrl}
    alt="profile"
    className="rounded-full w-10 h-10"
  />
) : (
  <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gray-400 text-white font-bold">
    {user?.name
      ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "?"}
  </div>
)}


          <div className="flex flex-col">
            <p className="dark:text-whiteSecondary text-blackPrimary text-base max-xl:text-sm">
              {user?.name || "Guest User"}
            </p>
            <p className="dark:text-whiteSecondary text-blackPrimary text-sm max-xl:text-xs">
              {user?.role || "Visitor"}
            </p>
          </div>
        </div>

            {/* Dropdown */}
            {openMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setOpenMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
