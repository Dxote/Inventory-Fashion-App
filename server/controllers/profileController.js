import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "path";

const prisma = new PrismaClient();

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password, address, mobile, gender } = req.body;
  try {
    console.log("Incoming update:", { userId, name, email, address, mobile, gender });

    const updateData = { name, email, address, mobile, gender };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
    });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Error updating profile" });
  }
};


// UPLOAD PROFILE PICTURE
export const uploadProfilePicture = async (req, res) => {
  const { userId } = req.params;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { profileImageUrl: imageUrl },
    });
    res.json({ message: "Profile updated", profile_image_url: imageUrl }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile image" });
  }
};
