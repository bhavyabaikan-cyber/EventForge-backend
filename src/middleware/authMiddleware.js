import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401);
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.status !== 'active') {
      res.status(401);
      return next(new Error('User account is not active'));
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(new Error('Invalid or expired token'));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('You do not have permission to perform this action'));
  }
  next();
};

export const canAccessEvent = (getEventId = (req) => req.params.eventId || req.params.id || req.body.event) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Authentication required'));
    }

    if (['platform_admin', 'event_organizer'].includes(req.user.role)) return next();
    const eventId = String(getEventId(req) || '');
    const allowed = (req.user.eventAccess || []).map(String);
    if (!eventId || allowed.includes(eventId)) return next();

    res.status(403);
    next(new Error('You are not assigned to this event'));
  };
};
