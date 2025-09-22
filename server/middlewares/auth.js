import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  const header =
    req.headers["authorization"] ||
    req.headers["x-access-token"] ||
    req.query?.token ||
    (req.cookies && req.cookies.token);

  if (!header) {
    console.log("[auth] no token found in headers/query/cookies");
    return res.status(401).json({ message: "No token provided" });
  }

  // 3) Jika header berbentuk "Bearer <token>", potong prefixnya
  const token = typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice(7)
    : header;

  if (!token) {
    console.log("[auth] token missing after parsing authorization header");
    return res.status(401).json({ message: "No token provided" });
  }

  // 4) Pastikan JWT_SECRET ada
  if (!process.env.JWT_SECRET) {
    console.error("[auth] JWT_SECRET not set in environment");
    return res.status(500).json({ message: "Server configuration error" });
  }

  // 5) Verify token, set req.user
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("[auth] token verified:", {
      id: decoded.id ?? decoded.userId ?? null,
      email: decoded.email ?? null,
      role: decoded.role ?? null,
    });
    return next();
  } catch (err) {
    console.error("[auth] jwt verify error:", err?.name, err?.message);
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};