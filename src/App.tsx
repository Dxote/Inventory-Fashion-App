import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  Categories,
  CategoryDetail,
  CreateCategory,
  CreateOrder,
  CreateProduct,
  CreateStock,
  CreateUser,
  EditCategory,
  EditOrder,
  EditProduct,
  EditStock,
  EditUser,
  HelpDesk,
  HomeLayout,
  Landing,
  LandingV2,
  Login,
  Notifications,
  Orders,
  Products,
  Profile,
  Register,
  Stocks,
  Users,
  CompanyProfile,
  AuditLog,
} from "./pages";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  // {
  //   path: "/register",
  //   element: <Register />,
  // },

  // protected route
  {
    element: <ProtectedRoute />, // check auth/token
    children: [
      {
        path: "/",
        element: <HomeLayout />,
        children: [
          { index: true, element: <Landing /> },
          { path: "landing-v2", element: <LandingV2 /> },
          { path: "products", element: <Products /> },
          { path: "products/create-product", element: <CreateProduct /> },
          { path: "products/edit/:id", element: <EditProduct /> },
          { path: "categories", element: <Categories /> },
          { path: "categories/create-category", element: <CreateCategory /> },
          { path: "categories/edit/:id", element: <EditCategory /> },
          { path: "categories/:id", element: <CategoryDetail /> },
          { path: "orders", element: <Orders /> },
          { path: "orders/create-order", element: <CreateOrder /> },
          { path: "orders/1", element: <EditOrder /> },
          { path: "stocks", element: <Stocks /> },
          { path: "stocks/edit/:id", element: <EditStock /> },
          { path: "stocks/create-Stock", element: <CreateStock /> },
          { path: "users", element: <Users /> },
          { path: "users/edit/:id", element: <EditUser /> },
          { path: "users/create-user", element: <CreateUser /> },
          { path: "help-desk", element: <HelpDesk /> },
          { path: "notifications", element: <Notifications /> },
          { path: "profile", element: <Profile /> },
          { path: "company-profile", element: <CompanyProfile /> },

          // nested specific role only
          {
            element: <RoleProtectedRoute allowedRoles={["SUPERADMIN"]} />,
            children: [
              { path: "audit-log", element: <AuditLog /> },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
