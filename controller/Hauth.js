const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Hauth = async(req, res) => {

    console.log(req.body)
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
            { expiresIn: '365d' });


        const refreshToken = jwt.sign(
            {
                 "username": found.username 
                }, process.env.REFRESH_TOKEN, 
                { expiresIn: '515151515d' });

              
        console.log({ roles, accessToken , refreshToken , image : (found?.image || null ) , aka : (found?.aka) || null});
        res.status(200).json({ accessToken , refreshToken , image : (found?.image || null ) , aka : (found?.aka) || null , roles});
    } else {
        console.log('!match')
        res.sendStatus(401);
    }
}

module.exports = { Hauth }