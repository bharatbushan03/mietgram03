
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user || req.user.banned) {
      return res.status(401).json({ error: 'User not found or account banned.' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed.' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.campusRole === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};
