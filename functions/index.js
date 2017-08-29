const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const database = admin.database();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});
