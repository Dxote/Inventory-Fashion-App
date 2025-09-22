import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "./utils/api";

interface User {
  id: number;
  role: string;
}

const RoleProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return null; 

  if (!user) return <Navigate to="/login" replace />;

  return allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
};

export default RoleProtectedRoute;
