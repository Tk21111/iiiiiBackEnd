const User = require('../model/User');

async function generateUniqueRandomNumber(foundUser) {
    let uniqueNumberFound = false;
    let randomNumber;
    let same = false;
    if (foundUser.no){
        same = await foundUser.no;
    }

    while (!uniqueNumberFound) {
        randomNumber = Math.floor(Math.random() * 37) ;
        //console.log(randomNumber)

        try {
            const match = await User.findOne({ randnum: randomNumber });
            
            if (!match && same !== randomNumber ) {
                uniqueNumberFound = true;
            }
        } catch (err) {
            console.error(err);
        }
    }

    //console.log("Generated unique random number:", randomNumber);
    return randomNumber;
}

const getrand = async(req, res) => {
    const username = req.user
    if (!username) return res.status(401).json({ 'message': 'cookie is not found' });

    const foundUser = await User.findOne({ username }).exec();

    if (!foundUser?.randnum) return res.status(403).json({'message' : 'either u dont have generated number yet or u some how get in to this page'});
    const result = foundUser.randnum;
    res.json(result);
}
const setrand = async(req, res) => {
    const username = req.user;
    if (!username) return res.status(401).json({ 'message': 'cookie is not found ' });

    const foundUser = await User.findOne({ username }).exec();

    if (foundUser.randnum >= 0) {
        return res.status(409).json({ 'message': 'already have number or sometime it just bug and show this' });
    } else {

        try {
            const randomNumber = await generateUniqueRandomNumber(foundUser);
            foundUser.randnum = randomNumber;
            await foundUser.save();
            console.log("User saved with unique random number:", randomNumber);
            res.json(randomNumber);
        } catch (err) {
            res.json({ 'message': err });
        }

        

    }
}

const getAll = async(req, res) => {
    console.log(req)
    const userAll = await User.find();
    if (!userAll) return res.status(204).json({ 'message': 'User not found' });
    res.json(userAll);
}
// no going
const checkDupilcate = async(req, res) => {
    let DullList = []
    let UserAll = await User.find()
    for (i= 0 ; i<=36 ; i++){
        let result = UserAll.filter(obj => obj.randnum === i)
        console.log(result)
        if (result.length > 1){
            //don't forget [i] : key is string
            DullList.push({ [i] : result.map(user => user.no)})
        }
        result = null
    }
    //console.log(DullList)
    if (DullList.length >= 1){
        res.json(DullList)
    } else res.json('None Dupilcate')
}
const giveBy = async (req,res)=>{
    const username = req.user;
    if(!username) return res.status(403).send('No cookie');
    const found = await User.findOne({username : username}).exec();
    if(!found) return res.status(401).send('Unauthorized');
    const foundNo = found.no;
    const match = await User.findOne({randnum : foundNo}).exec();
    if(!match) return res.status(404).send('Not found contract me');
    res.json(match);
    }

const adminGive = async (req,res) => {
    for (i=0 ; i<=36 ; i++){
        const user = await User.findOne({no : i})
        console.log(i)
        if (user){
            console.log(user)
            user.roles = { 'User': 2001 , 'Editor': 1984}
            await user.save()
        }
    }
    res.status(200).json({'messsage' : 'done'})
}
module.exports = { getrand, setrand, getAll, checkDupilcate ,giveBy , adminGive};