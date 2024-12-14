// seed.js
import pool from './db.js';

async function main() {
    const defaultCategories = [
        { name: 'Fiction' },
        { name: 'Non-Fiction' },
        { name: 'Science' },
    ];

    for (const category of defaultCategories) {
        const { rows } = await pool.query('SELECT * FROM categories WHERE name = $1', [category.name]);
        if (rows.length === 0) {
            await pool.query('INSERT INTO categories (name) VALUES ($1)', [category.name]);
            console.log(`Added category: ${category.name}`);
        } else {
            console.log(`Category already exists: ${category.name}`);
        }
    }

    console.log('Default categories have been added');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end(); // Close the pool
    });