const How = require('../model/How');
const User = require('../model/User');

const Hsethow = async (req,res) => {

    const {tag , public, imagePath ,des , food}  = req.body;
   
    if(!req.user) return res.sendStatus(401);
    if(!tag || !public || !des || !food) return res.sendStatus(400);

    
    try { 
        const userId = await User.findOne({username : req.user}).exec()

        await How.create({
        user : userId._id,
        food : food,
        tag : tag,
        public: public,
        des : des ,
        imagePath : imagePath || null
    });
    } catch (err) {
        console.error(err + " : setHow");
        return res.json(err)
    }

    return res.json({"m" : "ok"})

};

const Hgethow = async (req,res) => {

    try{
        const data = await How.find()
        return res.json(data)
    } catch (err){
        console.error(err + " : getHow");
        return res.json(err)
    }
}

const Hupdatehow = async (req,res) => {

    const {tag , id , des , food} = req.body

    if(!req?.user) return res.sendStatus(401)

   try { const HowTo = await How.findById(id)
    if(!HowTo) return res.sendStatus(404);

   
    if(des !== undefined){
        HowTo.des = des
    }
    if(food !== undefined){
        HowTo.food = des
    }
    if(tag !== undefined){
        HowTo.tag = des
    }

    await HowTo.save()

    return res.sendStatus(200);
    } catch (err) {
        console.error(err + " : updateHow")
        return res.json(err)
    }
}




module.exports = { Hsethow , Hgethow , Hupdatehow}