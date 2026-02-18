import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Support BOTH:
    // Authorization: Bearer <token>
    // token: <token>  (some frontends use this)
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
        message: "Not authorized. Token missing.",
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

    // Support tokens that store id or _id
    const userId = decoded?.id || decoded?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = { id: userId };
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
