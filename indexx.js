const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');

console.log('🚀 Starting server...');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sajal:sajal123@cluster0.urmyxu4.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));
mongoose.set('debug', true);

