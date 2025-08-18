// Game Core Logic - Main Game State and Flow Management

class GameCore {
    constructor() {
        this.gameState = {
            playerCount: 0,
            players: [],
            currentPhase: 'setup',
            currentRound: 1,
            currentPlayer: 1,
            hiddenSolution: null,
            sceneTiles: [],
            currentSceneTile: null,
            bulletMarkerPosition: null,
            discussionLog: [],
            gameEnded: false,
            nightStep: null,
            selectedClueCard: null,
            selectedMeanCard: null
        };

        this.decks = {
            clueCards: [],
            meanCards: [],
            roleCards: []
        };

        this.initializeDecks();
        this.initializeSceneTiles();
    }

    // Initialize card decks
    initializeDecks() {
        this.decks.clueCards = GameUtils.createCardObjects(GameData.getClueCards(), 'clue');
        this.decks.meanCards = GameUtils.createCardObjects(GameData.getMeanCards(), 'mean');
        this.decks.roleCards = GameData.getRoleCards();
    }

    // Initialize scene tiles
    initializeSceneTiles() {
        this.gameState.sceneTiles = GameData.getSceneTiles().map(tile => ({
            ...tile,
            used: false
        }));
    }

    // Start the game
    startGame(playerCount) {
        if (!GameUtils.validatePlayerCount(playerCount)) {
            throw new Error('Invalid player count. Must be between 4 and 12.');
        }

        this.gameState.playerCount = playerCount;
        this.setupGame();
        return this.gameState;
    }

    // Setup the game
    setupGame() {
        this.createPlayers();
        this.dealCards();
        this.assignRoles();
    }

    // Create players
    createPlayers() {
        this.gameState.players = [];
        for (let i = 1; i <= this.gameState.playerCount; i++) {
            this.gameState.players.push({
                id: i,
                name: `Player ${i}`,
                role: null,
                clueCards: [],
                meanCards: [],
                hasBadge: true,
                isActive: true
            });
        }
    }

    // Deal cards to players
    dealCards() {
        const shuffledClueCards = GameUtils.shuffle(this.decks.clueCards);
        const shuffledMeanCards = GameUtils.shuffle(this.decks.meanCards);

        this.gameState.players.forEach(player => {
            // Deal 4 clue cards and 4 mean cards
            player.clueCards = shuffledClueCards.splice(0, 4);
            player.meanCards = shuffledMeanCards.splice(0, 4);
        });
    }

    // Assign roles to players
    assignRoles() {
        const roles = [];
        
        // Always include Forensic Scientist and Murderer
        roles.push('Forensic Scientist', 'Murderer');
        
        // Add Witness and Accomplice for 6+ players
        if (this.gameState.playerCount >= 6) {
            roles.push('Witness', 'Accomplice');
        }
        
        // Fill remaining slots with Investigators
        const investigatorCount = this.gameState.playerCount - roles.length;
        for (let i = 0; i < investigatorCount; i++) {
            roles.push('Investigator');
        }
        
        // Shuffle and assign roles
        const shuffledRoles = GameUtils.shuffle(roles);
        this.gameState.players.forEach((player, index) => {
            player.role = shuffledRoles[index];
        });
    }

    // Start Night Phase
    startNightPhase() {
        this.gameState.currentPhase = 'night';
        this.gameState.nightStep = 'murderer_reveal';
        this.gameState.selectedClueCard = null;
        this.gameState.selectedMeanCard = null;
        
        return {
            phase: 'night',
            step: 'murderer_reveal',
            message: 'Everyone close your eyes...'
        };
    }

    // Reveal Forensic Scientist (called before night phase)
    revealForensicScientist() {
        const forensic = this.getPlayerByRole('Forensic Scientist');
        if (forensic) {
            return {
                playerId: forensic.id,
                message: `Player ${forensic.id} is the Forensic Scientist!`
            };
        }
        return null;
    }

    // Get current night step info
    getCurrentNightStep() {
        switch (this.gameState.nightStep) {
            case 'murderer_reveal':
                const murderer = this.getPlayerByRole('Murderer');
                return {
                    step: 'murderer_reveal',
                    playerId: murderer.id,
                    message: `Player ${murderer.id} is the Murderer. Everyone close your eyes...`,
                    showActions: false,
                    revealMurderer: true
                };
            
            case 'murderer_select':
                const murdererSelect = this.getPlayerByRole('Murderer');
                return {
                    step: 'murderer_select',
                    playerId: murdererSelect.id,
                    message: `Player ${murdererSelect.id} (Murderer), open your eyes and select your crime evidence...`,
                    showActions: true
                };
            
            case 'accomplice':
                if (this.hasAccomplice()) {
                    const accomplice = this.getPlayerByRole('Accomplice');
                    return {
                        step: 'accomplice',
                        playerId: accomplice.id,
                        message: `Player ${accomplice.id} (Accomplice), you know the evidence. Close your eyes...`,
                        showActions: false
                    };
                } else {
                    this.gameState.nightStep = 'witness';
                    return this.getCurrentNightStep();
                }
            
            case 'witness':
                if (this.hasWitness()) {
                    const witness = this.getPlayerByRole('Witness');
                    const murderer = this.getPlayerByRole('Murderer');
                    return {
                        step: 'witness',
                        playerId: witness.id,
                        message: `Player ${witness.id} (Witness), the Murderer is Player ${murderer.id}. Close your eyes...`,
                        showActions: false,
                        murdererId: murderer.id
                    };
                } else {
                    this.gameState.nightStep = 'forensic_choice';
                    return this.getCurrentNightStep();
                }
            
            case 'forensic_choice':
                const forensicChoice = this.getPlayerByRole('Forensic Scientist');
                return {
                    step: 'forensic_choice',
                    playerId: forensicChoice.id,
                    message: `Player ${forensicChoice.id} (Forensic Scientist), you can see the evidence. Now make your choice...`,
                    showActions: true,
                    showSceneSelection: true
                };
            
            default:
                return null;
        }
    }

    // Next night step
    nextNightStep() {
        switch (this.gameState.nightStep) {
            case 'murderer_reveal':
                this.gameState.nightStep = 'murderer_select';
                break;
            case 'murderer_select':
                this.gameState.nightStep = 'accomplice';
                break;
            case 'accomplice':
                this.gameState.nightStep = 'witness';
                break;
            case 'witness':
                this.gameState.nightStep = 'forensic_choice';
                break;
            case 'forensic_choice':
                this.endNightPhase();
                return null;
        }
        
        return this.getCurrentNightStep();
    }

    // Confirm selection (for murderer)
    confirmSelection(clueCard, meanCard) {
        if (!clueCard || !meanCard) {
            throw new Error('Please select both a Clue Card and a Mean Card');
        }

        this.gameState.selectedClueCard = clueCard;
        this.gameState.selectedMeanCard = meanCard;

        // Store the solution
        this.gameState.hiddenSolution = {
            murdererId: this.getPlayerByRole('Murderer').id,
            clueCard: clueCard,
            meanCard: meanCard
        };

        return {
            success: true,
            message: 'Selection confirmed. Close your eyes...'
        };
    }

    // Get murderer's available cards for selection
    getMurdererCards() {
        const murderer = this.getPlayerByRole('Murderer');
        if (!murderer) return { clueCards: [], meanCards: [] };

        return {
            clueCards: murderer.clueCards,
            meanCards: murderer.meanCards
        };
    }

    // Validate murderer's card selection
    validateMurdererSelection(clueCard, meanCard) {
        const murderer = this.getPlayerByRole('Murderer');
        if (!murderer) return false;

        const hasClueCard = murderer.clueCards.some(card => card.name === clueCard);
        const hasMeanCard = murderer.meanCards.some(card => card.name === meanCard);

        return hasClueCard && hasMeanCard;
    }

    // Get available scene tiles for Forensic Scientist
    getAvailableSceneTiles() {
        return this.gameState.sceneTiles.filter(tile => !tile.used);
    }

    // Forensic Scientist selects scene tile
    selectSceneTile(sceneTileText) {
        const availableTiles = this.getAvailableSceneTiles();
        const selectedTile = availableTiles.find(tile => tile.text === sceneTileText);
        
        if (!selectedTile) {
            throw new Error('Invalid scene tile selection');
        }

        selectedTile.used = true;
        this.gameState.currentSceneTile = selectedTile;

        return {
            success: true,
            sceneTile: selectedTile,
            message: 'Scene tile selected successfully'
        };
    }

    // End night phase
    endNightPhase() {
        this.gameState.currentPhase = 'investigation';
        this.gameState.currentRound = 1;
        this.gameState.nightStep = null;
        
        return {
            phase: 'investigation',
            round: 1,
            message: 'Night phase complete. Investigation begins...'
        };
    }

    // Start investigation phase
    startInvestigationPhase() {
        this.gameState.currentPhase = 'investigation';
        this.gameState.currentRound = 1;
        this.updateSceneTile();
        
        return {
            phase: 'investigation',
            round: 1,
            sceneTile: this.gameState.currentSceneTile
        };
    }

    // Update scene tile
    updateSceneTile() {
        const availableTiles = this.gameState.sceneTiles.filter(tile => !tile.used);
        if (availableTiles.length === 0) {
            this.endGame();
            return null;
        }
        
        const selectedTile = GameUtils.getRandomElement(availableTiles);
        selectedTile.used = true;
        this.gameState.currentSceneTile = selectedTile;
        
        return selectedTile;
    }

    // Next round
    nextRound() {
        this.gameState.currentRound++;
        
        if (this.gameState.currentRound > 3) {
            this.endGame();
            return {
                gameEnded: true,
                winner: 'murderer',
                reason: 'No correct guess after 3 rounds'
            };
        }
        
        const sceneTile = this.updateSceneTile();
        return {
            round: this.gameState.currentRound,
            sceneTile: sceneTile
        };
    }

    // Submit comment
    submitComment(playerId, comment) {
        if (!comment || comment.trim() === '') {
            throw new Error('Comment cannot be empty');
        }

        const entry = {
            playerId: playerId,
            text: comment.trim(),
            timestamp: GameUtils.formatTimestamp(new Date())
        };

        this.gameState.discussionLog.push(entry);
        
        // Move to next player
        this.nextPlayer();
        
        return {
            entry: entry,
            currentPlayer: this.gameState.currentPlayer
        };
    }

    // Next player
    nextPlayer() {
        do {
            this.gameState.currentPlayer = this.gameState.currentPlayer % this.gameState.playerCount + 1;
        } while (!this.gameState.players.find(p => p.id === this.gameState.currentPlayer)?.isActive);
    }

    // Make guess
    makeGuess(playerId, guessPlayerId, clueCard, meanCard) {
        if (!guessPlayerId || !clueCard || !meanCard) {
            throw new Error('Please select all three options');
        }

        const isCorrect = this.checkGuess(guessPlayerId, clueCard, meanCard);
        
        if (isCorrect) {
            this.gameState.gameEnded = true;
            return {
                correct: true,
                gameEnded: true,
                winner: 'investigators',
                reason: `Correct guess! Murderer was Player ${guessPlayerId}`
            };
        } else {
            // Remove badge from current player
            const currentPlayer = this.gameState.players.find(p => p.id === playerId);
            if (currentPlayer) {
                currentPlayer.hasBadge = false;
            }
            
            return {
                correct: false,
                badgeLost: true,
                currentPlayer: this.gameState.currentPlayer
            };
        }
    }

    // Check if guess is correct
    checkGuess(playerId, clueCard, meanCard) {
        return this.gameState.hiddenSolution &&
               this.gameState.hiddenSolution.murdererId === parseInt(playerId) &&
               this.gameState.hiddenSolution.clueCard === clueCard &&
               this.gameState.hiddenSolution.meanCard === meanCard;
    }

    // Submit witness guess (when murderer is caught)
    submitWitnessGuess(witnessGuess) {
        const witness = this.getPlayerByRole('Witness');
        const isCorrect = (witnessGuess === 'none' && !witness) || 
                         (witnessGuess === witness?.id.toString());
        
        this.gameState.gameEnded = true;
        
        if (isCorrect) {
            return {
                correct: true,
                gameEnded: true,
                winner: 'murderer',
                reason: 'Murderer correctly identified the Witness!'
            };
        } else {
            return {
                correct: false,
                gameEnded: true,
                winner: 'investigators',
                reason: 'Murderer failed to identify the Witness correctly.'
            };
        }
    }

    // End game
    endGame() {
        this.gameState.gameEnded = true;
        
        if (!this.gameState.hiddenSolution) {
            return {
                gameEnded: true,
                winner: 'murderer',
                reason: 'No correct guess after 3 rounds'
            };
        }
        
        return {
            gameEnded: true,
            winner: 'murderer',
            reason: 'Game ended without correct guess'
        };
    }

    // Get player by role
    getPlayerByRole(role) {
        return this.gameState.players.find(player => player.role === role);
    }

    // Get player by ID
    getPlayerById(id) {
        return this.gameState.players.find(player => player.id === id);
    }

    // Check if has accomplice
    hasAccomplice() {
        return this.gameState.playerCount >= 6;
    }

    // Check if has witness
    hasWitness() {
        return this.gameState.playerCount >= 6;
    }

    // Get current game state
    getGameState() {
        return GameUtils.deepClone(this.gameState);
    }

    // Get available clue cards for player
    getAvailableClueCards(playerId) {
        const player = this.getPlayerById(playerId);
        return player ? player.clueCards : [];
    }

    // Get available mean cards for player
    getAvailableMeanCards(playerId) {
        const player = this.getPlayerById(playerId);
        return player ? player.meanCards : [];
    }

    // Get all clue cards (for guess dropdown)
    getAllClueCards() {
        return this.decks.clueCards;
    }

    // Get all mean cards (for guess dropdown)
    getAllMeanCards() {
        return this.decks.meanCards;
    }

    // Get active players
    getActivePlayers() {
        return this.gameState.players.filter(player => player.isActive);
    }

    // Get players with badges
    getPlayersWithBadges() {
        return this.gameState.players.filter(player => player.hasBadge && player.isActive);
    }

    // Reset game
    resetGame() {
        this.gameState = {
            playerCount: 0,
            players: [],
            currentPhase: 'setup',
            currentRound: 1,
            currentPlayer: 1,
            hiddenSolution: null,
            sceneTiles: [],
            currentSceneTile: null,
            bulletMarkerPosition: null,
            discussionLog: [],
            gameEnded: false,
            nightStep: null,
            selectedClueCard: null,
            selectedMeanCard: null
        };

        this.initializeSceneTiles();
    }

    // Validate game state
    validateGameState() {
        if (this.gameState.playerCount < 4 || this.gameState.playerCount > 12) {
            return false;
        }

        if (this.gameState.players.length !== this.gameState.playerCount) {
            return false;
        }

        const roles = this.gameState.players.map(p => p.role);
        const requiredRoles = ['Forensic Scientist', 'Murderer'];
        
        if (this.gameState.playerCount >= 6) {
            requiredRoles.push('Witness', 'Accomplice');
        }

        for (const role of requiredRoles) {
            if (!roles.includes(role)) {
                return false;
            }
        }

        return true;
    }
}
