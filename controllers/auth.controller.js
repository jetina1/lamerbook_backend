import { validationResult } from 'express-validator';
import pool from '../db.js'; // Import the pool
import bcrypt from 'bcrypt';
import  jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
const {sign}=jwt;

// import { signup as authSignup, signin as authSignin } from '../services/auth.service.js';
const TOKEN_BLACKLIST = new Set();
export const signup  = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Log incoming request body for debugging
    console.log('Request Body:', req.body);

    // Check if the user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Ensure the password is not undefined or empty
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (name, email, hash) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );

    // Generate a JWT
    const token = jwt.sign(
      { id: newUser.rows[0].id, name: newUser.rows[0].name, email: newUser.rows[0].email },
      process.env.JWT_SECRET
    );

    // Send response
    res.status(201).json({
      message: 'User created successfully',
      userId: newUser.rows[0].id,
      token,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
export const adminSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Log incoming request body for debugging
    console.log('Request Body:', req.body);

    // Check if the user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Ensure the password is not undefined or empty
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Set the role as 'ADMIN' and insert the new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (name, email, hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, 'ADMIN']
    );

    // Generate a JWT with the role included
    const token = jwt.sign(
      { 
        id: newUser.rows[0].id, 
        name: newUser.rows[0].name, 
        email: newUser.rows[0].email, 
        role: newUser.rows[0].role 
      },
      process.env.JWT_SECRET
    );
    //set cookie
res.cookie('token', token, {
      httpOnly: true, // Prevents client-side access to the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send response
   res.status(201).json({
      message: 'User created successfully',
      userId: newUser.rows[0].id,
      role: newUser.rows[0].role,
      token,
    });
    // console.log(constresponse)
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hash);   // 685254 0777583880.semaynesh
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate non-expiring JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token }); // Send the token in the response
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Logout function
export const logout = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
  
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  // Add the token to the blacklist
  TOKEN_BLACKLIST.add(token);
  res.status(200).json({ message: 'Logged out successfully' });
};
export const getUserData = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user's full data from the database using their ID
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Send the user data in the response
    res.status(200).json( user );
  } catch (error) {
    console.error('Error verifying token or fetching user data:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const getUserFromAuthHeader = (authHeader) => {
    if (!authHeader) {
        throw new Error('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Extract the token (assumes "Bearer <token>" format)
    if (!token) {
        throw new Error('Token is missing from the Authorization header');
    }

    try {
        // Verify and decode the token using the secret key
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET); // Replace JWT_SECRET with your actual secret
        return decodedUser; // Return the user details embedded in the token
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
// Middleware to check if a token is blacklisted
export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token is required.' });
  }

  // Check if the token is blacklisted
  if (TOKEN_BLACKLIST.has(token)) {
    return res.status(401).json({ message: 'Access denied. Token is invalid.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};
export const updateUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    // Verify the token to get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Extract the fields to be updated from the request body
    const { name, email, password } = req.body;

    // Validation: Ensure at least one field is provided
    if (!name && !email && !password) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    // Prepare fields for update
    const fieldsToUpdate = [];
    const values = [];
    let query = 'UPDATE users SET ';

    if (name) {
      fieldsToUpdate.push('name = $' + (fieldsToUpdate.length + 1));
      values.push(name);
    }

    if (email) {
      fieldsToUpdate.push('email = $' + (fieldsToUpdate.length + 1));
      values.push(email);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      fieldsToUpdate.push('hash = $' + (fieldsToUpdate.length + 1));
      values.push(hashedPassword);
    }

    // Build the query dynamically based on fields to update
    query += fieldsToUpdate.join(', ') + ' WHERE id = $' + (fieldsToUpdate.length + 1) + ' RETURNING id, name, email';
    values.push(userId);

    // Execute the query
    const updatedUser = await pool.query(query, values);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = updatedUser.rows[0];

    // Generate a new JWT with the updated user data
    const newToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Set an expiration time for the token
    );

    // Respond with the updated user data and new token
    res.status(200).json({
      message: 'User updated successfully',
      user,
      token: newToken,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

//handle profile uploading
export const updateProfileImage = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
  const profileImage = req.file; // Multer parses the file

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  if (!profileImage) {
    return res.status(400).json({ message: 'No image provided' });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Fetch the current user data
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the original file extension
    const fileExtension = path.extname(profileImage.originalname);

    // Rename the file to include the user ID and retain its original extension
    const newFileName = `${userId}${fileExtension}`;
    const newFilePath = path.join('uploads/profile', newFileName);

    // Move the file to its new name and location
    fs.rename(profileImage.path, newFilePath, (err) => {
      if (err) {
        console.error('Error renaming profile image:', err.message);
        return res.status(500).json({ message: 'Error saving profile image' });
      }
    });

    // Check if user already has a profile image
    if (user.profile_image) {
      const existingImagePath = path.join('uploads/profile', user.profile_image);

      // Unlink (delete) the old image file
      fs.unlink(existingImagePath, (err) => {
        if (err) {
          console.error('Error deleting previous profile image:', err.message);
        } else {
          console.log('Previous profile image deleted successfully.');
        }
      });
    }

    // Update the user's profile image in the database
    const updatedUser = await pool.query(
      'UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, name, email, profile_image',
      [newFileName, userId]
    );

    // Send response
    res.status(200).json({
      message: 'Profile image updated successfully',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};