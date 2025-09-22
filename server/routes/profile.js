import express from "express";
import { updateProfile, uploadProfilePicture } from "../controllers/profileController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.patch("/:userId", updateProfile);
router.post("/:userId/upload", upload.single("profileImage"), uploadProfilePicture);

export default router;
