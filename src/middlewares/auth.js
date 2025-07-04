import jwt from 'jsonwebtoken';
import User from "../models/schema/user.schema.js";
//import logger from '../../logger.js';

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

// 🔐 Middleware to authenticate users via JWT
// export const authenticateUser = async (req, res, next) => {
//   try {
//     console.log('inside auth');
    
//     const token = req.headers.authorization;

//     if (!token) {
//       return res.status(400).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const rootUser = await User.findOne({
//       contact_no: decoded.tokenPayload.contact_no,
//       username: decoded.tokenPayload.username,
//       deleted_at: { $exists: false }
//     })
//       .populate('Experience')
//       .populate('Education')
//       .populate('company');

//     if (!rootUser) {
//       return res.status(401).json({ message: "Unauthorized: user not found" });
//     }

//     // Prevent access to routes requiring username if not set
//     if (
//       !rootUser.username &&
//       req.path !== '/api/add-username' &&
//       req.path !== '/api/check-username'
//     ) {
//       return res.status(400).json({ message: "Add username first!" });
//     }

//     req.token = token;
//     req.rootUser = rootUser;
//     req.userId = rootUser._id;
//     console.log('auth cleared');
    
//     next();
//   } catch (error) {
//    // logger.error("Authentication error:", error);
//     return res.status(401).json({ message: "Unauthorized User!", error: error.message });
//   }
// };

export const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔐 Inside authenticateUser middleware');

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;


    if (!token) {
      console.warn('🚫 No token provided in headers');
      return res.status(400).json({ message: "No token provided" });
    }

    console.log("📦 Token received:", token);

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Decoded token payload:", decoded);

    // Handle backward compatibility if token shape differs
    const tokenPayload = decoded?.tokenPayload || decoded;

    const rootUser = await User.findOne({
      contact_no: tokenPayload.contact_no,
      username: tokenPayload.username,
      deleted_at: { $exists: false }
    })
    if (!rootUser) {
      console.warn("❌ Unauthorized: user not found with token details");
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Optional check for username requirement
    if (
      !rootUser.username &&
      req.path !== '/api/add-username' &&
      req.path !== '/api/check-username'
    ) {
      console.warn("⚠️ Username missing, restricted route:", req.path);
      return res.status(400).json({ message: "Add username first!" });
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    console.log("✅ Auth cleared for user:", rootUser.username, "| ID:", rootUser._id);
    next();
    
  } catch (error) {
    console.error("🔥 Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized User!", error: error.message });
  }
};

// 🔒 Middleware for internal API access
export const authenticateInternalApi = (req, res, next) => {
  const token = req.headers.api_internal_token;

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  if (token !== INTERNAL_API_TOKEN) {
    return res.status(401).json({ message: "Invalid internal token" });
  }

  next();
};
