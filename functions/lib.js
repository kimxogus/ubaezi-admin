const functions = require('firebase-functions');

const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

const database = admin.database();

exports.functions = functions;
exports.admin = admin;
exports.database = database;
