const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HLogout = async(req, res) => {
    // on client delete accessToken 
    const cookie = req.cookies;
    if (!cookie.jwt) return res.sendStatus(204);
    const refreshToken = cookie.jwt;

    //Is user refreshToken in db
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false }); //chane to true production
        return res.sendStatus(204)
    }

    //delete refreshTonken in db
    foundUser.refreshToken = '';
    const result = await foundUser.save();
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false });
    res.sendStatus(204);
}

module.exports = { HLogout }