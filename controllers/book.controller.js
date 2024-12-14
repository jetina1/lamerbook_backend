import jwt from 'jsonwebtoken';
import * as BookModel from '../models/bookModel.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pool from '../db.js';
import {getUserFromAuthHeader} from '../controllers/auth.controller.js'
// import * as booksService from '../services/book.service.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'pdf') {
            cb(null, './uploads/pdf');
        } else if (file.fieldname === 'image') {
            cb(null, './uploads/thumbnails');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    }
});
export const upload = multer({ storage });

export const checkPurchase = async (req, res) => {
  const { userId, bookId } = req.query;

  if (!userId || !bookId) {
    return res.status(400).json({ message: 'userId and bookId are required' });
  }

  try {
    const query = `
      SELECT * 
      FROM user_book 
      WHERE user_id = $1 AND book_id = $2
    `;
    const result = await pool.query(query, [userId, bookId]);

    if (result.rows.length > 0) {
      return res.status(200).json({ hasPurchased: true });
    } else {
      return res.status(200).json({ hasPurchased: false });
    }
  } catch (error) {
    console.error('Error checking purchase status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create a book (Only Admin)
export const createBook = async (req, res) => {
    try {
        // Extract user details from the Authorization header
        // const user = getUserFromAuthHeader(req.headers.authorization);
        const token = req.headers.authorization?.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user's full data from the database using their ID
    const userResult = await pool.query('SELECT id, name, email ,role FROM users WHERE id = $1', [decoded.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
console.log('userrr')
console.log(user)
//get user by id

        // Check if the user has the "Admin" role
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Only admins can create books.' });
        }

        // Extract book details from the request body
        const { title, description, price, author ,category_id} = req.body;

        // Handle file uploads if present
        const pdf_Path = req.files.pdf ? req.files.pdf[0].filename : null;
        const thumbnails = req.files.image ? req.files.image[0].filename : null;

        // Save the book to the database
        const result = await BookModel.createBook({
            title,
            description,
            price,
            author,
            pdf_Path,
            thumbnails,
            category_id
        });

        // Respond with a success message
        return res.status(201).json(
            {    success: true, // Add this to indicate successful creation
    id: result.insertId,
    book: result,
    message: 'Book created successfully' });
    } catch (error) {
        // Handle errors
        return res.status(500).json({ message: error.message });
    }
};

// Update a book (Only Admin)
export const updateBook = async (req, res) => {
    try {
        console.log('Request received:', req.body, req.params);

        // Extract user details from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user's full data from the database using their ID
        const userResult = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        console.log('User:', user);

        // Check if the user has the "Admin" role
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Only admins can update books.' });
        }

        // Extract book details from the request body
        const { title, description, price, author, isfree, category_id } = req.body;
        const pdf_Path = req.files?.pdf ? req.files.pdf[0].filename : null;
        const thumbnails = req.files?.image ? req.files.image[0].filename : null;

        // Check if the book exists
        const book = await BookModel.getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Remove old files if new ones are uploaded
        if (req.files?.pdf && book.pdf_path) {
            fs.unlinkSync(path.join('./uploads/pdf', book.pdf_path));
        }
        if (req.files?.image && book.thumbnail_path) {
            fs.unlinkSync(path.join('./uploads/thumbnails', book.thumbnail_path));
        }

        // Build dynamic fields for the SQL query
        const updatedFields = {};
        if (title) updatedFields.title = title;
        if (description) updatedFields.description = description;
        if (price) updatedFields.price = price;
        if (author) updatedFields.author = author;
        if (isfree !== undefined) updatedFields.isfree = isfree;
        if (category_id) updatedFields.category_id = category_id;
        if (pdf_Path) updatedFields.pdf_path = pdf_Path;
        if (thumbnails) updatedFields.thumbnails = thumbnails;

        // Update the book with only the provided fields
        const updatedBook = await BookModel.updateBook(req.params.id, updatedFields);

        return res.status(200).json({ message: 'Book updated successfully', updatedBook });
    } catch (error) {
        console.error('Error updating book:', error.message);
        return res.status(500).json({ message: error.message });
    }
};

// export const updateBook = async (req, res) => {
//     try {
//         console.log('Request received:', req.body, req.params);

//         // Extract user details from the Authorization header
//         // const user = getUserFromAuthHeader(req.headers.authorization);
//         const token = req.headers.authorization?.split(' ')[1];
//           const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Fetch the user's full data from the database using their ID
//     const userResult = await pool.query('SELECT id, name, email ,role FROM users WHERE id = $1', [decoded.id]);

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const user = userResult.rows[0];
// console.log('userrr')
// console.log(user)
// //get user by id

//         // Check if the user has the "Admin" role
//         if (user.role !== 'ADMIN') {
//             return res.status(403).json({ message: 'Access denied. Only admins can create books.' });
//         }


//         // Extract book details from the request body
//         const { title, description, price, author,isfree ,category_id} = req.body;
//         const pdf_Path = req.files.pdf ? req.files.pdf[0].filename : null;
//         const thumbnails = req.files.image ? req.files.image[0].filename : null;

//         // Check if the book exists
//         const book = await BookModel.getBookById(req.params.id);
//         if (!book) {
//             return res.status(404).json({ message: 'Book not found' });
//         }

//         // Remove old files if new ones are uploaded
//         if (req.files.pdf && book.pdf_path) {
//             fs.unlinkSync(path.join('./uploads/pdf', book.pdf_path));
//         }
//         if (req.files.image && book.thumbnail_path) {
//             fs.unlinkSync(path.join('./uploads/thumbnails', book.thumbnail_path));
//         }

//         // Update the book details
//         await BookModel.updateBook(req.params.id, {
//             title,
//             description,
//             price,
//             author,
//             pdf_Path: pdf_Path || book.pdf_path,
//             thumbnails: thumbnails || book.thumbnails,
//             isfree,
//             category_id
//         });

//         return res.status(200).json({ message: 'Book updated successfully' });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };

// Delete a book (Only Admin)
export const deleteBook = async (req, res) => {
    try {
       console.log('Request received:', req.body, req.params);

        // Extract user details from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch the user's full data from the database using their ID
        const userResult = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        console.log('User:', user);

        // Check if the user has the "Admin" role
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Only admins can update books.' });
        }

        // Check if the book exists
        const book = await BookModel.getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Remove associated files
        if (book.pdf_path) {
            fs.unlinkSync(path.join('./uploads/pdf', book.pdf_path));
        }
        if (book.thumbnail_path) {
            fs.unlinkSync(path.join('./uploads/thumbnails', book.thumbnail_path));
        }

        // Delete the book from the database
        await BookModel.deleteBook(req.params.id);

        return res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Get books by category name
export const getBooksByCategoryName = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const books = await BookModel.getBooksByCategoryName(categoryName);

        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found for this category' });
        }

        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by category', error: error.message });
    }
};
export const  getAllBooks= async (req, res) =>{
     const books = await BookModel.getAllBooks();
     console.log(books)
 if (books.length === 0) {
            return res.status(404).json({ message: 'No books found for this category' });
        }

        res.status(200).json(books);
};