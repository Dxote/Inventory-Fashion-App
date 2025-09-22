import { PrismaClient } from "@prisma/client";
import { logUserAction, logUpdateAction } from "../utils/audit.js";

const prisma = new PrismaClient();

// GET COMPANY PROFILE
export const getCompanyProfile = async (req, res) => {
  try {
    const company = await prisma.companyProfile.findFirst();
    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Error fetching company profile" });
  }
};

// CREATE/UPDATE COMPANY PROFILE (UPSERT)
export const upsertCompanyProfile = async (req, res) => {
  const { name, address, phone, email, postalCode, website, logoUrl } = req.body;
  try {
    const company = await prisma.companyProfile.findFirst();
    let updated;

    if (company) {
      const oldCompany = { ...company };

      updated = await prisma.companyProfile.update({
        where: { id: company.id },
        data: { name, address, phone, email, postalCode, website, logoUrl },
      });

      // gunakan reusable logger
      await logUpdateAction({
        reqUser: req.user,
        entity: "CompanyProfile",
        entityId: updated.id,
        oldData: oldCompany,
        newData: updated,
      });
    } else {
      updated = await prisma.companyProfile.create({
        data: { name, address, phone, email, postalCode, website, logoUrl },
      });

      await logUserAction({
        reqUser: req.user,
        action: "CREATE",
        entity: "CompanyProfile",
        target: updated,
      });
    }

    res.json({ message: "Company profile saved", company: updated });
  } catch (err) {
    res.status(500).json({ message: "Error saving company profile" });
  }
};

// UPLOAD COMPANY LOGO
export const uploadCompanyLogo = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  try {
    const company = await prisma.companyProfile.findFirst();
    let updated;

    if (company) {
      const oldCompany = { ...company };

      updated = await prisma.companyProfile.update({
        where: { id: company.id },
        data: { logoUrl },
      });

      await logUpdateAction({
        reqUser: req.user,
        entity: "CompanyProfile",
        entityId: updated.id,
        oldData: oldCompany,
        newData: updated,
      });
    } else {
      updated = await prisma.companyProfile.create({
        data: { name: "Company", logoUrl },
      });

      await logUserAction({
        reqUser: req.user,
        action: "CREATE",
        entity: "CompanyProfile",
        target: updated,
      });
    }

    res.json({ message: "Logo updated", logoUrl: updated.logoUrl });
  } catch (err) {
    res.status(500).json({ message: "Error uploading logo" });
  }
};