const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next){
    //get token from header
    const token = req.header('x-auth-token');

    //check if not token
    if(!token) res.status(401).json({msg: 'No token found, authorization denied...'});

    //verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({msg: 'Token  is not valid...'});
    }
}