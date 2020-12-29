const app = require('express')();
const http = require('http').Server(app);
const cors = require('cors');
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

var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || require("./config/secret").FIREBASE_SERVICE_ACCOUNT);

/* paste the following below after uncommenting it in cmd inside config vars in heroku (web) config vars
console.log(JSON.stringify(serviceAccount));
*/

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
    app.get("/",function(req,res){
      res.send("success")
    });
  }).catch(err => console.log("\n"+err));
