import * as bookModel from '../models/bookModel.js';

export const getAllBooks = () => {
    return bookModel.getAllBooks();
};

export const createBook = (data) => {
    return bookModel.createBook(data);
};

export const updateBook = (id, data) => {
    return bookModel.updateBook(id, data);
};// In services/book.service.js


export const getBookById = (id) => {
    return bookModel.getBookById(id);
};
// Get books by category
export const getBooksByCategory = (categoryId) => {
    return bookModel.getBooksByCategory(categoryId);
};
export const deleteBook = (id) => {
    return bookModel.deleteBook(id);
};

