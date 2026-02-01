const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const PlacementOfficer = require('../models/PlacementOfficer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'egs-bridge-secret-key');
    
    let user;
    if (decoded.role === 'student') {
      user = await Student.findById(decoded.userId);
    } else if (decoded.role === 'placement_officer') {
      user = await PlacementOfficer.findById(decoded.userId);
    }

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.user.role = decoded.role;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const studentAuth = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Students only.' });
  }
  next();
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'placement_officer') {
    return res.status(403).json({ error: 'Access denied. Placement officers only.' });
  }
  next();
};

module.exports = { auth, studentAuth, adminAuth };