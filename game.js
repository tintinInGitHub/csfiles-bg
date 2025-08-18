// CS File: Crime Scene Files - Main Game Initialization

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Create global game controller instance
    window.gameController = new GameController();
    
    // Add some additional CSS for notifications
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .notification-success {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border-left: 4px solid #2E7D32;
        }
        
        .notification-warning {
            background: linear-gradient(45deg, #ff9800, #f57c00);
            border-left: 4px solid #E65100;
        }
        
        .notification-info {
            background: linear-gradient(45deg, #2196F3, #1976D2);
            border-left: 4px solid #0D47A1;
        }
        
        .notification-error {
            background: linear-gradient(45deg, #f44336, #d32f2f);
            border-left: 4px solid #B71C1C;
        }
        
        .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #ff0066;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(45deg, #ff0066, #00ffff);
            transition: width 0.3s ease;
        }
        
        .input-field {
            width: 100%;
            padding: 12px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #00ffff;
            border-radius: 5px;
            color: #ffffff;
            font-size: 16px;
            font-family: inherit;
            margin-bottom: 15px;
        }
        
        .input-field:focus {
            outline: none;
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
    
    console.log('CS File: Crime Scene Files loaded successfully!');
    console.log('Game Controller initialized:', window.gameController);
});
