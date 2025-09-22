import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  profileImageUrl?: string | null;
}


const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    const res = await api.get("/users");
    setUsers(res.data);
  } catch (error) {
    console.error(error);
  }
};

const handleDelete = async (id: number) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    await api.delete(`/users/${id}`);
    setUsers(users.filter((u) => u.id !== id));
  } catch (error) {
    console.error(error);
  }
};


  return (
    <table className="mt-6 w-full whitespace-nowrap text-left max-lg:block max-lg:overflow-x-scroll">
      <thead className="border-b border-white/10 text-sm leading-6 dark:text-whiteSecondary text-blackPrimary">
        <tr>
          <th className="py-2 pl-4 pr-8 font-semibold">User</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Email address</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Role</th>
          <th className="py-2 pl-0 pr-8 font-semibold">Last Login</th>
          <th className="py-2 pl-0 pr-4 text-right font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {users.map((user) => (
          <tr key={user.id}>
            <td className="py-4 pl-4 pr-8">
              <div className="flex items-center gap-x-4">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="h-8 w-8 rounded-full bg-gray-800 object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "?"}
                  </div>
                )}
                <div className="truncate text-sm font-medium">{user.name}</div>
              </div>
            </td>
            <td className="py-4 pl-0 pr-4 text-sm">{user.email}</td>
            <td className="py-4 pl-0 pr-4 text-sm">{user.role}</td>
            <td className="py-4 pl-0 pr-8 text-sm">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
            </td>
            <td className="py-4 pl-0 pr-4 text-right text-sm">
              <div className="flex gap-x-1 justify-end">
                <Link to={`/users/edit/${user.id}`} className="border w-8 h-8 flex justify-center items-center">
                  <HiOutlinePencil />
                </Link>
                <Link to={`/users/${user.id}`} className="border w-8 h-8 flex justify-center items-center">
                  <HiOutlineEye />
                </Link>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="border w-8 h-8 flex justify-center items-center"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default UserTable;
