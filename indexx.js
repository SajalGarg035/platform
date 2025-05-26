const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

console.log('🚀 Starting server...');
mongoose.connect('mongodb+srv://sajal:sajal123@cluster0.urmyxu4.mongodb.net/myappdb?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000 // 10 seconds
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));


const db = mongoose.connection;

db.on('error', (err) => {
  console.error('❌ Mongoose connection error (via event):', err);
});

db.once('open', () => {
  console.log('✅ Mongoose connection opened (via event)');
});

