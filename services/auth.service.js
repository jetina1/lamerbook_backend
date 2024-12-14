// import pool from '../db.js'; // Import the pool
// import { hash as _hash, compare } from 'bcrypt';
// import  jwt from 'jsonwebtoken';
// const {sign}=jwt;


// // Signup function
// export async function signup({ email, password, name }) {
//   // Check if the user already exists
//   const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]); // Use the pool's query method
//   if (result.rows.length > 0) {
//     throw new Error('Email is already in use');
//   }

//   // Hash the password
//   const hash = await _hash(password, 10);

//   // Insert the user into the database
//   const insertResult = await pool.query(
//     'INSERT INTO users (email, name, hash) VALUES ($1, $2, $3) RETURNING id, email, name',
//     [email, name, hash]
//   );

//   const user = insertResult.rows[0];

//   // Generate a JWT token
//   const token = sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   return token;
// }

// // Signin function
// export async function signin({ email, password }) {
//   const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//   if (result.rows.length === 0) {
//     throw new Error('Invalid email or password');
//   }

//   const user = result.rows[0];
//   const isValid = await compare(password, user.hash);
//   if (!isValid) {
//     throw new Error('Invalid email or password');
//   }

//   const token = sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1000h' });
//   console.log (token)
//   return token;
// }