import jwt from 'jsonwebtoken';
//import logger from '../../logger.js';

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

// 🔐 Middleware to authenticate users via JWT

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
    if(!decoded) {
      console.warn('🚫 Invalid token');
      return res.status(401).json({ message: "Invalid token" });
    }    
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
