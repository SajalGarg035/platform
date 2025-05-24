const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your-jwt-secret'
}, async (payload, done) => {
    try {
        const user = await User.findById(payload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        console.error('🔥 JWT Strategy error:', error);
        return done(error, false);
    }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('📧 Google OAuth profile received:', profile.emails[0].value);
            
            // Check if user already exists with this Google ID
            let existingUser = await User.findOne({ 
                providerId: profile.id, 
                provider: 'google' 
            });
            
            if (existingUser) {
                existingUser.lastLogin = new Date();
                await existingUser.save();
                console.log('✅ Existing Google user logged in:', existingUser.email);
                return done(null, existingUser);
            }
            
            // Check if user exists with this email
            const email = profile.emails[0].value;
            existingUser = await User.findOne({ email });
            
            if (existingUser) {
                // Link Google account to existing user
                existingUser.provider = 'google';
                existingUser.providerId = profile.id;
                existingUser.profilePicture = profile.photos[0]?.value;
                existingUser.lastLogin = new Date();
                existingUser.isVerified = true;
                await existingUser.save();
                console.log('✅ Linked Google account to existing user:', existingUser.email);
                return done(null, existingUser);
            }
            
            // Create new user
            const username = profile.displayName || email.split('@')[0];
            const newUser = new User({
                username: await generateUniqueUsername(username),
                email,
                provider: 'google',
                providerId: profile.id,
                profilePicture: profile.photos[0]?.value,
                isVerified: true,
                lastLogin: new Date()
            });
            
            await newUser.save();
            console.log('✅ New Google user created:', newUser.email);
            done(null, newUser);
        } catch (error) {
            console.error('🔥 Google OAuth error:', error);
            done(error, null);
        }
    }));
} else {
    console.warn('⚠️ Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🐙 GitHub OAuth profile received:', profile.username);
            
            // Check if user already exists with this GitHub ID
            let existingUser = await User.findOne({ 
                providerId: profile.id, 
                provider: 'github' 
            });
            
            if (existingUser) {
                existingUser.lastLogin = new Date();
                await existingUser.save();
                console.log('✅ Existing GitHub user logged in:', existingUser.username);
                return done(null, existingUser);
            }
            
            // Check if user exists with this email
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
            existingUser = await User.findOne({ email });
            
            if (existingUser) {
                // Link GitHub account to existing user
                existingUser.provider = 'github';
                existingUser.providerId = profile.id;
                existingUser.profilePicture = profile.photos[0]?.value;
                existingUser.lastLogin = new Date();
                existingUser.isVerified = true;
                await existingUser.save();
                console.log('✅ Linked GitHub account to existing user:', existingUser.email);
                return done(null, existingUser);
            }
            
            // Create new user
            const username = profile.username || profile.displayName;
            const newUser = new User({
                username: await generateUniqueUsername(username),
                email,
                provider: 'github',
                providerId: profile.id,
                profilePicture: profile.photos[0]?.value,
                isVerified: true,
                lastLogin: new Date()
            });
            
            await newUser.save();
            console.log('✅ New GitHub user created:', newUser.username);
            done(null, newUser);
        } catch (error) {
            console.error('🔥 GitHub OAuth error:', error);
            done(error, null);
        }
    }));
} else {
    console.warn('⚠️ GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}

// Helper function to generate unique username
async function generateUniqueUsername(baseUsername) {
    let username = baseUsername;
    let counter = 1;
    
    while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }
    
    return username;
}

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.error('🔥 Deserialize user error:', error);
        done(error, null);
    }
});
