const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


// @route    POST api/users
// @desc     Register USer
// @access   public
router.post('/', 
    body('name','Name is required...').not().isEmpty(),
    body('email', 'Please enter a valid email address...').isEmail(),
    body('password', 'Password should be 6 or more characters...').isLength({min: 6}), 
    
    async (req,res) => {
    // console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {name, email, password} = req.body;
    try{
      //check if user exists
      let user = await User.findOne({email});
      if(user){
        return res.status(400).json({ errors: [{ msg: 'User already exists...' }] });
      }
      // if not: get gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      //create user instance
      user = new User({
        name,
        email,
        avatar,
        password
      });
      // bcrypt pass
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //save user to db
      await user.save();
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