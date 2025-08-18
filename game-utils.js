// Game Utilities - Helper Functions and Utilities

class GameUtils {
    // Fisher-Yates shuffle algorithm
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Validate player count
    static validatePlayerCount(value) {
        const num = parseInt(value);
        return !isNaN(num) && num >= 4 && num <= 12;
    }

    // Create card objects from names
    static createCardObjects(cardNames, type) {
        return cardNames.map(name => ({ name, type }));
    }

    // Get random element from array
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Format timestamp
    static formatTimestamp(date) {
        return date.toLocaleTimeString();
    }

    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Check if arrays have common elements
    static hasCommonElements(arr1, arr2) {
        return arr1.some(item => arr2.includes(item));
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Sanitize HTML input
    static sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Capitalize first letter
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Format number with commas
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Get random number between min and max
    static randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Check if device is mobile
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Check if device is touch capable
    static isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get viewport dimensions
    static getViewportDimensions() {
        return {
            width: window.innerWidth || document.documentElement.clientWidth,
            height: window.innerHeight || document.documentElement.clientHeight
        };
    }

    // Scroll to element smoothly
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    // Download data as file
    static downloadAsFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Load image and return promise
    static loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Preload multiple images
    static async preloadImages(imageUrls) {
        const promises = imageUrls.map(url => this.loadImage(url));
        return Promise.all(promises);
    }

    // Get CSS variable value
    static getCSSVariable(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name);
    }

    // Set CSS variable value
    static setCSSVariable(name, value) {
        document.documentElement.style.setProperty(name, value);
    }

    // Animate element
    static animateElement(element, animation, duration = 1000) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    // Fade in element
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Fade out element
    static fadeOut(element, duration = 300) {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - progress / duration, 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Create element with attributes
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    // Remove all children from element
    static clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    // Add event listener with options
    static addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    }

    // Remove event listener
    static removeEventListener(element, event, handler, options = {}) {
        element.removeEventListener(event, handler, options);
    }

    // Generate unique ID
    static generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}
