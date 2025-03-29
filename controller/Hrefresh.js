const User = require('../model/User');
const jwt = require('jsonwebtoken');

const Hrefresh = (req, res) => {


    const {refreshToken} = req.body


    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const found = await User.findOne({ username: decoded.username }).exec()

            if (!found) return res.status(401).json({ message: 'Unauthorizead' })

            //get aka and image to set in redux
            

            const accessToken = jwt.sign(
                {
                    "userinfo": {
                        "username": found.username,
                        "roles": found.roles
                    }
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: '365d' }
            )

            res.status(200).json({ accessToken , image : (found?.image || null ) , aka : (found?.aka) || null});
        }
    )
}



module.exports = { Hrefresh }