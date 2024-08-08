const path = require('path');
const fs = require('fs');
const fsPromise = require('fs').promises;


const pathChecker = async (req, file) => {
    const userDir = 'pubilc/image/'+ req.user;

    // Check if the directory exists, and create it if it doesn't
    if (!fs.existsSync(userDir)) {
        await fsPromise.mkdir(userDir, { recursive: true });
    }

    let find = null;
    let i = 0;

    
};

const nameChecker = async(req , file) => {
    
    let i = 0;
    let find;
    while (!find) {
        // Generate a potential file path
        let filePath =`pubilc/image/${req.user}/${i === 0 ? file.originalname : `${i}${file.originalname}`}`//path.join(userDir, i === 0 ? file.originalname : `${i}_${file.originalname}`);
        
        // Check if the file already exists
        if (!fs.existsSync(filePath)) {
            find = filePath.split('/',4)[3];  // If the file doesn't exist, set `find` to the file path
        } else {
            i++;  // Increment `i` to try a different file name
        }
    }
    console.log(find)

    return find; // Return the unique file path
}

module.exports = { pathChecker , nameChecker };
