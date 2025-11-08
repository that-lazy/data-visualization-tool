const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getCategoryBreakdown,
  getMonthlySummary,
  getNetBalance,
} = require('../controllers/analyticsController');

const router = express.Router();

router.use(authMiddleware);

router.get('/category-breakdown', getCategoryBreakdown);
router.get('/monthly-summary', getMonthlySummary);
router.get('/net-balance', getNetBalance);

module.exports = router;
