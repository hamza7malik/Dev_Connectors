const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const { default: mongoose } = require('mongoose');
const { body, validationResult } = require('express-validator');
const { findOneAndRemove } = require('../../models/User');
const request = require('request');
const config = require('config');
const nodemon = require('nodemon');


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

// @route   DELETE api/profile/
// @desc    delete profile, user of current user
// @access  private
router.delete('/', auth, async (req, res)=>{
    //@todo - delete posts
    //Remove profile of cur user
    try {
        //remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        //remove user
        await Profile.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User Deleted'});
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience (because we are updating experience (which is part of a profile): but we can also use POST)
// @desc    add profile experience
// @access  private
router.put('/experience', 
[
    auth,
    body('title', 'Title is required.').not().isEmpty(), 
    body('company', 'Company is required.').not().isEmpty(),
    body('from', 'From date is required.').not().isEmpty(),
], async (req, res)=>{
    //Check for and return errors
    const errors = validationResult(req);
    if(!errors.isEmpty){
        return res.send(400).json({errors: errors.array()});
    };
    //pull out data from req
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;
    //build json object for experience
    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    //Push/unshift to db
    try {
        const profile = await Profile.findOne({user: req.user.id});
        if(!profile){
            return res.json({msg: 'No profile found.'});
        }
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete an Experience
// @access  private

router.delete('/experience/:exp_id', auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id});
        //get index to delete
        const deleteIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        // remove exp using index
        profile.experience.splice(deleteIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/education
// @desc    add profile education
// @access  private
router.put('/education', 
[
    auth,
    body('school', 'school is required.').not().isEmpty(), 
    body('degree', 'degree is required.').not().isEmpty(),
    body('fieldofStudy', 'field of Study date is required.').not().isEmpty(),
    body('from', 'from date is required.').not().isEmpty(),
], async (req, res)=>{
    //Check for and return errors
    const errors = validationResult(req);
    if(!errors.isEmpty){
        return res.send(400).json({errors: errors.array()});
    };
    //pull out data from req
    const {
        school,
        degree,
        fieldofStudy,
        from,
        to,
        current,
        description
    } = req.body;
    //build json object for experience
    const newEdu = {
        school,
        degree,
        fieldofStudy,
        from,
        to,
        current,
        description
    }
    //Push/unshift to db
    try {
        const profile = await Profile.findOne({user: req.user.id});
        if(!profile){
            return res.json({msg: 'No profile found.'});
        }
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   DELETE api/profile/education/:edu_id
// @desc    Delete an Education
// @access  private

router.delete('/education/:edu_id', auth, async (req, res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id});
        //get index to delete
        const deleteIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        // remove exp using index
        profile.education.splice(deleteIndex, 1);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/github/:username
// @desc    Get users github repos
// @access  public
router.get('/github/:username', async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'} 
        }
        request(options, (error, response, body )=>{
            if(error) console.log(error);
            if(response.statusCode !== 200){
                return res.status(404).json({msg: 'No github profile found'});
            }
            //else return repos
            res.json(JSON.parse(body));
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;