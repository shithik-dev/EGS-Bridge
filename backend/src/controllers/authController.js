const Student = require('../models/Student');
const PlacementOfficer = require('../models/PlacementOfficer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Student Registration
const registerStudent = async (req, res) => {
  try {
    const { registerNumber, name, email, password, department, cgpa, skills, phone } = req.body;

    // Validation
    if (!registerNumber || !name || !email || !password || !department) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ registerNumber }, { email }] 
    });

    if (existingStudent) {
      return res.status(400).json({ 
        error: 'Student with this register number or email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = new Student({
      registerNumber,
      name,
      email,
      password: hashedPassword,
      department,
      cgpa: cgpa || 0,
      skills: skills || [],
      phone: phone || ''
    });

    await student.save();

    // Generate token
    const token = jwt.sign(
      { userId: student._id, role: 'student' },
      process.env.JWT_SECRET || 'egs-bridge-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: student._id,
        registerNumber: student.registerNumber,
        name: student.name,
        email: student.email,
        department: student.department,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Student Login
const loginStudent = async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({ error: 'Register number and password are required' });
    }

    // Find student
    const student = await Student.findOne({ registerNumber });

    if (!student) {
      return res.status(401).json({ error: 'Invalid register number or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid register number or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: student._id, role: 'student' },
      process.env.JWT_SECRET || 'egs-bridge-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        registerNumber: student.registerNumber,
        name: student.name,
        email: student.email,
        department: student.department,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Placement Officer Login (Pre-configured admin)
const loginPlacementOfficer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find placement officer
    const officer = await PlacementOfficer.findOne({ email });

    if (!officer) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, officer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if officer is active
    if (!officer.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: officer._id, role: 'placement_officer' },
      process.env.JWT_SECRET || 'egs-bridge-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        department: officer.department,
        role: 'placement_officer'
      }
    });
  } catch (error) {
    console.error('Officer login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginPlacementOfficer,
  getProfile
};