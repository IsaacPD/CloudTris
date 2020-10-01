const mongoose = require('mongoose')

const CLOUDTRIS_DB_ADDR = process.env.CLOUDTRIS_DB_ADDR; 
const mongoURI = "mongodb://" + CLOUDTRIS_DB_ADDR + "/guestbook"

const db = mongoose.connection;
db.on('disconnected', () => {
    console.error(`Disconnected: unable to reconnect to ${mongoURI}`)
})
db.on('error', (err) => {
    console.error(`Unable to connect to ${mongoURI}: ${err}`);
});
db.once('open', () => {
  console.log(`Connected to ${mongoURI}`);
});

const connectToMongoDB = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        connectTimeoutMS: 2000,
        reconnectTries: 5,
        useUnifiedTopology: true
    })
};


module.exports = {
    connectToMongoDB: connectToMongoDB
}

