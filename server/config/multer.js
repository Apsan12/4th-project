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
  // accept any file field to avoid 'Unexpected field' MulterError when clients
  // use different field names. We'll pick the first image-like file available.
  upload.any(),
  async (req, res, next) => {
    console.log("🟡 MIDDLEWARE STEP 2: Multer middleware running...");
    // multer sets req.file for single, req.files for any/multiple
    const pickFile = () => {
      if (req.file) return req.file;
      if (Array.isArray(req.files) && req.files.length) {
        // prefer common field names if present
        const preferred = ["userImage", "image", "file", "avatar"];
        for (const name of preferred) {
          const found = req.files.find((f) => f.fieldname === name);
          if (found) return found;
        }
        // fallback to the first file
        return req.files[0];
      }
      return null;
    };

    const file = pickFile();
    // ensure controllers relying on req.file still work
    if (!req.file && file) req.file = file;
    console.log("📁 File received:", file ? "YES" : "NO");
    console.log("📋 Body before processing:", req.body);

    if (file) {
      try {
        console.log("🚀 Uploading user image to Cloudinary...");
        console.log("📄 File details:", {
          originalname: file.originalname,
          fieldname: file.fieldname,
          mimetype: file.mimetype,
          size: file.size,
        });

        const imageUrl = await uploadToCloudinary(file, "bus-management/users");
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
  // accept any field to be tolerant to client-side naming
  upload.any(),
  async (req, res, next) => {
    const pickFile = () => {
      if (req.file) return req.file;
      if (Array.isArray(req.files) && req.files.length) {
        const preferred = ["busImage", "image", "file", "photo"];
        for (const name of preferred) {
          const found = req.files.find((f) => f.fieldname === name);
          if (found) return found;
        }
        return req.files[0];
      }
      return null;
    };

    const file = pickFile();
    if (file) {
      try {
        console.log("🚀 Uploading bus image to Cloudinary...");
        const imageUrl = await uploadToCloudinary(file, "bus-management/buses");
        req.body.imageUrl = imageUrl;
        console.log("✅ Bus image uploaded:", imageUrl);
      } catch (error) {
        console.error("❌ Bus upload failed:", error);
        return res.status(500).json({
          success: false,
          message: "Bus image upload failed",
        });
      }
    } else {
      console.log("ℹ️ No bus file uploaded");
    }
    next();
  },
];
