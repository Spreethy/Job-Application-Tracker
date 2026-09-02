const express = require('express');
const multer = require('multer');
const { parseResume } = require('../services/resumeParser');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  },
});

router.post('/parse-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await parseResume(req.file);
    
    res.json({
      fileName: req.file.originalname,
      ...result,
    });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse resume' });
  }
});

router.post('/import/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // TODO: Implement job posting scraping from URL
    // For now, return a placeholder
    res.json({
      message: 'Job URL import not yet implemented',
      url,
    });
  } catch (err) {
    console.error('URL import error:', err);
    res.status(500).json({ error: 'Failed to import from URL' });
  }
});

module.exports = router;