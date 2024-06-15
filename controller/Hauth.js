const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Hauth = async(req, res) => {
    const { user , pwd} = req.body;
    if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required ' });
    const found = await User.findOne({ username: user }).exec();
    if (!found) return res.sendStatus(401); //unauthorized
    const match = await bcrypt.compare(pwd, found.password);
    if (match) {
        const roles = found.roles
        
        //jwts

        const accessToken = jwt.sign(
            {
                "userinfo": {
                    "username": found.username,
                    "roles": roles,
                }
            }, 
            process.env.ACCESS_TOKEN, 
            { expiresIn: '1h' });


        const refreshToken = jwt.sign(
            {
                 "username": found.username 
                }, process.env.REFRESH_TOKEN, 
                { expiresIn: '7d' });


        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Ensure secure is true in production
            sameSite: 'None', // Required for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
                

        res.status(200).json({ accessToken });
    } else {
        console.log('!match')
        res.sendStatus(401);
    }
}

module.exports = { Hauth }