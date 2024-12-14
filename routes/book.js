import express from 'express';
import * as booksController from '../controllers/book.controller.js';
import * as booksService from '../services/book.service.js'
import * as booksModel from '../models/bookModel.js'
// import { upload } from '../controllers/book.controller.js'
import path from 'path';
import fs from 'fs';

const router = express.Router();
router.get('/all', booksController.getAllBooks);

// Get books by category name
router.get('/category/:categoryName', booksController.getBooksByCategoryName);

// Route to check if a user has purchased a book
router.get('/check-purchase', booksController.checkPurchase);
// Create a book with file uploads (Only Admin)
router.post(
    '/create',
    booksController.upload.fields([{ name: 'pdf' }, { name: 'image' }]),
    booksController.createBook
);

// Update a book (Only Admin)
router.put(
    '/:id',
    booksController.upload.fields([{ name: 'pdf' }, { name: 'image' }]),
    booksController.updateBook
);

// Delete a book (Only Admin)
router.delete('/:id', booksController.deleteBook);


// Serve PDF files
router.get('/pdf/:pdf', (req, res) => {
    const { pdf } = req.params;
    const pdfPath = path.join('./uploads/pdf', pdf); // Adjust the path as per your directory structure

    // Check if the file exists
    fs.access(pdfPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'PDF file not found.' });
        }

        // Stream the file to the client
        res.sendFile(path.resolve(pdfPath));
    });
});

// Serve Thumbnail files
router.get('/thumbnails/:thumbnails', (req, res) => {
    const { thumbnails } = req.params;
    const thumbnailPath = path.join('./uploads/thumbnails', thumbnails); // Adjust the path as per your directory structure

    // Check if the file exists
    fs.access(thumbnailPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: 'Thumbnail file not found.' });
        }

        // Stream the file to the client
        res.sendFile(path.resolve(thumbnailPath));
    });
});
router.get('/specific/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const book = await booksModel.getBookById(id);
        if (book) {
            return res.status(200).json(book); // If the book is found
        } else {
            return res.status(404).json({ message: 'Book not found' }); // If the book isn't found
        }
    } catch (err) {
        console.error(err); // Log any errors that occur
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
//  router.get('/specific/:id', (req, res) => {
//     const id = parseInt(req.params.id);
//     const book = booksModel.getBookById(id);
//     if (book) {
//         return res.status(200).json(book);
//     } else {
//         return res.status(404).json({ message: 'Book not found' });
//     }
// });



// router.post('/create', booksController.upload.fields([{ name: 'pdf' }, { name: 'image' }]), booksController.createBook);
// router.put('/:id', booksController.upload.fields([{ name: 'pdf' }, { name: 'image' }]), booksController.updateBook);
// // Update a book by ID

// // Get a specific book by ID
// // Get books by category
// router.get('/category/:categoryId', (req, res) => {
//     const categoryId = parseInt(req.params.categoryId);
//     const books = booksService.getBooksByCategory(categoryId);
//     return res.status(200).json(books);
// });
// // Delete a book by ID
// router.delete('/:id', booksController.deleteBook);

// // Serve PDF files
// router.get('/pdf/:pdfname', (req, res) => {
//     const pdfName = req.params.pdfname;
//     res.sendFile(path.join(process.cwd(), 'uploads/pdf', pdfName));
// });

// // Serve image files
// router.get('/image/:imageName', (req, res) => {
//     const imageName = req.params.imageName;
//     res.sendFile(path.join(process.cwd(), 'uploads/thumbnails', imageName));
// });

export default router;

// router.post('/create', booksController.createBook);
// router.get('/', booksController.getAllBooks);
// router.put('/:id', booksController.updateBook);
// Get all books
// router.get('/all', (req, res) => {
//     const books = booksService.getAllBooks();
//     return res.status(200).json(books);
// });

// router.put('/:id', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'image', maxCount: 1 }]), (req, res) => {
//     const id = parseInt(req.params.id);
//     const updatedData = req.body;
//     const pdfFile = req.files.pdf ? req.files.pdf[0].filename : null;
//     const imageFile = req.files.image ? req.files.image[0].filename : null;

//     const existingBook = booksService.getBookById(id);
//     if (!existingBook) {
//         return res.status(404).json({ message: 'Book not found' });
//     }

//     // Handle unlinking of existing files if they are being replaced
//     if (imageFile) {
//         fs.unlink(path.join(__dirname, '../uploads/thumbnails/', existingBook.thumbnails), (err) => {
//             if (err) console.log(err);
//         });
//     }

//     if (pdfFile) {
//         fs.unlink(path.join(__dirname, '../uploads/pdf/', existingBook.pdfPath), (err) => {
//             if (err) console.log(err);
//         });
//     }

//     const updatedBook = booksService.updateBook(id, {
//         ...updatedData,
//         pdfPath: pdfFile || existingBook.pdfPath,
//         thumbnails: imageFile || existingBook.thumbnails,
//     });

//     if (updatedBook) {
//         return res.status(200).json(updatedBook);
//     } else {
//         return res.status(404).json({ message: 'Book not found' });
//     }
// });
