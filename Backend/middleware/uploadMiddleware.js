import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "resin-art-store",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],

      // ✅ Better clean filename
      public_id: `${Date.now()}-${file.originalname
        .replace(/\.[^/.]+$/, "")
        .replace(/\s+/g, "-")
        .toLowerCase()}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // ✅ 10MB per image
});

/**
 * ✅ Upload up to 6 images
 * Frontend must send them as: images
 */
export const uploadMultiple = upload.array("images", 6);

export default upload;
