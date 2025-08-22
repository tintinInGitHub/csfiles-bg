// Game Controller - Main Game Orchestration and Event Handling

class GameController {
  constructor() {
    this.gameCore = new GameCore();
    this.gameUI = new GameUI();
    this.currentPlayer = 1;
    this.connection = null;
    this.isHost = false;
    this.waitingRoomPlayers = [];
    this.roomCode = null;
    this.maxPlayers = 0;
    this.localPlayerName = '';
    this.localRole = '';

    this.loadVersion();
    this.bindEvents();
  }

  // Load and display version info
  loadVersion() {
    fetch('./version.json')
      .then((response) => response.json())
      .then((data) => {
        const versionElement = document.getElementById('versionInfo');
        if (versionElement) {
          versionElement.textContent = `v${data.version} (${data.lastCommit})`;
          versionElement.title = `Build: ${data.build}\nDeploy: ${new Date(
            data.lastDeploy
          ).toLocaleString()}`;
        }
      })
      .catch((error) => {
        console.log('Could not load version info:', error);
      });
  }

  // Bind all event listeners
  bindEvents() {
    // Multiplayer events
    document
      .getElementById('createRoomBtn')
      .addEventListener('click', () => this.createRoom());
    document
      .getElementById('joinRoomBtn')
      .addEventListener('click', () => this.joinRoom());
    document
      .getElementById('copyRoomCodeBtn')
      .addEventListener('click', () => this.copyRoomCode());
    document
      .getElementById('startMultiplayerGameBtn')
      .addEventListener('click', () => this.startMultiplayerGame());
    document
      .getElementById('leaveRoomBtn')
      .addEventListener('click', () => this.leaveRoom());

    // Game board events
    // Removed pass device feature
    document
      .getElementById('makeGuessBtn')
      .addEventListener('click', () => this.showGuessModal());
    document
      .getElementById('nextPhaseBtn')
      .addEventListener('click', () => this.nextPhase());
    document
      .getElementById('submitCommentBtn')
      .addEventListener('click', () => this.submitComment());

    // Modal events
    document
      .getElementById('confirmIdentityBtn')
      .addEventListener('click', () => this.confirmIdentity());
    document
      .getElementById('cancelIdentityBtn')
      .addEventListener('click', () =>
        this.gameUI.closeModal('playerIdentityModal')
      );
    document
      .getElementById('nextNightStepBtn')
      .addEventListener('click', () => this.nextNightStep());
    document
      .getElementById('submitGuessBtn')
      .addEventListener('click', () => this.submitGuess());
    document
      .getElementById('cancelGuessBtn')
      .addEventListener('click', () => this.gameUI.closeModal('guessModal'));
    document
      .getElementById('submitWitnessGuessBtn')
      .addEventListener('click', () => this.submitWitnessGuess());
    document
      .getElementById('newGameBtn')
      .addEventListener('click', () => this.newGame());
    document
      .getElementById('closeErrorBtn')
      .addEventListener('click', () => this.gameUI.closeModal('errorModal'));

    // Murderer card selection modal events
    document
      .getElementById('confirmMurdererSelectionBtn')
      .addEventListener('click', () => this.confirmMurdererSelection());
    document
      .getElementById('cancelMurdererSelectionBtn')
      .addEventListener('click', () =>
        this.gameUI.closeModal('murdererCardSelectionModal')
      );

    // Forensic Scientist scene selection modal events
    document
      .getElementById('confirmSceneSelectionBtn')
      .addEventListener('click', () => this.confirmSceneSelection());
    document
      .getElementById('cancelSceneSelectionBtn')
      .addEventListener('click', () =>
        this.gameUI.closeModal('forensicSceneSelectionModal')
      );

    // Enter key for comment input
    document
      .getElementById('commentInput')
      .addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.submitComment();
        }
      });
  }

  // Validate player count input
  validatePlayerCount(value) {
    if (!GameUtils.validatePlayerCount(value)) {
      this.gameUI.showError('Please enter a number between 4 and 12');
      return false;
    }
    return true;
  }

  // Start night phase
  startNightPhase() {
    const nightInfo = this.gameCore.startNightPhase();
    this.gameUI.showModal('nightPhaseModal');

    // Debug: log current role assignment
    console.log('Night phase started. Local role:', this.localRole);
    console.log('Local player name:', this.localPlayerName);
    console.log('Current player ID:', this.currentPlayer);

    this.updateNightPhaseUI(nightInfo);

    // Start the night phase sequence
    this.startNightPhaseSequence();
  }

  // Night phase sequence: everyone close eyes -> scientist awake -> murderer awake -> card selection
  startNightPhaseSequence() {
    // Debug: log current role assignment
    console.log('Night phase sequence started. Local role:', this.localRole);
    console.log('Local player name:', this.localPlayerName);

    // Step 1: Everyone close eyes
    this.gameUI.showInfo('Everyone close your eyes...');

    setTimeout(() => {
      // Step 2: Scientist open eyes
      if (this.localRole === 'Forensic Scientist') {
        this.gameUI.showInfo(
          'Forensic Scientist, open your eyes. You will see what the murderer chooses.'
        );
      }

      setTimeout(() => {
        // Step 3: Murderer open eyes and select cards
        if (this.localRole === 'Murderer') {
          this.gameUI.showInfo(
            'Murderer, open your eyes. Select your crime evidence.'
          );
          this.showMurdererCardSelection();
        } else if (this.localRole === 'Forensic Scientist') {
          this.gameUI.showInfo(
            'Murderer is selecting their cards. Watch carefully...'
          );
        } else {
          this.gameUI.showInfo(
            'Murderer is selecting their cards. Keep your eyes closed.'
          );
        }
      }, 3000); // Wait 3 seconds before murderer phase
    }, 2000); // Wait 2 seconds before scientist phase
  }

  // Update night phase UI
  updateNightPhaseUI(nightInfo) {
    document.getElementById('nightPhaseMessage').textContent =
      nightInfo.message;
    const actions = document.getElementById('nightPhaseActions');
    actions.classList.add('hidden');
    const nextBtn = document.getElementById('nextNightStepBtn');
    const isScientistLocal = this.localRole === 'Forensic Scientist';

    // Make button more visible and clear
    nextBtn.disabled = !isScientistLocal;
    nextBtn.style.display = 'block';
    nextBtn.style.opacity = isScientistLocal ? '1' : '0.5';

    if (isScientistLocal) {
      nextBtn.textContent = 'Next Step (You are the Scientist)';
      this.gameUI.showInfo(
        'You are the Forensic Scientist. You can click Next Step.'
      );
    } else {
      nextBtn.textContent = 'Next Step (Scientist Only)';
      this.gameUI.showInfo(
        'Waiting for the Forensic Scientist to click Next Step...'
      );
    }

    if (nightInfo.step === 'murderer_select' && nightInfo.showActions) {
      if (this.localRole === 'Murderer') {
        this.showMurdererCardSelection();
      } else {
        this.gameUI.showInfo(
          'Waiting for the Murderer to select their cards...'
        );
      }
    }
  }

  // Reveal Murderer role
  revealMurderer(playerId) {
    // Update the player card to show Murderer role
    const gameState = this.gameCore.getGameState();
    const murdererPlayer = gameState.players.find((p) => p.id === playerId);

    if (murdererPlayer) {
      // Update visuals
      this.updateGameUI();
      // Notify everyone with name
      const name = murdererPlayer.name || `Player ${playerId}`;
      this.gameUI.showWarning(`${name} is the Murderer!`);
      // Also notify the murderer specifically
      const me = this.gameCore.getPlayerById(this.currentPlayer);
      if (me && me.id === murdererPlayer.id) {
        this.gameUI.showInfo(
          'You are the Murderer. Select your Lethal Weapon and Clue Card when prompted.'
        );
      }
    }
  }

  // Populate card selections
  populateCardSelections(playerId) {
    const clueCards = this.gameCore.getAvailableClueCards(playerId);
    const meanCards = this.gameCore.getAvailableMeanCards(playerId);

    this.gameUI.populateDropdown(
      'clueCardSelect',
      clueCards.map((card) => card.name)
    );
    this.gameUI.populateDropdown(
      'meanCardSelect',
      meanCards.map((card) => card.name)
    );
  }

  // Show murderer card selection
  showMurdererCardSelection() {
    const murdererCards = this.gameCore.getMurdererCards();

    // Create a visual card selection interface
    this.createCardSelectionInterface(murdererCards);

    this.gameUI.showModal('murdererCardSelectionModal');
  }

  // Create card selection interface
  createCardSelectionInterface(murdererCards) {
    const container = document.getElementById('murdererCardSelectionContainer');
    if (!container) return;

    GameUtils.clearElement(container);

    // Create clue cards section
    const clueSection = this.createCardSection(
      'Clue Cards',
      murdererCards.clueCards,
      'clue'
    );
    container.appendChild(clueSection);

    // Create mean cards section
    const meanSection = this.createCardSection(
      'Mean Cards',
      murdererCards.meanCards,
      'mean'
    );
    container.appendChild(meanSection);

    // Add selection buttons
    const buttonSection = this.createSelectionButtons();
    container.appendChild(buttonSection);
  }

  // Create card section
  createCardSection(title, cards, type) {
    const section = GameUtils.createElement('div', {
      className: 'card-selection-section',
    });

    const titleElement = GameUtils.createElement('h4', {
      textContent: title,
    });
    section.appendChild(titleElement);

    const cardsContainer = GameUtils.createElement('div', {
      className: 'cards-container',
    });

    cards.forEach((card) => {
      const cardElement = this.createSelectableCard(card, type);
      cardsContainer.appendChild(cardElement);
    });

    section.appendChild(cardsContainer);
    return section;
  }

  // Create selectable card
  createSelectableCard(card, type) {
    const cardElement = GameUtils.createElement('div', {
      className: `selectable-card ${type}-card`,
      'data-card-name': card.name,
      'data-card-type': type,
    });

    const cardName = GameUtils.createElement('div', {
      className: 'card-name',
      textContent: card.name,
    });

    cardElement.appendChild(cardName);

    // Add click handler
    cardElement.addEventListener('click', () => {
      this.selectCard(card.name, type);
    });

    return cardElement;
  }

  // Select card
  selectCard(cardName, type) {
    // Remove previous selection
    document
      .querySelectorAll(`.selectable-card.${type}-card.selected`)
      .forEach((card) => {
        card.classList.remove('selected');
      });

    // Add selection to clicked card
    const selectedCard = document.querySelector(
      `[data-card-name="${cardName}"][data-card-type="${type}"]`
    );
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }

    // Update hidden inputs
    if (type === 'clue') {
      document.getElementById('selectedClueCard').value = cardName;
    } else if (type === 'mean') {
      document.getElementById('selectedMeanCard').value = cardName;
    }
  }

  // Create selection buttons
  createSelectionButtons() {
    const buttonSection = GameUtils.createElement('div', {
      className: 'selection-buttons',
    });

    const confirmButton = GameUtils.createElement('button', {
      className: 'btn-primary',
      textContent: 'Confirm Selection',
    });

    confirmButton.addEventListener('click', () => {
      this.confirmMurdererSelection();
    });

    buttonSection.appendChild(confirmButton);
    return buttonSection;
  }

  // Confirm murderer selection
  confirmMurdererSelection() {
    if (this.localRole !== 'Murderer') {
      this.gameUI.showError('Only the Murderer can confirm this selection');
      return;
    }
    const selectedClue = document.getElementById('selectedClueCard').value;
    const selectedMean = document.getElementById('selectedMeanCard').value;

    if (!selectedClue || !selectedMean) {
      this.gameUI.showError('Please select both a Clue Card and a Mean Card');
      return;
    }

    try {
      const result = this.gameCore.confirmSelection(selectedClue, selectedMean);
      this.gameUI.closeModal('murdererCardSelectionModal');
      this.gameUI.showSuccess('Evidence selected successfully!');

      // Notify scientist about the selection
      if (this.localRole === 'Murderer') {
        this.gameUI.showInfo(
          'Close your eyes. The scientist will now see your selection.'
        );
      }

      // Continue night phase sequence
      this.continueNightPhaseAfterMurdererSelection();

      // Clear selections
      document.getElementById('selectedClueCard').value = '';
      document.getElementById('selectedMeanCard').value = '';

      // Remove selected classes
      document.querySelectorAll('.selectable-card.selected').forEach((card) => {
        card.classList.remove('selected');
      });
    } catch (error) {
      this.gameUI.showError(error.message);
    }
  }

  // Continue night phase after murderer selection
  continueNightPhaseAfterMurdererSelection() {
    setTimeout(() => {
      // Notify scientist about murderer's selection
      if (this.localRole === 'Forensic Scientist') {
        const gameState = this.gameCore.getGameState();
        this.gameUI.showInfo(
          `The murderer selected: ${gameState.selectedClueCard} and ${gameState.selectedMeanCard}`
        );
        this.gameUI.showInfo(
          'Everyone can now open their eyes. You will now select scene tiles for investigation.'
        );
      } else if (this.localRole === 'Murderer') {
        this.gameUI.showInfo('Everyone can now open their eyes.');
      } else {
        this.gameUI.showInfo(
          'Everyone can now open their eyes. The scientist will select scene tiles.'
        );
      }

      setTimeout(() => {
        // Start clue phase
        this.startCluePhaseUI();
      }, 3000); // Wait 3 seconds before starting clue phase
    }, 2000); // Wait 2 seconds before showing selection to scientist
  }

  // Show Forensic Scientist scene selection
  showForensicSceneSelection(stepLabel = null) {
    if (this.localRole !== 'Forensic Scientist') {
      this.gameUI.showInfo(
        'Waiting for the Forensic Scientist to select a scene tile...'
      );
      return;
    }
    const availableTiles = this.gameCore.getAvailableSceneTiles();
    if (stepLabel) {
      const titleEl = document.querySelector('#forensicSceneSelectionModal h3');
      if (titleEl) {
        titleEl.textContent = `Select Scene Tile (${stepLabel})`;
      }
    }
    this.createSceneSelectionInterface(availableTiles);
    this.gameUI.showModal('forensicSceneSelectionModal');
  }

  // Create scene selection interface
  createSceneSelectionInterface(sceneTiles) {
    const container = document.getElementById(
      'forensicSceneSelectionContainer'
    );
    if (!container) return;

    GameUtils.clearElement(container);

    const title = GameUtils.createElement('h4', {
      textContent: 'Select a Scene Tile for Investigation',
    });
    container.appendChild(title);

    const tilesContainer = GameUtils.createElement('div', {
      className: 'scene-tiles-container',
    });

    sceneTiles.forEach((tile) => {
      const tileElement = this.createSelectableSceneTile(tile);
      tilesContainer.appendChild(tileElement);
    });

    container.appendChild(tilesContainer);

    // Add selection button
    const buttonSection = this.createSceneSelectionButtons();
    container.appendChild(buttonSection);
  }

  // Create selectable scene tile
  createSelectableSceneTile(tile) {
    const tileElement = GameUtils.createElement('div', {
      className: 'selectable-scene-tile',
      'data-tile-text': tile.text,
    });

    const tileText = GameUtils.createElement('div', {
      className: 'scene-tile-text',
      textContent: tile.text,
    });

    const tileHints = GameUtils.createElement('div', {
      className: 'scene-tile-hints',
      textContent: `Hints: ${tile.hints.join(', ')}`,
    });

    tileElement.appendChild(tileText);
    tileElement.appendChild(tileHints);

    // Add click handler
    tileElement.addEventListener('click', () => {
      this.selectSceneTile(tile.text);
    });

    return tileElement;
  }

  // Select scene tile
  selectSceneTile(tileText) {
    // Remove previous selection
    document
      .querySelectorAll('.selectable-scene-tile.selected')
      .forEach((tile) => {
        tile.classList.remove('selected');
      });

    // Add selection to clicked tile
    const selectedTile = document.querySelector(
      `[data-tile-text="${tileText}"]`
    );
    if (selectedTile) {
      selectedTile.classList.add('selected');
    }

    // Update hidden input
    document.getElementById('selectedSceneTile').value = tileText;
  }

  // Create scene selection buttons
  createSceneSelectionButtons() {
    const buttonSection = GameUtils.createElement('div', {
      className: 'selection-buttons',
    });

    const confirmButton = GameUtils.createElement('button', {
      className: 'btn-primary',
      textContent: 'Confirm Scene Selection',
    });

    confirmButton.addEventListener('click', () => {
      this.confirmSceneSelection();
    });

    buttonSection.appendChild(confirmButton);
    return buttonSection;
  }

  // Confirm scene selection
  confirmSceneSelection() {
    if (this.localRole !== 'Forensic Scientist') {
      this.gameUI.showError(
        'Only the Forensic Scientist can confirm this selection'
      );
      return;
    }
    const selectedTile = document.getElementById('selectedSceneTile').value;

    if (!selectedTile) {
      this.gameUI.showError('Please select a scene tile');
      return;
    }

    try {
      if (this.gameCore.getGameState().currentPhase === 'clue') {
        const next = this.gameCore.recordClueSelection(selectedTile);
        this.gameUI.closeModal('forensicSceneSelectionModal');
        if (next.phase === 'clue') {
          this.showForensicSceneSelection(next.stepLabel);
        } else if (next.phase === 'discussion') {
          this.startDiscussionTimer(next.durationSec, next.endsAt);
          this.gameUI.showInfo('Discussion phase started');
        }
      } else {
        const result = this.gameCore.selectSceneTile(selectedTile);
        this.gameUI.closeModal('forensicSceneSelectionModal');
        this.gameUI.showSuccess('Scene tile selected successfully!');
        this.updateGameUI();
      }
    } catch (error) {
      this.gameUI.showError(error.message);
    }
  }

  // Next night step
  nextNightStep() {
    const isScientistLocal = this.localRole === 'Forensic Scientist';
    if (!isScientistLocal) {
      this.gameUI.showError(
        'Only the Forensic Scientist can advance the phase'
      );
      return;
    }
    const nightInfo = this.gameCore.nextNightStep();
    if (!nightInfo) {
      this.gameUI.closeModal('nightPhaseModal');
      this.startCluePhaseUI();
      return;
    }
    this.updateNightPhaseUI(nightInfo);
  }

  // Confirm selection
  confirmSelection() {
    const clueCard = this.gameUI.getDropdownValue('clueCardSelect');
    const meanCard = this.gameUI.getDropdownValue('meanCardSelect');

    try {
      const result = this.gameCore.confirmSelection(clueCard, meanCard);
      document.getElementById('nightPhaseMessage').textContent = result.message;
      document.getElementById('nightPhaseActions').classList.add('hidden');
    } catch (error) {
      this.gameUI.showError(error.message);
    }
  }

  // Start investigation phase
  startCluePhaseUI() {
    const info = this.gameCore.startCluePhase();
    this.showForensicSceneSelection(info.stepLabel);
  }

  // Reveal Forensic Scientist before night phase (legacy - now handled in simplified flow)
  revealForensicScientistBeforeNight() {
    // This is now handled in startSimplifiedRoleReveal()
    this.startSimplifiedRoleReveal();
  }

  // Assign local role for current player
  assignLocalRole() {
    const players = this.gameCore.getGameState().players;
    
    // Try to find by name first
    let currentPlayer = players.find((p) => p.name === this.localPlayerName);
    
    // If not found by name, try to find by ID or any other matching criteria
    if (!currentPlayer) {
      console.log('Player not found by name, trying alternative matching...');
      console.log('Looking for player with name:', this.localPlayerName);
      console.log('Available players:', players.map(p => ({ name: p.name, id: p.id, role: p.role })));
      
      // Try to find by connection player ID
      if (this.connection) {
        const connectionStatus = this.connection.getConnectionStatus();
        currentPlayer = players.find((p) => p.id === connectionStatus.playerId);
      }
    }
    
    if (currentPlayer) {
      this.localRole = currentPlayer.role;
      console.log('Local role assigned in assignLocalRole:', this.localRole);
      console.log('Matched player:', { name: currentPlayer.name, id: currentPlayer.id, role: currentPlayer.role });
    } else {
      console.error('Could not find current player in game state!');
      console.log('Local player name:', this.localPlayerName);
      console.log('Connection status:', this.connection ? this.connection.getConnectionStatus() : 'No connection');
    }
  }

  // Simplified role reveal sequence
  startSimplifiedRoleReveal() {
    // First, assign local role
    this.assignLocalRole();

    // First, announce the Forensic Scientist
    const forensicInfo = this.gameCore.revealForensicScientist();
    if (forensicInfo) {
      this.gameUI.showInfo(forensicInfo.message);
      this.updateGameUI();

      // If host, send scientist reveal to all players
      if (this.isHost && this.connection) {
        this.connection.sendScientistReveal(forensicInfo);
      }
    }

    // Then reveal each player's role individually
    this.revealPlayerRolesSequentially();
  }

  // Reveal each player's role one by one
  revealPlayerRolesSequentially() {
    const players = this.gameCore.getGameState().players;
    let currentIndex = 0;

    // First, assign local role for current player
    const currentPlayer = players.find((p) => p.name === this.localPlayerName);
    if (currentPlayer) {
      this.localRole = currentPlayer.role;
      console.log('Local role assigned:', this.localRole);
    }

    const showNextRole = () => {
      if (currentIndex >= players.length) {
        // All roles revealed, start night phase
        this.startNightPhase();
        return;
      }

      const player = players[currentIndex];
      const isCurrentPlayer = player.name === this.localPlayerName;

      if (isCurrentPlayer) {
        // Show role to current player
        this.gameUI.showInfo(`You are the ${player.role}!`);

        // Special message for murderer
        if (player.role === 'Murderer') {
          this.gameUI.showInfo(
            'You are the Murderer. Stay hidden and choose wisely.'
          );
        }

        // Special message for scientist
        if (player.role === 'Forensic Scientist') {
          this.gameUI.showInfo(
            'You are the Forensic Scientist. You will guide the investigation.'
          );
        }
      }

      currentIndex++;

      // Wait 2 seconds before showing next role
      setTimeout(showNextRole, 2000);
    };

    // Start the sequence
    showNextRole();
  }

  // Show Forensic Scientist reveal modal
  showForensicRevealModal(forensicInfo) {
    const modal = GameUtils.createElement(
      'div',
      {
        className: 'modal active',
      },
      [
        GameUtils.createElement(
          'div',
          {
            className: 'modal-content',
          },
          [
            GameUtils.createElement('h3', {
              textContent: 'Forensic Scientist Revealed!',
            }),
            GameUtils.createElement('p', {
              textContent: forensicInfo.message,
            }),
            GameUtils.createElement('p', {
              textContent:
                'The Forensic Scientist will guide the investigation and reveal clues during the game.',
              style: 'font-style: italic; color: #cccccc;',
            }),
            GameUtils.createElement(
              'div',
              {
                className: 'modal-buttons',
              },
              [
                GameUtils.createElement('button', {
                  className: 'btn-primary',
                  textContent: 'Start Night Phase',
                }),
              ]
            ),
          ]
        ),
      ]
    );

    document.body.appendChild(modal);

    const startButton = modal.querySelector('.btn-primary');
    startButton.addEventListener('click', () => {
      modal.remove();
      this.startNightPhase();
    });
  }

  // Submit comment
  submitComment() {
    const comment = this.gameUI.getInputValue('commentInput');

    if (!comment.trim()) {
      return;
    }

    try {
      const result = this.gameCore.submitComment(this.currentPlayer, comment);
      this.gameUI.clearInput('commentInput');
      this.updateDiscussionLog();
      this.currentPlayer = result.currentPlayer;
      this.updateGameUI();
    } catch (error) {
      this.gameUI.showError(error.message);
    }
  }

  // Removed passDevice

  // Show guess modal
  showGuessModal() {
    const activePlayers = this.gameCore.getActivePlayers();
    const clueCards = this.gameCore.getAllClueCards();
    const meanCards = this.gameCore.getAllMeanCards();

    this.gameUI.populateDropdown(
      'guessPlayerSelect',
      activePlayers.map((p) => ({
        value: p.id,
        text: p.name || `Player ${p.id}`,
      }))
    );
    this.gameUI.populateDropdown(
      'guessClueSelect',
      clueCards.map((card) => card.name)
    );
    this.gameUI.populateDropdown(
      'guessMeanSelect',
      meanCards.map((card) => card.name)
    );

    this.gameUI.showModal('guessModal');
  }

  // Submit guess
  submitGuess() {
    const playerId = this.gameUI.getDropdownValue('guessPlayerSelect');
    const clueCard = this.gameUI.getDropdownValue('guessClueSelect');
    const meanCard = this.gameUI.getDropdownValue('guessMeanSelect');

    try {
      const result = this.gameCore.makeGuess(
        this.currentPlayer,
        playerId,
        clueCard,
        meanCard
      );
      this.gameUI.closeModal('guessModal');

      if (result.correct) {
        this.handleGameEnd(result);
      } else {
        this.gameUI.showWarning('Incorrect guess! Badge lost.');
        this.updateGameUI();
      }
    } catch (error) {
      this.gameUI.showError(error.message);
    }
  }

  // Submit witness guess
  submitWitnessGuess() {
    const witnessGuess = this.gameUI.getDropdownValue('witnessGuessSelect');

    try {
      const result = this.gameCore.submitWitnessGuess(witnessGuess);
      this.gameUI.closeModal('witnessGuessModal');
      this.handleGameEnd(result);
    } catch (error) {
      this.gameUI.showError(error.message);
    }
  }

  // Next phase
  nextPhase() {
    if (this.gameCore.gameState.currentPhase === 'investigation') {
      const result = this.gameCore.nextRound();

      if (result.gameEnded) {
        this.handleGameEnd(result);
      } else {
        this.updateGameUI();
        this.gameUI.showInfo(`Round ${result.round} begins!`);
      }
    }
  }

  // Handle game end
  handleGameEnd(result) {
    this.gameCore.gameState.gameEnded = true;

    let title, message, details;

    if (result.winner === 'investigators') {
      title = 'Investigators Win!';
      message = result.reason;
      details = this.createVictoryDetails();
    } else {
      title = 'Murderer Wins!';
      message = result.reason;
      details = this.createVictoryDetails();
    }

    this.showVictoryModal(title, message, details);
  }

  // Create victory details
  createVictoryDetails() {
    const solution = this.gameCore.gameState.hiddenSolution;
    if (!solution) return '';

    const murderer = this.gameCore.getPlayerById(solution.murdererId);
    const murdererName = murderer?.name || `Player ${solution.murdererId}`;
    return `
            <h4>Game Summary:</h4>
            <p><strong>Murderer:</strong> ${murdererName}</p>
            <p><strong>Clue Card:</strong> ${solution.clueCard}</p>
            <p><strong>Lethal Weapon:</strong> ${solution.meanCard}</p>
        `;
  }

  // Show victory modal
  showVictoryModal(title, message, details) {
    document.getElementById('victoryTitle').textContent = title;
    document.getElementById('victoryMessage').textContent = message;
    document.getElementById('victoryDetails').innerHTML = details;

    this.gameUI.showModal('victoryModal');
  }

  // New game
  newGame() {
    this.gameUI.closeModal('victoryModal');
    this.gameUI.showScreen('startScreen');
    this.gameCore.resetGame();
    this.currentPlayer = 1;
    this.gameUI.clearInput('playerCount');
    this.gameUI.setInputValue('playerCount', '4');
  }

  // Confirm identity
  confirmIdentity() {
    const playerId = parseInt(this.gameUI.getInputValue('playerIdentityInput'));

    if (
      isNaN(playerId) ||
      playerId < 1 ||
      playerId > this.gameCore.gameState.playerCount
    ) {
      this.gameUI.showError('Please enter a valid player number');
      return;
    }

    this.currentPlayer = playerId;
    this.gameUI.closeModal('playerIdentityModal');
    this.updateGameUI();
  }

  // Add discussion entry
  addDiscussionEntry(text) {
    const entry = {
      playerId: 0, // System message
      text: text,
      timestamp: GameUtils.formatTimestamp(new Date()),
    };

    this.gameCore.gameState.discussionLog.push(entry);
    this.updateDiscussionLog();
  }

  // Update discussion log
  updateDiscussionLog() {
    this.gameUI.updateDiscussionLog(this.gameCore.gameState.discussionLog);
  }

  // Update game UI
  updateGameUI() {
    const gameState = this.gameCore.getGameState();

    this.gameUI.updatePlayersGrid(gameState.players);
    this.gameUI.updatePhaseDisplay(
      gameState.currentPhase,
      gameState.currentRound
    );
    this.gameUI.updateSceneTile(gameState.currentSceneTile);
    this.updateDiscussionLog();

    // Update button states
    this.updateButtonStates();
  }

  // Update button states
  updateButtonStates() {
    const gameState = this.gameCore.getGameState();
    const currentPlayer = this.gameCore.getPlayerById(this.currentPlayer);

    // Enable/disable make guess button based on badge
    const canGuess =
      currentPlayer &&
      currentPlayer.hasBadge &&
      gameState.currentPhase === 'investigation';
    this.gameUI.setButtonState('makeGuessBtn', canGuess);

    // Enable/disable next phase button
    const isScientist = currentPlayer?.role === 'Forensic Scientist';
    const canNextPhase = isScientist && !gameState.gameEnded;
    this.gameUI.setButtonState('nextPhaseBtn', canNextPhase);
  }

  // Discussion timer management
  startDiscussionTimer(durationSec, endsAt) {
    if (this.discussionIntervalId) clearInterval(this.discussionIntervalId);
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));
      const minutes = Math.floor(remaining / 60)
        .toString()
        .padStart(2, '0');
      const seconds = (remaining % 60).toString().padStart(2, '0');
      document.getElementById(
        'currentPhase'
      ).textContent = `Phase: Discussion (${minutes}:${seconds})`;
      if (remaining <= 0) {
        clearInterval(this.discussionIntervalId);
        this.discussionIntervalId = null;
        const murderer = this.gameCore.getPlayerByRole('Murderer');
        this.handleGameEnd({
          winner: 'murderer',
          reason: `Time's up! Murderer was Player ${murderer?.id}`,
          gameEnded: true,
        });
      }
    };
    updateTimer();
    this.discussionIntervalId = setInterval(updateTimer, 1000);
  }

  // Show error
  showError(message) {
    this.gameUI.showError(message);
  }

  // Show success
  showSuccess(message) {
    this.gameUI.showSuccess(message);
  }

  // Show warning
  showWarning(message) {
    this.gameUI.showWarning(message);
  }

  // Show info
  showInfo(message) {
    this.gameUI.showInfo(message);
  }

  // Get current game state
  getGameState() {
    return this.gameCore.getGameState();
  }

  // Get current player
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  // Set current player
  setCurrentPlayer(playerId) {
    this.currentPlayer = playerId;
    this.updateGameUI();
  }

  // Validate game state
  validateGameState() {
    return this.gameCore.validateGameState();
  }

  // Multiplayer Methods

  // Create a multiplayer room
  async createRoom() {
    const playerName = document.getElementById('playerName').value.trim();
    this.localPlayerName = playerName;
    this.localPlayerName = playerName;
    const playerCount = parseInt(
      document.getElementById('multiplayerPlayerCount').value
    );

    if (!playerName) {
      this.gameUI.showError('Please enter your name');
      return;
    }

    if (!this.validatePlayerCount(playerCount)) {
      return;
    }

    try {
      this.showConnectionStatus('Connecting to server...', 'connecting');

      this.connection = new GameConnection();
      this.playerCount = playerCount;

      // Set up event listeners first
      this.setupMultiplayerEvents();

      // Create room
      await this.connection.createRoom(playerName, playerCount);
    } catch (error) {
      this.showConnectionStatus('Connection failed', 'error');
      this.gameUI.showError(error.message);
    }
  }

  // Join a multiplayer room
  async joinRoom() {
    const playerName = document.getElementById('playerName').value.trim();
    const roomCode = document
      .getElementById('roomCodeInput')
      .value.trim()
      .toUpperCase();

    if (!playerName) {
      this.gameUI.showError('Please enter your name');
      return;
    }

    if (!roomCode) {
      this.gameUI.showError('Please enter a room code');
      return;
    }

    try {
      this.showConnectionStatus('Connecting to server...', 'connecting');

      this.connection = new GameConnection();

      // Set up event listeners first
      this.setupMultiplayerEvents();

      // Join room
      await this.connection.joinRoom(playerName, roomCode);
    } catch (error) {
      this.showConnectionStatus('Connection failed', 'error');
      this.gameUI.showError(error.message);
    }
  }

  // Show waiting room
  showWaitingRoom(roomCode, maxPlayers) {
    this.roomCode = roomCode;
    this.maxPlayers = maxPlayers;
    document.getElementById('waitingRoomCode').textContent = roomCode;
    document.getElementById('waitingMaxPlayers').textContent = maxPlayers;
    document.getElementById('waitingPlayerCount').textContent = String(
      this.waitingRoomPlayers.length || 1
    );

    this.updateWaitingPlayersList();
    this.gameUI.showModal('waitingRoomModal');
  }

  // Update waiting players list
  updateWaitingPlayersList() {
    if (!this.connection) return;

    const playersList = document.getElementById('waitingPlayersList');
    GameUtils.clearElement(playersList);

    const players = Array.isArray(this.waitingRoomPlayers)
      ? this.waitingRoomPlayers
      : [];
    players.forEach((p) => {
      const playerElement = GameUtils.createElement(
        'div',
        {
          className: `waiting-player ${p.isHost ? 'host' : ''}`,
        },
        [
          GameUtils.createElement('span', {
            textContent: p.name,
          }),
          GameUtils.createElement('span', {
            textContent: p.isHost ? 'Host' : 'Player',
          }),
        ]
      );
      playersList.appendChild(playerElement);
    });

    // Update player count display
    document.getElementById('waitingPlayerCount').textContent = String(
      players.length
    );

    // Enable start button for host when enough players
    const startBtn = document.getElementById('startMultiplayerGameBtn');
    const status = this.connection.getConnectionStatus();
    startBtn.disabled = !(status.isHost && players.length >= 4);
  }

  // Setup multiplayer event listeners
  setupMultiplayerEvents() {
    if (!this.connection) return;

    this.connection.on('onConnect', () => {
      this.showConnectionStatus('Connected to server', 'connected');
    });

    this.connection.on('onRoomCreated', (roomCode, room) => {
      this.isHost = true;
      this.waitingRoomPlayers = Array.isArray(room.players) ? room.players : [];
      this.showWaitingRoom(roomCode, room.playerCount);
      this.hideConnectionStatus();
    });

    this.connection.on('onRoomJoined', (room) => {
      this.isHost = false;
      this.waitingRoomPlayers = Array.isArray(room.players) ? room.players : [];
      this.showWaitingRoom(room.id, room.playerCount);
      this.hideConnectionStatus();
    });

    this.connection.on('onPlayerJoined', (playerId, playerName) => {
      if (!this.waitingRoomPlayers.find((p) => p.id === playerId)) {
        this.waitingRoomPlayers.push({
          id: playerId,
          name: playerName,
          isHost: false,
        });
      }
      this.updateWaitingPlayersList();
      this.gameUI.showInfo(`${playerName} joined the room`);
    });

    this.connection.on('onPlayerLeft', (playerId) => {
      this.waitingRoomPlayers = this.waitingRoomPlayers.filter(
        (p) => p.id !== playerId
      );
      this.updateWaitingPlayersList();
      this.gameUI.showWarning('A player left the room');
    });

    this.connection.on('onGameStarted', (gameState) => {
      // Handle game start from host
      this.gameCore.gameState = gameState;
      this.gameUI.closeModal('waitingRoomModal');
      this.gameUI.showScreen('gameBoard');
      this.updateGameUI();

      // Assign local role for current player
      this.assignLocalRole();

      console.log('Game started. Local role assigned:', this.localRole);
      console.log('Local player name:', this.localPlayerName);
      console.log(
        'Available players:',
        this.gameCore
          .getGameState()
          .players.map((p) => ({ name: p.name, role: p.role }))
      );

      // Only host shows roles distribution
      if (this.isHost) {
        this.showRolesDistributionModal();
      }
    });

    this.connection.on('onRoleDistribution', (gameState) => {
      // Handle role distribution from host
      this.gameCore.gameState = gameState;
      this.updateGameUI();

      // Assign local role for current player
      this.assignLocalRole();

      console.log('Role distribution received. Local role:', this.localRole);

      // Start simplified role reveal sequence for all players
      this.startSimplifiedRoleReveal();
    });

    this.connection.on('onScientistReveal', (forensicInfo) => {
      // Handle scientist reveal from host
      console.log('Scientist reveal received:', forensicInfo);

      // Assign local role for current player
      this.assignLocalRole();

      // Show scientist info and start role reveal sequence
      this.gameUI.showInfo(forensicInfo.message);
      this.updateGameUI();
      this.revealPlayerRolesSequentially();
    });

    this.connection.on('onGameStateUpdate', (gameState) => {
      // Handle game state updates from other players
      this.handleGameStateUpdate(gameState);
    });

    this.connection.on('onError', (error) => {
      this.showConnectionStatus('Connection error', 'error');
      this.gameUI.showError(error);
    });

    this.connection.on('onDisconnect', () => {
      this.showConnectionStatus('Disconnected from server', 'error');
      this.gameUI.showWarning('Disconnected from server');
      this.gameUI.closeModal('waitingRoomModal');
      this.gameUI.showScreen('startScreen');
    });
  }

  // Copy room code to clipboard
  copyRoomCode() {
    const roomCode = document.getElementById('waitingRoomCode').textContent;
    GameUtils.copyToClipboard(roomCode).then(() => {
      this.gameUI.showSuccess('Room code copied to clipboard!');
    });
  }

  // Start multiplayer game
  startMultiplayerGame() {
    if (!this.isHost) return;

    // Initialize the game
    const playerCount = parseInt(
      document.getElementById('multiplayerPlayerCount').value
    );
    this.gameCore.startGame(playerCount);

    // Set player names from waiting room
    this.gameCore.setPlayerNames(this.waitingRoomPlayers.map((p) => p.name));

    // Send game start to other players
    this.connection.startGame(this.gameCore.getGameState());

    // Close waiting room and start game
    this.gameUI.closeModal('waitingRoomModal');
    this.gameUI.showScreen('gameBoard');
    this.updateGameUI();
    // Start simplified role reveal sequence
    this.startSimplifiedRoleReveal();
  }

  // Handle game state updates
  handleGameStateUpdate(gameState) {
    // Update local game state
    this.gameCore.gameState = gameState;
    if (!this.localRole && this.localPlayerName) {
      const me = this.gameCore
        .getGameState()
        .players.find((p) => p.name === this.localPlayerName);
      this.localRole = me?.role || '';
    }
    this.updateGameUI();
  }

  // Leave room
  leaveRoom() {
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }

    this.gameUI.closeModal('waitingRoomModal');
    this.gameUI.showScreen('startScreen');
    this.hideConnectionStatus();
  }

  // Show connection status
  showConnectionStatus(message, status = 'connecting') {
    const statusElement = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    const statusDot = document.querySelector('.status-dot');

    statusText.textContent = message;
    statusDot.className = `status-dot ${status}`;
    statusElement.classList.remove('hidden');
  }

  // Hide connection status
  hideConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.classList.add('hidden');
  }
}
