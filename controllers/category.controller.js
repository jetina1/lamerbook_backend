// controllers/categoryController.js
import * as categoryService from '../services/category.service.js';
import * as categoryModel from '../models/categoryModel.js';
import { body, validationResult } from 'express-validator';

// Middleware for validating category creation
// Middleware for validating category creation
const validateCategory = [
    body('name').isString().withMessage('Name must be a string'),
];

// Create a new category
export const createCategory = [
    ...validateCategory,
    async (req, res) => { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Directly call the model method for category creation
            const newCategory = await categoryModel.createCategory(req.body);
            return res.status(201).json(newCategory);
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ message: 'Error creating category' });
        }
    },
];

// Retrieve all categories
export const getAllCategories = async (req, res) => { 
    try {
        // Directly call the model method to fetch all categories
        const categories = await categoryModel.getAllCategories();
        return res.status(200).json(categories);
    } catch (error) {
        console.error('Error retrieving categories:', error);
        return res.status(500).json({ message: 'Error retrieving categories' });
    }
};

// Retrieve a single category by ID
export const getCategoryById = async (req, res) => { 
    const id = parseInt(req.params.id);
    try {
        // Directly call the model method to fetch the category
        const category = await categoryModel.getCategoryById(id);
        if (category) {
            return res.status(200).json(category);
        } else {
            return res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error retrieving category:', error);
        return res.status(500).json({ message: 'Error retrieving category' });
    }
};

// Update a category by ID
export const updateCategory = async (req, res) => { 
    const id = parseInt(req.params.id);
    try {
        // Directly call the model method to update the category
        const updatedCategory = await categoryModel.updateCategory(id, req.body);
        if (updatedCategory) {
            return res.status(200).json(updatedCategory);
        } else {
            return res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({ message: 'Error updating category' });
    }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => { 
    const id = parseInt(req.params.id);
    try {
        // Directly call the model method to delete the category
        const deletedCategory = await categoryModel.deleteCategory(id);
        if (deletedCategory) {
            return res.status(200).json(deletedCategory);
        } else {
            return res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({ message: 'Error deleting category' });
    }
};