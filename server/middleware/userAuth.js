import jwt from "jsonwebtoken";
import userModel from "../model/usermodel.js";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    console.log(
      "UserAuth middleware - Token received:",
      token ? "Token exists" : "No token"
    );

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized. Login Again" });
    }

    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", { userId: tokenDecoded.id });

    if (tokenDecoded.id) {
      // Ensure req.body exists before setting userId
      if (!req.body) {
        req.body = {};
      }
      req.body.userId = tokenDecoded.id;
      const user = await userModel.findById(tokenDecoded.id).select("role");
      req.body.role = user?.role || "user";
      console.log("UserId added to request body:", tokenDecoded.id, user?.role);
      next();
    } else {
      console.log("No user ID found in token");
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid token" });
    }
  } catch (error) {
    console.error("UserAuth middleware error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired. Please login again" });
    }
    return res
      .status(500)
      .json({
        success: false,
        message: "Authentication error",
        error: error.message,
      });
  }
};

export default userAuth;
