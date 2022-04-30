const express = require('express');

const router = express.Router();

// @route   GET api/profile
// @desc    Test Router
// @access   public
router.get('/', (req,res)=> res.send('profile router'));

module.exports = router;