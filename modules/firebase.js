const { initializeApp } = require('firebase/app');
const { getStorage } = require('firebase/storage');

require('dotenv').config();

const {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId
} = process.env;

const app = initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId
});

const Store = getStorage(app, process.env.StorageLink);

module.exports = {Store};