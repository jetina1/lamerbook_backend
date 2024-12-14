import pool from '../db.js';  // Assuming pool is your database connection

// Create a book
export const createBook = async ({ title, description, price, author, pdf_Path, thumbnails ,category_id}) => {
    const sql = `
        INSERT INTO books (title, description, price, author, pdf_path, thumbnails,isfree,category_id)
        VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING id;
    `;
    
    const { rows } = await pool.query(sql, [title, description, price, author, pdf_Path, thumbnails,false,category_id]);
    return rows[0].id;  // Return the inserted book ID
};

export const getBookById = async (id) => {
    const sql = `
        SELECT * FROM books
        WHERE id = $1;
    `;
    
    const { rows } = await pool.query(sql, [id]);
    
    console.log(rows);  // Log the rows to check if data is being returned

    return rows[0]; // Return the first row if found
};
// Update an existing book
// export const updateBook = async (id, { title, description, price, author, pdf_Path, thumbnails,isfree ,category_id}) => {
//     const sql = `
//         UPDATE books
//         SET title = $1, description = $2, price = $3, author = $4, pdf_path = $5, thumbnails = $6,isfree=$7,category_id=$8
//         WHERE id = $9
//         RETURNING *;
//     `;
    
//     const { rows } = await pool.query(sql, [title, description, price, author, pdf_Path, thumbnails,isfree, category_id,id]);
//     return rows[0]; // Return the updated book
// };
export const updateBook = async (id, updatedFields) => {
    // Build dynamic SQL query
    const fields = Object.keys(updatedFields);
    const values = Object.values(updatedFields);

    // Construct the SET clause for SQL dynamically
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const sql = `
        UPDATE books
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
    `;

    // Execute the query
    const { rows } = await pool.query(sql, [...values, id]);
    return rows[0]; // Return the updated book
};


// Delete a book
export const deleteBook = async (id) => {
    const sql = `
        DELETE FROM books
        WHERE id = $1
        RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [id]);
    return rows[0]; // Return the deleted book details
};

// Get all books
export const getAllBooks = async () => {
    const sql = `
        SELECT * FROM books;
    `;
    
    const { rows } = await pool.query(sql);
    return rows; // Return all books
};

// Get books by category name
export const getBooksByCategoryName = async (categoryName) => {
    const sql = `
        SELECT books.id, books.title, books.author, books.pdf_path, books.thumbnails, categories.name AS category
        FROM books
        JOIN categories ON books.category_id = categories.id
        WHERE categories.name = $1;
    `;
    
    const { rows } = await pool.query(sql, [categoryName]);
    return rows; // Return books in the specified category
};
