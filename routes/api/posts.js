const express = require('express');
const {body, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

const router = express.Router();

// @route   POST api/posts
// @desc    create a post
// @access  private
router.post('/', [
    auth,
    body('text', 'Text is required').not().isEmpty()
], async (req,res) => {
    //check for errors
    const errors = validationResult(req);
    if(!errors.isEmpty){
        return res.status(400).json({errors: errors.array()});
    }
    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }); 

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }


});

// @route   GET api/posts
// @desc    get all posts
// @access  private
router.get('/', auth, async (req, res)=>{
    try {
        const posts = await Post.find().sort({ date: '-1'});
        if(!posts){
            return res.status(404).json({msg: 'No posts found'});
        }
        res.json(posts);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:post_id
// @desc    get post by post id
// @access  public
router.get('/:post_id', auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post){
            return res.status(404).json('No post found');
        }
        res.json(post);
    } catch (err) {
        console.log(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(404).json('No post found');
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:post_id
// @desc    DELETE post by post id
// @access  private
router.delete('/:post_id', auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post){
            return res.status(404).json({msg: 'Post not found'});
        }
        if(post.user.toString() != req.user.id){
            return res.status(401).json({msg: 'User not authorized'});
        }
        await post.remove();
        res.json({msg: 'Post removed'});
    } catch (err) {
        console.log(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(404).json('No post found');
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;