const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();


const app = express();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const ACTIONS = require('./src/actions/Actions');

// Import routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

// Passport configuration - import after routes
require('./config/passport');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sajal:sajal123@cluster0.urmyxu4.mongodb.net/codesync-pro', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'codesync-pro-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://sajal:sajal123@cluster0.urmyxu4.mongodb.net/codesync-pro',
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve static files from the React app build directory only if it exists
const buildPath = path.join(__dirname, 'build');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
} else {
    console.warn('⚠️ Build directory not found. Run "npm run build" to create production build.');
}

const userSocketMap = {};
function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

function compileAndRunCode(code, language, inputs = [], callback) {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    let fileName, command;
    const timestamp = Date.now();
    const startTime = Date.now();

    // Prepare input data
    let inputData = '';
    if (inputs && inputs.length > 0) {
        inputData = inputs.map(input => input.value).join('\n') + '\n';
    }

    switch (language) {
        case 'javascript':
            fileName = `temp_${timestamp}.js`;
            
            // Modify code to handle inputs
            let modifiedCode = code;
            if (inputs.length > 0) {
                const inputValues = inputs.map(input => `"${input.value}"`).join(', ');
                modifiedCode = `
                // Simulated inputs: ${inputs.map(i => `${i.label}=${i.value}`).join(', ')}
                const inputs = [${inputValues}];
                let inputIndex = 0;
                const readline = { question: (prompt, callback) => { 
                    console.log(prompt + inputs[inputIndex] || ''); 
                    callback(inputs[inputIndex++] || ''); 
                }};
                
                ${code}
                `;
            }
            
            fs.writeFileSync(path.join(tempDir, fileName), modifiedCode);
            command = `node ${path.join(tempDir, fileName)}`;
            break;
            
        case 'python':
            fileName = `temp_${timestamp}.py`;
            
            let pythonCode = code;
            if (inputs.length > 0) {
                // Create input file for Python
                const inputFileName = `input_${timestamp}.txt`;
                fs.writeFileSync(path.join(tempDir, inputFileName), inputData);
                
                pythonCode = `
# Simulated inputs: ${inputs.map(i => `${i.label}=${i.value}`).join(', ')}
import sys
sys.stdin = open('${inputFileName}', 'r')

${code}
`;
            }
            
            fs.writeFileSync(path.join(tempDir, fileName), pythonCode);
            command = `cd ${tempDir} && python3 ${fileName}`;
            break;
            
        case 'cpp':
        case 'clike':
            fileName = `temp_${timestamp}.cpp`;
            const executableName = `temp_${timestamp}`;
            
            fs.writeFileSync(path.join(tempDir, fileName), code);
            
            if (inputs.length > 0) {
                const inputFileName = `input_${timestamp}.txt`;
                fs.writeFileSync(path.join(tempDir, inputFileName), inputData);
                command = `cd ${tempDir} && g++ ${fileName} -o ${executableName} && ./${executableName} < ${inputFileName}`;
            } else {
                command = `cd ${tempDir} && g++ ${fileName} -o ${executableName} && ./${executableName}`;
            }
            break;
            
        default:
            callback({ error: 'Language not supported for compilation' });
            return;
    }

    exec(command, { timeout: 15000, cwd: tempDir }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        
        // Clean up temp files
        try {
            if (fs.existsSync(path.join(tempDir, fileName))) {
                fs.unlinkSync(path.join(tempDir, fileName));
            }
            if (language === 'clike' || language === 'cpp') {
                const execPath = path.join(tempDir, `temp_${timestamp}`);
                if (fs.existsSync(execPath)) {
                    fs.unlinkSync(execPath);
                }
            }
            // Clean up input files
            const inputFileName = `input_${timestamp}.txt`;
            if (fs.existsSync(path.join(tempDir, inputFileName))) {
                fs.unlinkSync(path.join(tempDir, inputFileName));
            }
        } catch (e) {
            console.log('Cleanup error:', e);
        }

        if (error) {
            callback({ 
                error: error.message, 
                stderr: stderr,
                executionTime 
            });
        } else {
            callback({ 
                output: stdout, 
                stderr: stderr,
                executionTime 
            });
        }
    });
}

io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
        console.log(`👤 ${username} joined room ${roomId}`);
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.COMPILE_CODE, ({ roomId, code, language, username, inputs = [], executionMode = 'no-input', startTime }) => {
        console.log(`🚀 Compiling ${language} code in room ${roomId} with ${inputs.length} inputs`);
        const actualStartTime = startTime || Date.now();
        
        compileAndRunCode(code, language, inputs, (result) => {
            io.to(roomId).emit(ACTIONS.COMPILATION_RESULT, {
                result,
                username: userSocketMap[socket.id],
                executionTime: result.executionTime,
                inputs: inputs
            });
        });
    });

    socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message, username }) => {
        socket.in(roomId).emit(ACTIONS.RECEIVE_MESSAGE, {
            message,
            username,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        console.log(`👋 ${userSocketMap[socket.id]} disconnected`);
        delete userSocketMap[socket.id];
    });

    socket.on('error', (error) => {
        console.error('🔥 Socket error:', error);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Handle React routes - only serve index.html for non-API routes
app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            success: false, 
            message: 'API endpoint not found' 
        });
    }
    
    const indexPath = path.join(__dirname, 'build', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).json({
            message: 'CodeSync Pro API Server is running',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                health: '/api/health'
            },
            note: 'Build your React app with "npm run build" to serve the frontend'
        });
    }
});

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});