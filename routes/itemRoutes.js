const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Citizen Routes
router.post('/lost', authMiddleware.authenticateUser, upload.array('images', 5), itemController.reportLostItem);
router.get('/my-lost', authMiddleware.authenticateUser, itemController.getUserLostItems);

// Police Routes (Secured)
// Ideally need a separate admin middleware, re-using auth for MVP with type check inside or separate middleware
router.get('/all-lost', authMiddleware.authenticateUser, itemController.getAllLostItems);
router.post('/found', authMiddleware.authenticateUser, upload.array('images', 5), itemController.reportFoundItem);
router.post('/match', authMiddleware.authenticateUser, itemController.matchItem);

// New Advanced Features
router.post('/smart-match', authMiddleware.authenticateUser, itemController.smartMatch);
router.post('/verify-handover', authMiddleware.authenticateUser, itemController.verifyHandover);
router.get('/heatmap', authMiddleware.authenticateUser, itemController.getHeatmapData);

module.exports = router;
