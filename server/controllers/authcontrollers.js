import User from '../models/users.js';
import { hash, compare } from 'bcryptjs';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

// REGISTER
export async function register(req, res) {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedRole = role?.trim();
    const allowedRoles = ['Admin', 'Editor', 'Viewer'];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'User Already Exists.' });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: normalizedRole,
      name
    });

    await newUser.save();

    res.status(201).json({ message: 'User Registered Successfully.' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error.' });
  }
}


// LOGIN
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 🔥 IMPORTANT FIX
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error.' });
  }
}


// VERIFY
export async function verify(req, res) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server Error.' });
  }
}