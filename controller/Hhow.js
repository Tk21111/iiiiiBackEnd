const How = require('../model/How');

const Hsethow = async (req,res) => {

    const {food , public, imagePath} = req.body;

    if(!req.user) return res.sendStatus(401);
    if(!food || !public) return res.sendStatus(400);

    
    try { await How.create({
        user : req.user,
        food : food,
        public: public,
        imagePath : imagePath || null
    });
    } catch (err) {
        console.error(err + " : setHow");
        return res.json(err)
    }

    return res.sendStatus(200)

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

    const {food , vote , comment , id , howTo} = req.body

    if(!req?.user) return res.sendStatus(401)

   try { const HowTo = await How.findById(id)
    if(!HowTo) return res.sendStatus(404);

    if(vote !== undefined){
        HowTo.vote = vote
    }
    if(comment !== undefined){
        HowTo.comment = comment
    }
    if(howTo !== undefined){
        HowTo.howTo = howTo
    }

    HowTo.save()

    return res.sendStatus(200);
    } catch (err) {
        console.error(err + " : updateHow")
        return res.json(err)
    }
}




module.exports = { Hsethow , Hgethow , Hupdatehow}