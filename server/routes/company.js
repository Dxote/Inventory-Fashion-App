import express from "express";
import { getCompanyProfile, upsertCompanyProfile, uploadCompanyLogo } from "../controllers/companyController.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/", getCompanyProfile);
router.patch("/", upsertCompanyProfile);
router.post("/logo", upload.single("logo"), uploadCompanyLogo);

export default router;
