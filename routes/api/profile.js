const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const { default: mongoose } = require('mongoose');
const { body, validationResult } = require('express-validator');


const router = express.Router();

// @route   GET api/profile/me
// @desc    Get logged user profile
// @access  private
router.get('/me', auth, async (req,res)=> {

    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({msg: 'No profile found for this user'});

        res.json(profile);
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error...');
    }

});

// @route   POST api/profile/
// @desc    Create/Update logged user profile
// @access  private
router.post('/', 
[
    auth,
    body('skills', 'skills is required').not().isEmpty(),
    body('status', 'status is required').not().isEmpty()
],
async (req, res)=>{
    //check validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    //pull all fields out
    
    const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        guthubUsername,
        youtube,
        twitter,
        facebook,
        linkedin,
        instagram
    } = req.body; 

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(status) profileFields.status = status;
    if(skills) profileFields.skills = skills.split(',').map(skills => skills.trim());
    // console.log(profileFields.skills);
    if(bio) profileFields.bio = bio;
    if(guthubUsername) profileFields.guthubUsername = guthubUsername;
    //build social object
    profileFields.socials = {};
    if(youtube) profileFields.socials.youtube = youtube;
    if(twitter) profileFields.socials.twitter = twitter;
    if(facebook) profileFields.socials.facebook = facebook;
    if(linkedin) profileFields.socials.linkedin = linkedin;
    if(instagram) profileFields.socials.instagram = instagram;
    
    // res.json({profileFields});

    //push to DB
    try {
        let profile = await Profile.findOne({user: req.user.id});
        if(profile){
            //update if profile found
            profile = await Profile.findOneAndUpdate({user: req.user.id}, {$set: profileFields}, {new: true});
            return res.json(profile);
        }
        //else Create a new Profile
        profile = new Profile(profileFields);
        await profile.save();
        return res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }

});
// @route   GET api/profile/
// @desc    get all profiles
// @access  public
router.get('/', async (reg, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        if(!profiles) return res.status(400).json({msg: 'No Profiles found'});
        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error.');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    get profile by user_id
// @access  public
router.get('/user/:user_id', async (req,res)=>{
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({msg: 'Profile not found'});
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        // console.log(err.kind);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found'});
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;