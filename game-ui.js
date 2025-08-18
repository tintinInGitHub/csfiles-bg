// Game UI Management - Modal, Screen, and Interface Handling

class GameUI {
    constructor() {
        this.currentModal = null;
        this.currentScreen = 'startScreen';
        this.bindUIEvents();
    }

    // Bind UI event listeners
    bindUIEvents() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal(this.currentModal);
            }
        });

        // Prevent modal content clicks from closing modal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-content')) {
                e.stopPropagation();
            }
        });
    }

    // Show screen
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // Show modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            this.currentModal = modalId;
            
            // Focus first input if present
            const firstInput = modal.querySelector('input, select, button');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            if (this.currentModal === modalId) {
                this.currentModal = null;
            }
        }
    }

    // Close current modal
    closeCurrentModal() {
        if (this.currentModal) {
            this.closeModal(this.currentModal);
        }
    }

    // Show error modal
    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        this.showModal('errorModal');
    }

    // Show success message
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    }

    // Show warning message
    showWarning(message, duration = 3000) {
        this.showNotification(message, 'warning', duration);
    }

    // Show info message
    showInfo(message, duration = 3000) {
        this.showNotification(message, 'info', duration);
    }

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = GameUtils.createElement('div', {
            className: `notification notification-${type}`,
            textContent: message
        });

        document.body.appendChild(notification);

        // Animate in
        GameUtils.fadeIn(notification, 300);

        // Auto remove after duration
        setTimeout(() => {
            GameUtils.fadeOut(notification, 300);
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Update players grid
    updatePlayersGrid(players) {
        const grid = document.getElementById('playersGrid');
        GameUtils.clearElement(grid);

        players.forEach(player => {
            const playerCard = this.createPlayerCard(player);
            grid.appendChild(playerCard);
        });
    }

    // Create player card element
    createPlayerCard(player) {
        const cardClasses = ['player-card'];
        
        if (player.role === 'Forensic Scientist') {
            cardClasses.push('forensic-scientist');
        }
        
        if (player.hasBadge) {
            cardClasses.push('has-badge');
        }

        const roleDisplay = player.role === 'Forensic Scientist' ? player.role : 'Hidden';

        return GameUtils.createElement('div', {
            className: cardClasses.join(' ')
        }, [
            GameUtils.createElement('div', {
                className: 'player-name',
                textContent: player.name
            }),
            GameUtils.createElement('div', {
                className: 'player-role',
                textContent: roleDisplay
            }),
            this.createPlayerCardsSection(player)
        ]);
    }

    // Create player cards section
    createPlayerCardsSection(player) {
        return GameUtils.createElement('div', {
            className: 'player-cards'
        }, [
            this.createCardTypeSection('clue-cards', 'Clue Cards:', player.clueCards),
            this.createCardTypeSection('mean-cards', 'Mean Cards:', player.meanCards)
        ]);
    }

    // Create card type section
    createCardTypeSection(className, title, cards) {
        return GameUtils.createElement('div', {
            className: className
        }, [
            GameUtils.createElement('div', {
                className: 'card-type',
                textContent: title
            }),
            GameUtils.createElement('div', {
                className: 'card-list',
                textContent: cards.map(card => card.name).join(', ')
            })
        ]);
    }

    // Update phase display
    updatePhaseDisplay(phase, round) {
        document.getElementById('currentPhase').textContent = `Phase: ${GameUtils.capitalize(phase)}`;
        document.getElementById('currentRound').textContent = `Round: ${round}`;
    }

    // Update discussion log
    updateDiscussionLog(discussionLog) {
        const logElement = document.getElementById('discussionLog');
        GameUtils.clearElement(logElement);

        discussionLog.forEach(entry => {
            const entryElement = GameUtils.createElement('div', {
                className: 'discussion-entry'
            }, [
                GameUtils.createElement('span', {
                    className: 'player-name',
                    textContent: `[${entry.timestamp}]`
                }),
                document.createTextNode(` ${entry.text}`)
            ]);
            
            logElement.appendChild(entryElement);
        });

        // Scroll to bottom
        logElement.scrollTop = logElement.scrollHeight;
    }

    // Update scene tile
    updateSceneTile(sceneTile) {
        const sceneElement = document.getElementById('sceneTile');
        const textElement = sceneElement.querySelector('.scene-text');
        const markerElement = document.getElementById('bulletMarker');

        if (sceneTile) {
            textElement.textContent = sceneTile.text;
            markerElement.classList.add('hidden');
        } else {
            textElement.textContent = 'No scene selected';
            markerElement.classList.add('hidden');
        }
    }

    // Show bullet marker
    showBulletMarker(position) {
        const marker = document.getElementById('bulletMarker');
        marker.classList.remove('hidden');
        
        // Position the marker (simplified positioning)
        if (position === 'left') {
            marker.style.left = '10px';
            marker.style.top = '50%';
        } else if (position === 'right') {
            marker.style.right = '10px';
            marker.style.top = '50%';
        } else {
            marker.style.left = '50%';
            marker.style.top = '50%';
        }
    }

    // Populate dropdown options
    populateDropdown(dropdownId, options, placeholder = 'Select...') {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        GameUtils.clearElement(dropdown);

        // Add placeholder
        if (placeholder) {
            const placeholderOption = GameUtils.createElement('option', {
                value: '',
                textContent: placeholder,
                disabled: true,
                selected: true
            });
            dropdown.appendChild(placeholderOption);
        }

        // Add options
        options.forEach(option => {
            const optionElement = GameUtils.createElement('option', {
                value: option.value || option,
                textContent: option.text || option
            });
            dropdown.appendChild(optionElement);
        });
    }

    // Get dropdown value
    getDropdownValue(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        return dropdown ? dropdown.value : '';
    }

    // Set dropdown value
    setDropdownValue(dropdownId, value) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.value = value;
        }
    }

    // Get input value
    getInputValue(inputId) {
        const input = document.getElementById(inputId);
        return input ? input.value : '';
    }

    // Set input value
    setInputValue(inputId, value) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = value;
        }
    }

    // Clear input
    clearInput(inputId) {
        this.setInputValue(inputId, '');
    }

    // Enable/disable button
    setButtonState(buttonId, enabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !enabled;
        }
    }

    // Show/hide element
    setElementVisibility(elementId, visible) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = visible ? '' : 'none';
        }
    }

    // Add CSS class to element
    addElementClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
    }

    // Remove CSS class from element
    removeElementClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }

    // Toggle CSS class on element
    toggleElementClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className);
        }
    }

    // Animate element
    animateElement(elementId, animation, duration = 1000) {
        const element = document.getElementById(elementId);
        if (element) {
            GameUtils.animateElement(element, animation, duration);
        }
    }

    // Show loading spinner
    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const spinner = GameUtils.createElement('div', {
                className: 'loading-spinner'
            }, [
                GameUtils.createElement('div', {
                    className: 'spinner'
                })
            ]);
            
            container.appendChild(spinner);
        }
    }

    // Hide loading spinner
    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const spinner = container.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    // Create progress bar
    createProgressBar(containerId, progress, max = 100) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const progressBar = GameUtils.createElement('div', {
            className: 'progress-bar'
        }, [
            GameUtils.createElement('div', {
                className: 'progress-fill',
                style: `width: ${(progress / max) * 100}%`
            })
        ]);

        GameUtils.clearElement(container);
        container.appendChild(progressBar);
    }

    // Show confirmation dialog
    showConfirmation(message, onConfirm, onCancel) {
        const confirmModal = GameUtils.createElement('div', {
            className: 'modal active'
        }, [
            GameUtils.createElement('div', {
                className: 'modal-content'
            }, [
                GameUtils.createElement('h3', {
                    textContent: 'Confirm Action'
                }),
                GameUtils.createElement('p', {
                    textContent: message
                }),
                GameUtils.createElement('div', {
                    className: 'modal-buttons'
                }, [
                    GameUtils.createElement('button', {
                        className: 'btn-primary',
                        textContent: 'Confirm'
                    }),
                    GameUtils.createElement('button', {
                        className: 'btn-secondary',
                        textContent: 'Cancel'
                    })
                ])
            ])
        ]);

        document.body.appendChild(confirmModal);

        const confirmBtn = confirmModal.querySelector('.btn-primary');
        const cancelBtn = confirmModal.querySelector('.btn-secondary');

        confirmBtn.addEventListener('click', () => {
            confirmModal.remove();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            confirmModal.remove();
            if (onCancel) onCancel();
        });
    }

    // Show input dialog
    showInputDialog(title, placeholder, onConfirm, onCancel) {
        const inputModal = GameUtils.createElement('div', {
            className: 'modal active'
        }, [
            GameUtils.createElement('div', {
                className: 'modal-content'
            }, [
                GameUtils.createElement('h3', {
                    textContent: title
                }),
                GameUtils.createElement('input', {
                    type: 'text',
                    placeholder: placeholder,
                    className: 'input-field'
                }),
                GameUtils.createElement('div', {
                    className: 'modal-buttons'
                }, [
                    GameUtils.createElement('button', {
                        className: 'btn-primary',
                        textContent: 'Confirm'
                    }),
                    GameUtils.createElement('button', {
                        className: 'btn-secondary',
                        textContent: 'Cancel'
                    })
                ])
            ])
        ]);

        document.body.appendChild(inputModal);

        const input = inputModal.querySelector('input');
        const confirmBtn = inputModal.querySelector('.btn-primary');
        const cancelBtn = inputModal.querySelector('.btn-secondary');

        input.focus();

        const handleConfirm = () => {
            const value = input.value.trim();
            inputModal.remove();
            if (onConfirm) onConfirm(value);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleConfirm();
            }
        });

        cancelBtn.addEventListener('click', () => {
            inputModal.remove();
            if (onCancel) onCancel();
        });
    }
}
