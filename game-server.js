// WebSocket Client for CS File Multiplayer Game

class GameConnection {
    constructor(serverUrl = null) {
        // Auto-detect server URL
        if (!serverUrl) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = window.location.port || (protocol === 'wss:' ? '443' : '4000');
            this.serverUrl = `${protocol}//${host}:${port}`;
        } else {
            this.serverUrl = serverUrl;
        }
        
        this.ws = null;
        this.roomCode = null;
        this.playerId = null;
        this.playerName = null;
        this.isHost = false;
        this.isConnected = false;
        
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onPlayerJoined: null,
            onPlayerLeft: null,
            onGameStateUpdate: null,
            onGameStarted: null,
            onError: null,
            onRoomCreated: null,
            onRoomJoined: null
        };
    }

    // Generate unique player ID
    generatePlayerId() {
        return 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Connect to WebSocket server
    connect(playerName, roomCode = null) {
        return new Promise((resolve, reject) => {
            this.playerId = this.generatePlayerId();
            this.playerName = playerName;
            
            const url = new URL(this.serverUrl);
            url.searchParams.set('playerId', this.playerId);
            if (roomCode) {
                url.searchParams.set('roomCode', roomCode);
            }
            url.searchParams.set('playerName', playerName);

            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.isConnected = true;
                console.log('Connected to WebSocket server');
                if (this.callbacks.onConnect) {
                    this.callbacks.onConnect();
                }
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            this.ws.onclose = () => {
                this.isConnected = false;
                console.log('Disconnected from WebSocket server');
                if (this.callbacks.onDisconnect) {
                    this.callbacks.onDisconnect();
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (this.callbacks.onError) {
                    this.callbacks.onError('Connection error');
                }
                reject(error);
            };
        });
    }

    // Handle incoming messages
    handleMessage(message) {
        console.log('Received message:', message);
        
        switch (message.type) {
            case 'roomCreated':
                this.roomCode = message.roomCode;
                this.isHost = true;
                if (this.callbacks.onRoomCreated) {
                    this.callbacks.onRoomCreated(message.roomCode, message.room);
                }
                break;
                
            case 'roomJoined':
                this.roomCode = message.room.id;
                this.isHost = false;
                if (this.callbacks.onRoomJoined) {
                    this.callbacks.onRoomJoined(message.room);
                }
                break;
                
            case 'playerJoined':
                if (this.callbacks.onPlayerJoined) {
                    this.callbacks.onPlayerJoined(message.playerId, message.playerName);
                }
                break;
                
            case 'playerLeft':
                if (this.callbacks.onPlayerLeft) {
                    this.callbacks.onPlayerLeft(message.playerId);
                }
                break;
                
            case 'gameStarted':
                if (this.callbacks.onGameStarted) {
                    this.callbacks.onGameStarted(message.gameState);
                }
                break;
                
            case 'gameStateUpdate':
                if (this.callbacks.onGameStateUpdate) {
                    this.callbacks.onGameStateUpdate(message.gameState);
                }
                break;
                
            case 'error':
                if (this.callbacks.onError) {
                    this.callbacks.onError(message.message);
                }
                break;
        }
    }

    // Create a room
    async createRoom(playerName, playerCount) {
        await this.connect(playerName);
        
        this.sendMessage({
            type: 'createRoom',
            playerName: playerName,
            playerCount: playerCount
        });
    }

    // Join a room
    async joinRoom(playerName, roomCode) {
        await this.connect(playerName, roomCode);
        
        this.sendMessage({
            type: 'joinRoom',
            roomCode: roomCode,
            playerName: playerName
        });
    }

    // Start the game
    startGame(gameState) {
        this.sendMessage({
            type: 'startGame',
            gameState: gameState
        });
    }

    // Send game state update
    sendGameState(gameState) {
        this.sendMessage({
            type: 'gameStateUpdate',
            gameState: gameState
        });
    }

    // Send player action
    sendPlayerAction(action, data) {
        this.sendMessage({
            type: 'playerAction',
            action: action,
            data: data
        });
    }

    // Send message to server
    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
            if (this.callbacks.onError) {
                this.callbacks.onError('Not connected to server');
            }
        }
    }

    // Disconnect
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    // Set event callbacks
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            isHost: this.isHost,
            roomCode: this.roomCode,
            playerId: this.playerId,
            playerName: this.playerName
        };
    }
}
