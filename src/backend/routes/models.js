const mongoose = require('mongoose')
const shortid = require('shortid')
const Schema = mongoose.Schema;

const CLOUDTRIS_DB_ADDR = process.env.CLOUDTRIS_DB_ADDR; 
const mongoURI = "mongodb://" + CLOUDTRIS_DB_ADDR + "/cloudtris"

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

const userSchema = new Schema({
    id: {
        type: String, 
        index: 'hashed', 
        default: () => {return "Guest#" + shortid.generate()}
    }
})

const messageSchema = new Schema({
    text: String,
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    timestamp: {
		type: Number,
		default: () => Math.floor(Date.now() / 1000) // Date in unix time, Date.now returns in milliseconds so need seconds ID
	}
})

const roomSchema = new Schema({
    _id: {type: String, index: 'hashed', default: shortid.generate},
    users: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Message',
        index: true
    }]
})

const connectToMongoDB = async () => {
    await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        connectTimeoutMS: 2000,
        reconnectTries: 5,
        useUnifiedTopology: true
    })
};

module.exports = {
    connectToMongoDB: connectToMongoDB,
    Room: mongoose.model('Room', roomSchema),
    User: mongoose.model('User', userSchema),
    Message: mongoose.model('Message', messageSchema)
}

