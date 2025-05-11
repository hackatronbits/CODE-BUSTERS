const express = require('express');
const router = express.Router();
const {  mechanic } = require('../models/Mechanic')
const { mechanic2 } = require('../models/Mechanic')



const multer = require('multer');
const path = require('path');




// Get nearby mechanics with dynamic radius (API route for nearby mechanics)
router.get('/nearby', async (req, res) => {
    const { lat, lng, radius } = req.query;
  
    // Validate that lat, lng, and radius are numbers
    const latFloat = parseFloat(lat);
    const lngFloat = parseFloat(lng);
    const radiusFloat = parseFloat(radius);
  
    if (isNaN(latFloat) || isNaN(lngFloat) || isNaN(radiusFloat)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude, longitude, or radius values.',
      });
    }
  
    // Convert radius to meters and validate that the radius is within a reasonable range (e.g., 1-50 km)
    const radiusInMeters = radiusFloat * 1000; // Convert radius to meters
    if (radiusFloat < 1 || radiusFloat > 50) {
      return res.status(400).json({
        success: false,
        error: 'Radius must be between 1 and 50 kilometers.',
      });
    }
  
    try {
      const mechanics = await mechanic.find({
        location: {
          $geoWithin: {
            $centerSphere: [
              [lngFloat, latFloat], // [longitude, latitude]
              radiusInMeters / 6371, // Convert meters to radians
            ]
          }
        }
      });
  
      res.json({ success: true, mechanics });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Handle mechanic registration (with file uploads)
router.post('/mechanic', upload.fields([
  { name: 'shopPhoto' },
  { name: 'photoFront' },
  { name: 'photoLeft' },
  { name: 'photoRight' }
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;
    
    // Parse lat/lng
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    const newMechanic = new mechanic2({
      ...data,
      location: {
        type: 'Point',
        coordinates: [lng, lat] // Longitude first, Latitude second
      },
      shopPhoto: files.shopPhoto?.[0]?.filename || '',
      photoFront: files.photoFront?.[0]?.filename || '',
      photoLeft: files.photoLeft?.[0]?.filename || '',
      photoRight: files.photoRight?.[0]?.filenamem || ''
    });

    await newMechanic.save();
    res.json({ message: 'Mechanic registered 11successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering mechanic' });
  }
});











router.post('/create-job', async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      issue,
      urgent,
      vehicle,
      userLocation,
      mechanicId
    } = req.body;

    if (!name || !phone || !issue || !userLocation?.lat || !userLocation?.lng) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newJob = new JobRequest({
      userId,
      name,
      phone,
      issue,
      urgent,
      vehicle,
      userLocation,
      mechanicId
    });

    const savedJob = await newJob.save();

    res.status(201).json({
      message: 'Job request created',
      data: { jobId: savedJob._id }
    });
  } catch (err) {
    console.error('Error creating job request:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

  
module.exports = router;
