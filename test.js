const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5500;

// Middleware
app.use(cors());
app.use(express.json());

// **MySQL Connection Pool**
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'WJ29@shlok',
    database: 'tezmechanix',
    connectionLimit: 10,
    queueLimit: 0
});

// Function to get a connection from the pool
const getConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
};

// Function to execute a query
const executeQuery = async (query, values) => {
    const connection = await getConnection();
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, results) => {
            connection.release();
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Submit a new problem
app.post('/api/submit-problem', async (req, res) => { // Use async
    console.log("Incoming request body:", req.body);
    const { userId, description } = req.body;

    if (!userId || !description) {
        return res.status(400).json({ error: 'userId and description are required' });
    }

    try {
        const result = await executeQuery(
            'INSERT INTO problems (user_id, description) VALUES (?, ?)',
            [userId, description]
        );
        res.status(201).json({ message: 'Problem submitted', problemId: result.insertId });
    } catch (err) {
        console.error('Insert error:', err);
        res.status(500).json({ error: 'Failed to insert problem: ' + err.message });
    }
});

// Get all problems
app.get('/api/problems', async (req, res) => { // Use async
    try {
        const results = await executeQuery('SELECT * FROM problems ORDER BY timestamp DESC');
        res.status(200).json(results);
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch problems: ' + err.message });
    }
});

// Assign a mechanic
app.put('/api/assign-problem/:id', async (req, res) => { // Use async
    const problemId = req.params.id;
    const { mechanicId } = req.body;

    if (!mechanicId) {
        return res.status(400).json({ error: 'mechanicId is required' });
    }

    try {
        const result = await executeQuery(
            'UPDATE problems SET mechanic_id = ?, status = "assigned" WHERE id = ?',
            [mechanicId, problemId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.status(200).json({ message: 'Mechanic assigned successfully' });
    } catch (err) {
        console.error('Assign error:', err);
        res.status(500).json({ error: 'Failed to assign mechanic: ' + err.message });
    }
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT. Closing database connection and server...');
    pool.end(err => { // Use pool.end
        if (err) {
            console.error("Error closing database connection pool:", err);
        } else {
            console.log("Database connection pool closed.");
        }
        server.close(() => {
            console.log("Server stopped.");
            process.exit(0);
        });
    });
});
require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
app.put('/api/assign-problem/:id', async (req, res) => {
    const problemId = req.params.id;
    const { mechanicId } = req.body;

    if (!mechanicId) {
        return res.status(400).json({ error: 'mechanicId is required' });
    }

    try {
        // Update the problem with assigned mechanic
        const result = await executeQuery(
            'UPDATE problems SET mechanic_id = ?, status = "assigned" WHERE id = ?',
            [mechanicId, problemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Fetch mechanic details from database
        const [mechanic] = await executeQuery(
            'SELECT name, email FROM mechanics WHERE id = ?',
            [mechanicId]
        );

        if (!mechanic || !mechanic.email) {
            return res.status(404).json({ error: 'Mechanic email not found' });
        }

        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: mechanic.email,
            subject: '🛠️ New Problem Assigned to You',
            text: `Hi ${mechanic.name},\n\nA new problem (ID: ${problemId}) has been assigned to you.\n\nPlease check the TezMechanix dashboard.\n\nThanks,\nTezMechanix Team`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email sending failed:", error);
            } else {
                console.log("Notification email sent:", info.response);
            }
        });

        res.status(200).json({ message: 'Mechanic assigned and notified successfully' });

    } catch (err) {
        console.error('Assign error:', err);
        res.status(500).json({ error: 'Failed to assign mechanic: ' + err.message });
    }
});


