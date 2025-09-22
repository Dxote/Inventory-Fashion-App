import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { logUserAction, logUpdateAction } from "../utils/audit.js"; 
const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  console.log("RAW BODY:", req.body);

  const { name, email, password, role, address, mobile, gender, profileImageUrl } = req.body;

  console.log("PROFILE IMAGE FROM BODY:", profileImageUrl);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        address: address || null,
        mobile: mobile || null,
        gender: gender ? gender.toUpperCase() : null,
        profileImageUrl: profileImageUrl ?? null, 
      },
    });

    await logUserAction({ reqUser: req.user, action: "CREATE", entity: "User", target: newUser });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("ERROR CREATE USER:", error);
    res.status(500).json({ error: error.message });
  }

};

export const updateUser = async (req, res) => {

  const { id } = req.params;
  const { name, email, password, role, address, mobile, gender, profileImageUrl } = req.body;

  try {
    const oldUser = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!oldUser) return res.status(404).json({ message: "User not found" });

    const data = {
      name,
      email,
      role: role || "USER",
      address: address || null,
      mobile: mobile || null,
      gender: gender ? gender.toUpperCase() : null,
      profileImageUrl: profileImageUrl || null,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    // logging
    await logUpdateAction({
      reqUser: req.user,
      entity: "User",
      entityId: updatedUser.id,
      oldData: oldUser,
      newData: updatedUser,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadUserImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const { id } = req.params;
    if (!id) {
      return res.json({ message: "Upload success", url: imageUrl, filePath: `/uploads/${req.file.filename}` });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { profileImageUrl: imageUrl },
    });


    return res.json({ message: "User image uploaded", user: updatedUser, url: imageUrl });
  } catch (err) {
    console.error("uploadUserImage error:", err);
    return res.status(500).json({ message: "Error uploading image", error: err.message });
  }
};


export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await prisma.user.delete({ where: { id: Number(id) } });

    await logUserAction({ reqUser: req.user, action: "DELETE", entity: "User", target: deletedUser });


    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  
};
