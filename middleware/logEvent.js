const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');

const logEvents = async(message) => {
        const datetime = `${format(new Date(), 'yyyyMMdd\tHH:MM:ss')}`;
        const logItem = `${datetime}\t${uuid()}\t${message}\n`;
        console.log(logItem);
        try {
            if (!fs.existsSync(path.join(__dirname, '..', 'log'))) {
                // if don't have logs file make one
                await fsPromise.mkdir(path.join(__dirname, '..', 'log'))
            }

            await fsPromise.appendFile(path.join(__dirname, '..', 'log', 'eventLog.txt'), logItem);

        } catch (err) {
            console.log(err)
        }

    }
    // orgin === google.com maybe
    //url === index page or something 
const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);
    next();
}

module.exports = { logger, logEvents };