const How = require('../model/How');
const User = require('../model/User');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: 'back-iiiii', // Replace with your Google Cloud Project ID
    keyFilename: 'back-iiiii-3f4f26c39c9e.json' // Path to your service account key file
});
const bucketName = 'back-iiiii-img';

const deleteFromGCS = async (fileName) => {
    try {
        const file = storage.bucket(bucketName).file(fileName);
        await file.delete();
        console.log(`File ${fileName} deleted successfully.`);
        return { success: true, message: `File ${fileName} deleted successfully.` };
    } catch (error) {
        console.error(`Failed to delete file ${fileName}:`, error);
        return { success: false, message: `Failed to delete file ${fileName}: ${error.message}` };
    }
};


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


    let  {tag , public : view ,des , name , ingredent , fileInfo}  = req.body;

   
    if(!req.user) return res.sendStatus(401);

    
    if(!tag || !des || !name) return res.sendStatus(400);

    //i gave up on writing this shit so chat gpt it is
    
    try { 
        const userId = await User.findOne({username : req.user}).exec()

        await How.create({
        user : userId._id,
        name : name,
        tag : tag,
        ingredent : (JSON.parse(ingredent)),
        public: view,
        des : des ,
        images : fileInfo || null
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

const HdelHow = async (req, res) => {

    const { id } = req.body;

    if (!id) return res.sendStatus(400); // Bad Request

    try {
        // Fetch the document and validate existence
        const how = await How.findById(id);
        if (!how) return res.sendStatus(404); // Not Found

        const userHow = await User.findById(how.user);
        if (userHow.username !== req.user) return res.sendStatus(403); // Forbidden

        // Delete all associated images in Google Cloud Storage


        if (how.images) {
            const deleteResults = await Promise.all(
                how.images.map(async (info) => {
                    try {
                        const result = await deleteFromGCS(info.fileName);
                        return result.success; // Return whether deletion was successful
                    } catch (err) {
                        console.error(`Error deleting file ${info.fileName}:`, err);
                        return false; // Return false if deletion fails
                    }
                })
            );

            // Check if all deletions succeeded
            if (!deleteResults.every((result) => result)) {
                return res.status(500).json({ message: "Failed to delete all images" });
            }
        }

        // Delete the document itself
        const result = await how.deleteOne();
        return res.json(result);
    } catch (err) {
        console.error("Error in HdelHow:", err);
        return res.status(500).json({ error: err.message });
    }
};





module.exports = { Hsethow , Hgethow , Hupdatehow , HdelHow}