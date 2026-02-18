import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenHeader = req.headers.token;

    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (tokenHeader) {
      token = tokenHeader;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin not authorized. Token missing.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET missing in environment variables!");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support boolean or string versions
    const isAdmin =
      decoded?.isAdmin === true ||
      decoded?.isAdmin === "true" ||
      decoded?.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not an admin",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error("❌ Admin auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid admin token",
    });
  }
};

export default adminAuth;
