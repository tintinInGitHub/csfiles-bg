# CS File: Crime Scene Files - Multiplayer Web Game

A web-based multiplayer version of the CS File: Crime Scene Files board game, featuring real-time WebSocket communication for cross-device gameplay.

## 🌟 Features

- **Real-time Multiplayer**: Play with friends across different devices using WebSocket connections
- **Room-based System**: Create or join rooms using 6-digit room codes
- **Cross-platform**: Works on any device with a modern web browser
- **Authentic Gameplay**: Full implementation of the original board game mechanics
- **Neon Crime Aesthetic**: Beautiful dark theme with neon accents

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone or download the project files**

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Start the WebSocket server**
   ```bash
   npm start
   ```
   The server will start on `http://localhost:4000`

4. **Open the game in your browser**
   - Open `index.html` in your web browser
   - Or serve the files using a local server (recommended)

### Running with a Local Server (Recommended)

For the best experience, serve the files using a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (install http-server globally first)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 🎮 How to Play

### Setting Up a Game

1. **Host Setup**:
   - Enter your name
   - Choose number of players (4-12)
   - Click "Create Room"
   - Share the room code with other players

2. **Player Join**:
   - Enter your name
   - Enter the room code from the host
   - Click "Join Room"

3. **Start Game**:
   - Host waits for enough players (minimum 4)
   - Host clicks "Start Game" when ready
   - All players automatically join the game

### Game Rules

**Objective**: 
- **Investigators**: Identify the Murderer, their Clue Card, and Mean Card
- **Murderer**: Avoid detection or guess the Witness correctly if caught

**Game Phases**:
1. **Night Phase**: Murderer secretly selects crime evidence
2. **Investigation Phase**: 3 rounds of clue revealing and discussion
3. **Endgame**: Final guesses and victory determination

## 🛠️ Technical Details

### Architecture

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with WebSocket server
- **Communication**: Real-time WebSocket protocol
- **State Management**: Client-side game state with server synchronization

### File Structure

```
csfiles/
├── index.html              # Main game interface
├── styles.css              # Game styling and animations
├── game-data.js            # Static game data (cards, roles)
├── game-utils.js           # Utility functions
├── game-ui.js              # UI management and interactions
├── game-core.js            # Core game logic and state
├── game-server.js          # WebSocket client connection
├── game-controller.js      # Main game orchestration
├── game.js                 # Game initialization
├── server.js               # WebSocket server
├── package.json            # Server dependencies
└── README.md               # This file
```

### WebSocket Message Types

- `createRoom`: Create a new game room
- `joinRoom`: Join an existing room
- `startGame`: Start the game (host only)
- `gameStateUpdate`: Synchronize game state
- `playerAction`: Broadcast player actions
- `playerJoined`: Notify when player joins
- `playerLeft`: Notify when player leaves

## 🔧 Development

### Running in Development Mode

```bash
# Install development dependencies
npm install

# Run server with auto-restart
npm run dev
```

### Customizing the Server

- **Port**: Change `PORT` in `server.js` or set `PORT` environment variable
- **Server URL**: Update `serverUrl` in `game-server.js` for different server locations

### Adding Features

1. **New Game Mechanics**: Modify `game-core.js`
2. **UI Changes**: Update `game-ui.js` and `styles.css`
3. **Server Logic**: Enhance `server.js`
4. **Client Communication**: Extend `game-server.js`

## 🌐 Deployment

### Local Network Play

1. Find your computer's IP address
2. Update `serverUrl` in `game-server.js` to use your IP
3. Start the server: `npm start`
4. Share the IP address with other players

### Cloud Deployment

1. **Deploy server** to a cloud platform (Heroku, Railway, etc.)
2. **Update client** to use the deployed server URL
3. **Serve static files** from a web server or CDN

Example for Heroku:
```bash
# Add to package.json
"engines": {
  "node": "18.x"
}

# Deploy
git push heroku main
```

## 🐛 Troubleshooting

### Common Issues

**Connection Failed**:
- Check if server is running (`npm start`)
- Verify server URL in `game-server.js`
- Check firewall settings

**Room Not Found**:
- Verify room code is correct
- Check if room is full
- Ensure game hasn't started yet

**Game Not Starting**:
- Host must have at least 4 players
- Only host can start the game
- Check browser console for errors

### Debug Mode

Enable debug logging by opening browser console (F12) and checking for:
- WebSocket connection status
- Message sending/receiving
- Game state updates

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎯 Future Enhancements

- [ ] Persistent game sessions
- [ ] Player authentication
- [ ] Game history and statistics
- [ ] Custom room settings
- [ ] Spectator mode
- [ ] Mobile app version

---

**Enjoy playing CS File: Crime Scene Files!** 🕵️‍♂️🔍
