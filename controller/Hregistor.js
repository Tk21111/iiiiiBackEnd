const User = require('../model/User');
const bcrypt = require('bcrypt');

const Hnewuser = async(req, res) => {
    const { user, pwd } = req.body;
    if (!user || !pwd ) return res.status(400).json({ 'message': 'Username , password and yours number are required ' });

    const duplicate = await User.findOne({ username: user }).exec().lean();
    if (duplicate ) return res.sendStatus(409); //conflict
    try {
        const hashpwd = await bcrypt.hash(pwd, 10);

        const result = await User.create({
            "username": user,
            "password": hashpwd,
            
        });

        res.status(200).json({ 'message': `${user}  has been created` })
    } catch (err) {
        res.status(500).json({
            message : err.message
        })
    }
}

module.exports = { Hnewuser }