# 🎮 CS File Multiplayer Setup Guide

## Quick Start for Players

### For the Host (Game Creator):

1. **Start the Server**
   ```bash
   npm install
   npm start
   ```
   The server will run on `http://localhost:4000`

2. **Open the Game**
   - Open `index.html` in your web browser
   - Or serve files: `python -m http.server 8000` then go to `http://localhost:8000`

3. **Create a Room**
   - Enter your name
   - Choose number of players (4-12)
   - Click "Create Room"
   - You'll get a room code (e.g., "1001")

4. **Share the Room Code**
   - Tell other players the room code
   - They need to join using this code

### For Other Players (Joining):

1. **Open the Game**
   - Open `index.html` in your web browser
   - Or go to the same URL as the host

2. **Join the Room**
   - Enter your name
   - Enter the room code from the host
   - Click "Join Room"

3. **Wait for Game to Start**
   - You'll see the waiting room
   - Host will start the game when ready

## 🌐 Network Setup

### Local Network (Same WiFi):

1. **Find Host's IP Address**
   ```bash
   # On Windows
   ipconfig
   
   # On Mac/Linux
   ifconfig
   ```

2. **Update Client URL**
   - Edit `game-server.js`
   - Change line 3: `constructor(serverUrl = 'ws://YOUR_IP:4000')`
   - Replace `YOUR_IP` with the host's IP address

3. **Share Files**
   - Host shares the game files with other players
   - Or host serves files: `python -m http.server 8000`
   - Players go to `http://HOST_IP:8000`

### Internet Play (Different Locations):

1. **Deploy Server**
   - Use Heroku, Railway, or similar
   - Update `game-server.js` with deployed URL

2. **Share Game Files**
   - Host uploads files to web hosting
   - Players access via URL

## 🔧 Troubleshooting

### Connection Issues:

**"Connection Failed"**
- Check if server is running (`npm start`)
- Verify server URL in `game-server.js`
- Check firewall settings

**"Room Not Found"**
- Verify room code is correct
- Check if room is full
- Ensure game hasn't started yet

**"WebSocket Error"**
- Check browser console (F12)
- Verify server is accessible
- Try refreshing the page

### Common Solutions:

1. **Firewall Issues**
   - Allow port 4000 through firewall
   - Check antivirus settings

2. **Network Issues**
   - Ensure all players are on same network (for local play)
   - Check router settings

3. **Browser Issues**
   - Try different browser
   - Clear cache and cookies
   - Enable JavaScript

## 📱 Mobile Setup

### For Mobile Players:

1. **Use Mobile Browser**
   - Chrome, Safari, Firefox work well
   - Ensure JavaScript is enabled

2. **Access Game**
   - Go to host's IP address in mobile browser
   - Example: `http://192.168.1.100:8000`

3. **Join Room**
   - Enter name and room code
   - Game works on mobile browsers

## 🎯 Quick Commands

### Host Commands:
```bash
# Install dependencies
npm install

# Start server
npm start

# Serve files (optional)
python -m http.server 8000
```

### Player Commands:
```bash
# No commands needed - just open browser!
# Go to: http://HOST_IP:8000
```

## 📞 Getting Help

1. **Check Console** (F12) for error messages
2. **Verify Network** connectivity
3. **Test Connection** with simple ping
4. **Restart Server** if needed

---

**Happy Gaming!** 🕵️‍♂️🎮
