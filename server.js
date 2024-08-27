const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();
app.use(bodyParser.json());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

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

app.get('/', (req, res) => {
    res.render('form');
});

app.get('/list_schools', (req, res) => {
    res.render('list_schools');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


// ADD SCHOOL API
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
    const _latitude = parseFloat(latitude);
    const _longitude = parseFloat(longitude);

    // Validating Input
    if (!name || !address || typeof _latitude !== 'number' || typeof _longitude !== 'number') {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    
    db.execute(query, [name, address, _latitude, _longitude], (err, results) => {
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

    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    if (typeof parseFloat(userLatitude) !== 'number' || typeof parseFloat(userLongitude) !== 'number') {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }
 
    const query = 'SELECT *, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance FROM schools ORDER BY distance';

    db.execute(query, [userLatitude, userLongitude, userLatitude], (err, results) => {
        if (err) {
            console.error('Error fetching schools:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // res.json(results);
        
        res.render('showData', {schools: results});
    });
});
