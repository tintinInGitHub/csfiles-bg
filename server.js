const WebSocket = require('ws');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Create HTTP server
const server = http.createServer((req, res) => {
    // CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found, serve index.html for SPA routing
            if (req.url.startsWith('/')) {
                fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data);
                    }
                });
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        } else {
            // File exists, serve it
            const ext = path.extname(filePath);
            const contentType = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.ico': 'image/x-icon'
            }[ext] || 'text/plain';

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                }
            });
        }
    });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Game state management
const rooms = new Map();
const players = new Map();
let roomCounter = 1000;

// Generate unique room code
function generateRoomCode() {
    roomCounter++;
    return roomCounter.toString();
}

// Create a new room
function createRoom(hostPlayerId, playerCount) {
    const roomCode = generateRoomCode();
    const room = {
        id: roomCode,
        hostPlayerId: hostPlayerId,
        playerCount: playerCount,
        players: [],
        gameState: null,
        status: 'waiting', // waiting, playing, finished
        createdAt: Date.now()
    };

    rooms.set(roomCode, room);
    return roomCode;
}

// Join a room
function joinRoom(roomCode, playerId, playerName) {
    const room = rooms.get(roomCode);
    if (!room) {
        throw new Error('Room not found');
    }

    if (room.status !== 'waiting') {
        throw new Error('Game already in progress');
    }

    if (room.players.length >= room.playerCount) {
        throw new Error('Room is full');
    }

    const player = {
        id: playerId,
        name: playerName,
        joinedAt: Date.now(),
        isHost: room.players.length === 0
    };

    room.players.push(player);
    players.set(playerId, { roomCode, player });

    return room;
}

// Leave a room
function leaveRoom(playerId) {
    const playerInfo = players.get(playerId);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    players.delete(playerId);

    if (room.players.length === 0) {
        rooms.delete(playerInfo.roomCode);
    } else if (room.players.length === 1) {
        room.players[0].isHost = true;
    }

    return playerInfo.roomCode;
}

// Broadcast to all players in a room
function broadcastToRoom(roomCode, message, excludePlayerId = null) {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.players.forEach(player => {
        if (player.id !== excludePlayerId) {
            const playerWs = players.get(player.id)?.ws;
            if (playerWs && playerWs.readyState === WebSocket.OPEN) {
                playerWs.send(JSON.stringify(message));
            }
        }
    });
}

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const parameters = url.parse(req.url, true);
    const playerId = parameters.query.playerId;
    const roomCode = parameters.query.roomCode;
    const playerName = parameters.query.playerName;

    console.log(`Player ${playerId} (${playerName}) connected to room ${roomCode}`);

    // Store WebSocket connection
    if (players.has(playerId)) {
        players.get(playerId).ws = ws;
    }

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleMessage(ws, message, playerId);
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });

    // Handle client disconnect
    ws.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        const roomCode = leaveRoom(playerId);
        if (roomCode) {
            broadcastToRoom(roomCode, {
                type: 'playerLeft',
                playerId: playerId
            });
        }
    });

    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Handle different message types
function handleMessage(ws, message, playerId) {
    switch (message.type) {
        case 'createRoom':
            handleCreateRoom(ws, message, playerId);
            break;
        case 'joinRoom':
            handleJoinRoom(ws, message, playerId);
            break;
        case 'startGame':
            handleStartGame(ws, message, playerId);
            break;
        case 'gameStateUpdate':
            handleGameStateUpdate(ws, message, playerId);
            break;
        case 'playerAction':
            handlePlayerAction(ws, message, playerId);
            break;
        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type'
            }));
    }
}

// Handle room creation
function handleCreateRoom(ws, message, playerId) {
    try {
        const { playerName, playerCount } = message;
        const roomCode = createRoom(playerId, playerCount);
        const room = joinRoom(roomCode, playerId, playerName);
        
        // Store WebSocket connection
        players.get(playerId).ws = ws;

        // Send success response
        ws.send(JSON.stringify({
            type: 'roomCreated',
            roomCode: roomCode,
            room: room
        }));

        console.log(`Room ${roomCode} created by ${playerName}`);
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'error',
            message: error.message
        }));
    }
}

// Handle room joining
function handleJoinRoom(ws, message, playerId) {
    try {
        const { roomCode, playerName } = message;
        const room = joinRoom(roomCode, playerId, playerName);
        
        // Store WebSocket connection
        players.get(playerId).ws = ws;

        // Send success response
        ws.send(JSON.stringify({
            type: 'roomJoined',
            room: room
        }));

        // Notify other players
        broadcastToRoom(roomCode, {
            type: 'playerJoined',
            playerId: playerId,
            playerName: playerName
        }, playerId);

        console.log(`Player ${playerName} joined room ${roomCode}`);
    } catch (error) {
        ws.send(JSON.stringify({
            type: 'error',
            message: error.message
        }));
    }
}

// Handle game start
function handleStartGame(ws, message, playerId) {
    const playerInfo = players.get(playerId);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room || room.hostPlayerId !== playerId) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Only the host can start the game'
        }));
        return;
    }

    room.status = 'playing';
    
    // Broadcast game start to all players
    broadcastToRoom(playerInfo.roomCode, {
        type: 'gameStarted',
        gameState: message.gameState
    });

    console.log(`Game started in room ${playerInfo.roomCode}`);
}

// Handle game state updates
function handleGameStateUpdate(ws, message, playerId) {
    const playerInfo = players.get(playerId);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room) return;

    room.gameState = message.gameState;
    
    // Broadcast to other players
    broadcastToRoom(playerInfo.roomCode, {
        type: 'gameStateUpdate',
        gameState: message.gameState
    }, playerId);
}

// Handle player actions
function handlePlayerAction(ws, message, playerId) {
    const playerInfo = players.get(playerId);
    if (!playerInfo) return;

    // Broadcast action to other players
    broadcastToRoom(playerInfo.roomCode, {
        type: 'playerAction',
        playerId: playerId,
        action: message.action,
        data: message.data
    }, playerId);
}

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`CS File WebSocket server running on port ${PORT}`);
    console.log(`WebSocket URL: ws://localhost:${PORT}`);
    console.log(`Game URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    wss.close(() => {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
});
