import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan"; 

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import userRoutes from "./routes/user.js";
import companyRoutes from "./routes/company.js";
import auditRoutes from "./routes/audit.js";
import categoryRoutes from "./routes/category.js";
import productRoutes from "./routes/product.js";
import uploadRoutes from "./routes/upload.js";
import stockRoutes from "./routes/stock.js";
import orderRoutes from "./routes/orderRoutes";
import { authMiddleware } from "./middlewares/auth.js";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(morgan("dev")); 

// Public Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);

// Routes
app.use("/api/profile", authMiddleware, profileRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/company", authMiddleware, companyRoutes);
app.use("/api/audit", authMiddleware, auditRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/stocks", authMiddleware, stockRoutes);
app.use("/orders", orderRoutes);


app.listen(4000, () => console.log("Server running"));