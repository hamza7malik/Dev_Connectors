const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    Test Router
// @access   public
router.get('/', auth, async (req,res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({user});
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error...');
    }
});

//----------------------route for login

// @route    POST api/auth
// @desc     Login User and return token
// @access   public
router.post('/', 
    body('email', 'Please enter a valid email address...').isEmail(),
    body('password', 'Password is required...').exists(), 
    
    async (req,res) => {
    // console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try{
      //check if user not exists
      let user = await User.findOne({email});
      if(!user){
        return res.status(400).json({ errors: [{ msg: 'Invalid Username or Password' }] });
      }
      
      const isMatch = await bcrypt.compare(password, user.password);
      if(!isMatch){
        return res.status(400).json({ errors: [{ msg: 'Invalid Username or Password' }] });
      }
     
      // return jsonwebtoken
      const payload = {user: {id: user.id}};
      jwt.sign(payload, config.get('jwtSecret'),{expiresIn: 360000}, (err, token)=>{
        if(err) throw err;
        res.json(token);
      });
      
    } 
    catch(err){
      console.log(err.message);
      res.status(500).send('Server Error...');
    }
  });


module.exports = router;