const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Strong@123',
    database: 'school_management'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// ADD SCHOOL API
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validating Input
    if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    
    db.execute(query, [name, address, latitude, longitude], (err, results) => {
        if (err) {
            console.error('Error inserting school:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'School added successfully', schoolId: results.insertId });
    });
});


// LIST SCHOOL API
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (typeof parseFloat(latitude) !== 'number' || typeof parseFloat(longitude) !== 'number') {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    const query = 'SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance FROM schools ORDER BY distance';

    db.execute(query, [userLatitude, userLongitude, userLatitude], (err, results) => {
        if (err) {
            console.error('Error fetching schools:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});
