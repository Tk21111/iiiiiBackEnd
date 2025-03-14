const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.roles) return res.sendStatus(401);
        //console.log(req.roles)
        rolesArray = allowedRoles
        console.log(rolesArray)
        const reqRole = Object.values(req.roles)
        const result = reqRole.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result) return res.sendStatus(401);
        next();
    }
}

module.exports = verifyRoles