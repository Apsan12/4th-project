import { verifyToken } from "../utils/token.js";
import User from "../model/user.model.js";

const authenticated = async (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header
    let token = null;
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1].trim();
    }

    // 2️⃣ Fallback to cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // 3️⃣ No token → Unauthorized
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // 4️⃣ Verify token
    const payload = verifyToken(token);
    if (!payload?.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
    // console.log("Decoded token payload:", payload);
    // 5️⃣ Find user
    const user = await User.findByPk(payload.id, {
      attributes: ["id", "role", "email", "username", "isVerified"],
    });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // 6️⃣ Check verification
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    // 7️⃣ Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Unauthorized: Auth middleware error" });
  }
};

export default authenticated;
