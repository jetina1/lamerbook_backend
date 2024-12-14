// routes/category.js
import express from 'express';
import * as categoryController from '../controllers/category.controller.js';

const router = express.Router();

// Create a new category
router.post('/create', categoryController.createCategory);

// Retrieve all categories
router.get('/all', categoryController.getAllCategories);

// Retrieve a single category by ID
router.get('/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/:id', categoryController.updateCategory);

// Delete a category by ID
router.delete('/:id', categoryController.deleteCategory);

export default router;