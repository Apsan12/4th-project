import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Simple memory storage
const storage = multer.memoryStorage();

// Upload to Cloudinary function
const uploadToCloudinary = async (file, folder = "bus-management/users") => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: folder,
        public_id: `${folder.includes("users") ? "user" : "bus"}-${Date.now()}`,
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
        resource_type: "image",
      }
    );
    return result.secure_url;
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Simple multer config
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  },
});

// Combined middleware that handles upload AND Cloudinary
export const uploadUserImage = [
  (req, res, next) => {
    console.log("🟢 MIDDLEWARE STEP 1: Before multer");
    next();
  },
  upload.single("userImage"),
  async (req, res, next) => {
    console.log("� MIDDLEWARE STEP 2: Multer middleware running...");
    console.log("📁 File received:", req.file ? "YES" : "NO");
    console.log("📋 Body before processing:", req.body);

    if (req.file) {
      try {
        console.log("🚀 Uploading user image to Cloudinary...");
        console.log("📄 File details:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });

        const imageUrl = await uploadToCloudinary(
          req.file,
          "bus-management/users"
        );
        req.body.imageUrl = imageUrl;
        console.log("✅ Image uploaded:", imageUrl);
        console.log("📋 Body after processing:", req.body);
      } catch (error) {
        console.error("❌ Upload failed:", error);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }
    } else {
      console.log("ℹ️ No file uploaded, skipping Cloudinary upload");
    }
    next();
  },
];

export const uploadBusImage = [
  upload.single("busImage"),
  async (req, res, next) => {
    if (req.file) {
      try {
        console.log("🚀 Uploading bus image to Cloudinary...");
        const imageUrl = await uploadToCloudinary(
          req.file,
          "bus-management/buses"
        );
        req.body.imageUrl = imageUrl;
        console.log("✅ Bus image uploaded:", imageUrl);
      } catch (error) {
        console.error("❌ Bus upload failed:", error);
        return res.status(500).json({
          success: false,
          message: "Bus image upload failed",
        });
      }
    }
    next();
  },
];
