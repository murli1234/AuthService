import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../../logger.js';

const SECRET = process.env.SECRET;
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

// 🔐 Middleware to authenticate users via JWT
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, SECRET);

    const rootUser = await User.findOne({
      contact_no: decoded.contact_no,
      username: decoded.username,
      deleted_at: { $exists: false }
    })
      .populate('Experience')
      .populate('Education')
      .populate('company');

    if (!rootUser) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    // Prevent access to routes requiring username if not set
    if (
      !rootUser.username &&
      req.path !== '/api/add-username' &&
      req.path !== '/api/check-username'
    ) {
      return res.status(400).json({ message: "Add username first!" });
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userId = rootUser._id;

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
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
