const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mechanicx', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define Schema
const emergencyRequestSchema = new mongoose.Schema({
  name: String,
  phone: String,
  bike_model: String,
  issue: String,
  latitude: String,
  longitude: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);

// Route to handle form submission
app.post('/send-sms', async (req, res) => {
  try {
    const newRequest = new EmergencyRequest(req.body);
    await newRequest.save();
    res.status(200).send('✅ Emergency request saved successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to save emergency request.');
  }
});


app.use(express.static(path.join(__dirname, 'public'))); // serve static files

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

app.get('/requests', async (req, res) => {
  try {
    const requests = await EmergencyRequest.find().sort({ createdAt: -1 }); // newest first
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});
app.patch('/request/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await EmergencyRequest.findByIdAndUpdate(id, { status });
    res.json({ message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));


// Start server
const PORT = 3200;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
