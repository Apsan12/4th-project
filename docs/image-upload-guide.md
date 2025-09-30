# Image Upload Setup Guide

## 📁 Files Created/Updated:

### 1. Multer Configuration (`/middleware/multer.js`)

- Handles file upload configuration
- Sets up storage paths for users and buses
- Validates file types and sizes
- Includes error handling

### 2. Image Processing Middleware (`/middleware/imageProcessor.js`)

- Processes uploaded images and generates URLs
- Validates image files
- Cleans up files on errors
- Ensures upload directories exist

### 3. Updated Services:

- **User Service**: Added `updateUserProfile()` function
- **Bus Service**: Added `createBusWithImage()` and `updateBusWithImage()` functions

### 4. Updated Validations:

- **User Validation**: Added `imageUrl` field and `updateUserSchema`
- **Bus Validation**: Added `imageUrl` field to create and update schemas

## 🚀 How to Use in Controllers:

### For User Profile Update with Image:

```javascript
import { uploadUserImage, handleMulterError } from "../middleware/multer.js";
import {
  processUserImage,
  validateImageFile,
  cleanupOnError,
} from "../middleware/imageProcessor.js";
import { updateUserProfile } from "../services/user.service.js";

// Route setup
userRoute.put(
  "/update-profile",
  authenticated,
  uploadUserImage,
  handleMulterError,
  validateImageFile,
  processUserImage,
  cleanupOnError,
  updateUserController
);

// Controller function
export const updateUserController = async (req, res) => {
  try {
    const userId = req.user.id; // From authentication middleware
    const updateData = req.body; // Will include imageUrl if image was uploaded

    const updatedUser = await updateUserProfile(userId, updateData, req.file);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
```

### For Bus Creation with Image:

```javascript
import { uploadBusImage, handleMulterError } from "../middleware/multer.js";
import {
  processBusImage,
  validateImageFile,
  cleanupOnError,
} from "../middleware/imageProcessor.js";
import { createBusWithImage } from "../services/bus.service.js";

// Route setup
busRoute.post(
  "/create",
  authenticated,
  authorization("admin"),
  uploadBusImage,
  handleMulterError,
  validateImageFile,
  processBusImage,
  cleanupOnError,
  createBusController
);

// Controller function
export const createBusController = async (req, res) => {
  try {
    const busData = req.body; // Will include imageUrl if image was uploaded

    const newBus = await createBusWithImage(busData, req.file);

    res.status(201).json({
      success: true,
      message: "Bus created successfully",
      bus: newBus,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
```

## 📋 Installation Requirements:

1. **Install Multer:**

```bash
npm install multer
```

2. **Create Upload Directories:**
   The middleware will automatically create these directories:

- `uploads/`
- `uploads/users/`
- `uploads/buses/`
- `uploads/misc/`

## 🔧 Frontend Usage:

### HTML Form Example:

```html
<form enctype="multipart/form-data">
  <input type="file" name="userImage" accept="image/*" />
  <input type="text" name="username" />
  <button type="submit">Update Profile</button>
</form>
```

### JavaScript Fetch Example:

```javascript
const formData = new FormData();
formData.append("userImage", imageFile);
formData.append("username", "newUsername");

fetch("/api/v1/users/update-profile", {
  method: "PUT",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## ✅ Features:

- ✅ File type validation (JPEG, PNG, WebP)
- ✅ File size limit (5MB)
- ✅ Automatic directory creation
- ✅ Error handling and cleanup
- ✅ Static file serving
- ✅ Unique filename generation
- ✅ URL generation for database storage

## 🗂️ File Structure:

```
uploads/
├── users/
│   ├── user-1696123456789-123456789.jpg
│   └── user-1696123456790-987654321.png
├── buses/
│   ├── bus-1696123456791-456789123.jpg
│   └── bus-1696123456792-789123456.webp
└── misc/
    └── other-files...
```

The system is now ready for image uploads for both users and buses!
