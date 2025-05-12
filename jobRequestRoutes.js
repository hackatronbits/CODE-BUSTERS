const express = require("express");
const router = express.Router();
const JobRequest = require("../models/JobRequest");

router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;
    const job = new JobRequest({ userId, message });
    const savedJob = await job.save();
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
