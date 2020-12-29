const firebaseAdmin = require('firebase-admin');

function verifyUser(socket, next) {
    firebaseAdmin
        .auth()
        .verifyIdToken(socket.handshake.query['uuid'])
        .then((decodedToken) => {
            socket._user = decodedToken;
            socket.uuid = socket.handshake.query['uuid'];
            next();
        })
        .catch((error) => {
            console.log(error);
            next(error);
            // Handle error
        });
}

function verifyUserRoute(req, res, next) {
    if (!req.params.uuid) {
        next("Please provide uuid for firebase.")
    } else {
        firebaseAdmin
            .auth()
            .verifyIdToken(req.params.uuid)
            .then((decodedToken) => {
                req._user = decodedToken;
                next();
            })
            .catch((error) => {
                next(error);
            });
    }
}


module.exports = { verifyUser, verifyUserRoute }