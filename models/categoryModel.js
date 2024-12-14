import pool from '../db.js'; // Import the pool
 // Get all categories
export const getAllCategories = async () => {
    const result = await pool.query('SELECT * FROM categories');
    return result.rows;
};

// Create a new category
export const createCategory = async (categoryData) => {
    const { name } = categoryData;
    const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
    );
    return result.rows[0];
};

// Get a category by ID
export const getCategoryById = async (id) => {
    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
};

// Update a category by ID
export const updateCategory = async (id, updatedData) => {
    const { name } = updatedData;
    const result = await pool.query(
        'UPDATE categories SET name = $1  WHERE id = $2 RETURNING *',
        [name, id]
    );
    return result.rows[0] || null;
};

// Delete a category by ID
export const deleteCategory = async (id) => {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
return result.rows[0] || null;
};