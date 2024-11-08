const How = require('../model/How');
const User = require('../model/User');

/*
const Hsethow = async (req, res) => {
    console.log("Request received:", req.method, req.url);
    const images = req.files;
    const imagePaths = images?.map(file => file.path); // Extract paths of uploaded images

    // Extract data from the request body
    const { tag, public, des, food, ingredent } = req.body;

    // Check if user is authenticated
    if (!req.user) return res.sendStatus(401);

    // Optional: Uncomment if tag, des, or food are required fields
    // if (!tag || !des || !food) return res.sendStatus(400);

    try { 
        // Find the user ID based on the username in req.user
        const user = await User.findOne({ username: req.user }).exec();
        if (!user) {
            console.error("User not found");
            return res.status(404).json({ error: "User not found" });
        }

        // Create a new How document with the extracted data
        const newHow = await How.create({
            user: user._id,
            food: food,
            tag: tag,
            ingredent: ingredent,
            public: public,
            des: des,
            imagePath: imagePaths || null
        });

        // Send success response
        return res.json({ message: "Data saved successfully", newHow });
    } catch (err) {
        // Log the error and send a server error response
        console.error("Error in Hsethow:", err);
        return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};
*/
const Hsethow = async (req,res) => {

    const file = req.files

    const path = file.map(val => val?.path)

    const {tag , public ,des , food , ingredent}  = req.body;

   
    if(!req.user) return res.sendStatus(401);
    //if(!tag || !des || !food) return res.sendStatus(400);

    
    try { 
        const userId = await User.findOne({username : req.user}).exec()

        await How.create({
        user : userId._id,
        food : food,
        tag : tag,
        ingredent : ingredent,
        public: public,
        des : des ,
        images : path || null
    });
    return res.json({"m" : "ok"})
    } catch (err) {
        console.error(err + " : setHow");
        return res.json(err)
    }

    

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

const HdelHow = async (req, res) =>  {

    const {id} = req.id

    if(!id) return res.sendStatus(400);

    try {
        const how = await  How.findById(id)
        if(!how) return res.sendStatus(404);

        how.images.forEach( p => {
            fs.unlink(p, (err) => {
                if (err) {
                  // An error occurred while deleting the file
                  if (err.code === 'ENOENT') {
                    // The file does not exist
                    console.error('The file does not exist');
                  } else {
                    // Some other error
                    console.error(err.message);
                  }
                } else {
                  // The file was deleted successfully
                  console.log('The file was deleted');
                }
              });
        });

    const result = await how.deleteOne()

    return res.json(result);



    } catch (err) {
        console.log(err + " ; delHow")
        return res.json(err)
    }
}




module.exports = { Hsethow , Hgethow , Hupdatehow , HdelHow}