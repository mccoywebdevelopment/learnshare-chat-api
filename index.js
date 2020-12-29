const app = require('express')();
const http = require('http').Server(app);
const cors = require('cors');
const MessageModel = require('./models/Message');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const db = process.env.MONGO_TESTING_URI || require("./config/secret").MONGO_TESTING_URI;
const PORT = process.env.PORT || require("./config/secret").PORT;
const firebaseAdmin = require('firebase-admin');
const socketioOptions = {cors: {origin: "*"}};
var io = require("socket.io")(http,socketioOptions);

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var serviceAccount = require("./config/secret").FIREBASE_SERVICE_ACCOUNT;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || require('./config/secret').FIREBASE_DATABASE_URL
});

io.use(require('./config/firebaseAuth').verifyUser);

http.listen(PORT, function(){
  console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nlistening on *:' + PORT);
});

module.exports = {io:io}

mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('\nDatabase is connected.')
    require('./http/index');
    app.use('/chat/',require('./routes/chat'));
  }).catch(err => console.log("\n"+err));
