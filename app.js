import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import pg from 'pg'; 
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname } from 'path';
import bodyParser from "body-parser";

const { Pool } = pg; // Ensure you're importing Pool from the pg module
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/book.js';
import categoryRoutes from './routes/category.js';
import paymentRoutes from './routes/payment.js';

// Load environment variables
config();

// Create a new instance of Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the database
pool.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error:', err));

const app = express();

// Middleware
app.use(express.json()); // Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(cors()); // CORS middleware

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// Routes
app.use('/auth', authRoutes); 
app.use('/books', bookRoutes);
app.use('/categories', categoryRoutes); 
app.use('/payment', paymentRoutes); 


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});