const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    //console.log(req.headers)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'u re fuck ' });
    }

    const token = authHeader.split(' ')[1];

    //const cookie = req.cookies
    //console.log(cookie.jwt)
    //console.log(token)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: 'Invalid token: ' + err + decoded
            });
        }
        //console.log('Decoded JWT:', decoded);
        //console.log(decoded)
        if (!decoded.userinfo) {
            return res.status(403).json({ message: 'code provided is not contient userinfo check auth' });
        }
        //i fucking love u jidgbhdfgjifdgnjdfgnjfdgkfdgfdksasfbgnjsrdnd mfgdjonfmljnomlknjd ffig hdiufhdfu grs thank for being herer i love u so much take u for everthing
        req.user = decoded.userinfo.username;
        req.roles = decoded.userinfo.roles;
        next();
    });
};

module.exports = verifyJWT;