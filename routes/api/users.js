const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// @route    POST api/users
// @desc     Register USer
// @access   public
router.post('/', 
    body('name','Name is required...').not().isEmpty(),
    body('email', 'Please enter a valid email address...').isEmail(),
    body('password', 'Password should be 6 or more characters...').isLength({min: 6}), 
    
    (req,res) => {
    // console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('User Router')
});


module.exports = router;