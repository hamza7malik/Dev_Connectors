const express = require('express');

const router = express.Router();

// @route   GET api/auth
// @desc    Test Router
// @access   public
router.get('/', (req,res) => res.send('auth router'));

module.exports = router;