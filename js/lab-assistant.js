// Lab Assistant System - Provides guided, adaptive tutoring
class LabAssistant {
    constructor() {
        this.messages = [];
        this.currentMessageIndex = 0;
        this.isSpeaking = false;
        this.userLevel = 'beginner';
        this.hintCount = 0;
        this.maxHintsPerStep = 2;
        this.speechSynthesis = window.speechSynthesis;
        
        // Define achievements first (order matters!)
        this.achievementDefinitions = {
            firstDrag: { name: "Primer Arrastre", desc: "Arrastra tu primer elemento", icon: "🤚", unlocked: false },
            correctTata: { name: "Caja TATA Perfecta", desc: "Coloca la Caja TATA correctamente", icon: "🎯", unlocked: false },
            correctInr: { name: "INR Preciso", desc: "Coloca el INR exactamente en su sitio", icon: "📍", unlocked: false },
            allFactors: { name: "Equipo Completo", desc: "Coloca todos los factores correctamente", icon: "🧩", unlocked: false },
            fullComplex: { name: "Complejo Completo", desc: "Ensambla todo el complejo de iniciación", icon: "🏆", unlocked: false },
            quickLearner: { name: "Aprendiz Rápido", desc: "Completa el tutorial en menos de 2 minutos", icon: "⚡", unlocked: false },
            noHints: { name: "Experto Autodidacta", desc: "Completa sin usar pistas", icon: "🧠", unlocked: false }
        };
        
        // Load saved achievements after definition
        this.loadAchievements();
        this.setupSpeechSynthesis();
        
        // Initialize frontend displays
        this.updateFrontendMessage('¡Hola! Soy tu asistente de laboratorio. Estoy aquí para guiarte en el proceso de transcripción.', 'celebration');
        this.updateAchievementsDisplay();
        
        // Define tutorial flow by step
        this.tutorialFlow = {
            1: [
                "¡Hola! Soy tu asistente de laboratorio. Vamos a explorar cómo comienza la transcripción en células eucariotas.",
                "Primero, conoce a la ARN Polimerasa II - es la máquina que hace copias de ARN a partir del ADN.",
                "Arrastra el elemento 'Pol II' desde la barra lateral hacia el área de trabajo. Suéltalo cerca del centro.",
                "¡Correcto! Ahora observa cómo tiene cuatro partes importantes: dos alfas (los lados), beta (izquierda), beta' (derecha) y sigma (frente).",
                "La subunidad sigma es especial - ayuda a la polimerasa a encontrar el lugar correcto para comenzar."
            ],
            2: [
                "Ahora necesitamos encontrar el punto de inicio correcto en el ADN.",
                "Busca la 'Caja TATA' en la barra lateral - contiene la secuencia especial TATAAA.",
                "Arrastra la Caja TATA y colócala en el ADN donde veas las letras TATAAA resaltadas.",
                "Cuando la coloques cerca de su posición correcta, se encajará automáticamente.",
                "La Caja TATA es como un anuncio que dice: '¡Comienza la transcripción aquí aproximadamente!'"
            ],
            3: [
                "Muy bien. Ahora encontramos el sitio exacto de inicio.",
                "Busca el elemento 'INR' (Iniciador) en la barra lateral.",
                "Arrastra el INR y colócalo donde el ADN tiene el sitio de inicio exacto (+1).",
                "El INR contiene la secuencia Py2CAPy4 que define exactamente dónde comienza la copia de ARN.",
                "Cuando la polimerasa encuentra tanto la Caja TATA como el INR, sabe que está en el lugar correcto."
            ],
            4: [
                "Ahora necesitamos los factores de transcripción - son como asistentes que ayudan a la polimerasa a prepararse.",
                "Comienza con TFIID (que contiene la proteína TBP) - se une primero a la Caja TATA.",
                "Luego llega TFIIB, que actúa como un puente entre TBP y la polimerasa.",
                "TFIIF escolta a la polimerasa y la estabiliza.",
                "TFIIE recluta a TFIIH, y finalmente TFIIH abre el ADN y activa a la polimerasa.",
                "Arrastra cada factor a su posición correcta cerca de la polimerasa y el ADN."
            ],
            5: [
                "¡Excelente trabajo! Has ensamblado casi todo el complejo de iniciación.",
                "Cuando todos los factores estén en su lugar, TFIIH hace dos cosas importantes:",
                "1. Abre el ADN creando una 'burbuja de transcripción' usando sus helicasas",
                "2. Activa a la polimerasa fosforilando su cola (CTD) usando su quinasa",
                "Ahora la polimerasa puede comenzar a sintetizar ARN usando una hebra de ADN como molde.",
                "Observa cómo comienza a salir la cadena de ARN desde el sitio +1."
            ]
};
    }
    
    setupSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.speechSynthesis.onend = () => {
                this.isSpeaking = false;
                this.playNextMessage();
            };
            this.speechSynthesis.onerror = (e) => {
                console.error('Speech synthesis error:', e);
                this.isSpeaking = false;
            };
        }
    }
    
    speak(text, urgency = 'normal') {
        if (!('speechSynthesis' in window) || !this.speechSynthesis) {
            console.log('Speech not supported:', text);
            return;
        }
        
        // Update frontend message area
        this.updateFrontendMessage(text, urgency);
        
        // Cancel current speech if new urgent message
        if (urgency === 'urgent') {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
        }
        
        if (this.isSpeaking) {
            this.messages.push({ text, urgency });
            return;
        }
        
        this.isSpeaking = true;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        
        // Different voices for different message types
        if (urgency === 'celebration') {
            utterance.rate = 1.1;
            utterance.pitch = 1.3;
        } else if (urgency === 'warning') {
            utterance.rate = 0.8;
            utterance.pitch = 0.9;
        }
        
        this.speechSynthesis.speak(utterance);
    }
    
    updateFrontendMessage(text, urgency) {
        const messageElement = document.getElementById('labAssistantMessageText');
        if (!messageElement) return;
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `lab-message lab-message-${urgency}`;
        messageDiv.textContent = text;
        
        // Add hover event listeners to prevent auto-remove
        messageDiv.addEventListener('mouseenter', () => {
            messageDiv.style.opacity = '1';
            messageDiv.style.pointerEvents = 'auto';
        });
        
        messageDiv.addEventListener('mouseleave', () => {
            messageDiv.style.opacity = '0.8';
        });
        
        // Auto-remove after 5 seconds unless hovered
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.transition = 'opacity 0.5s ease';
                messageDiv.style.opacity = '0';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 500);
            }
        }, 5000);
        
        // Add to message area
        messageElement.appendChild(messageDiv);
        
        // Auto-scroll to bottom
        const messagesContainer = document.getElementById('labAssistantMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Limit number of messages to prevent overflow
        const maxMessages = 10;
        const messages = messageElement.children;
        if (messages.length > maxMessages) {
            messageElement.removeChild(messages[0]);
        }
    }
    
    playNextMessage() {
        if (this.messages.length > 0) {
            const next = this.messages.shift();
            this.speak(next.text, next.urgency);
        } else {
            this.isSpeaking = false;
        }
    }
    
    startTutorialForStep(step) {
        this.currentStep = step;
        this.currentMessageIndex = -1;
        this.stepStartTime = Date.now();
        this.hintCount = 0;
        
        if (this.tutorialFlow[step]) {
            this.showNextTutorialMessage();
        }
    }
    
    showNextTutorialMessage() {
        if (!this.tutorialFlow[this.currentStep]) return;
        
        const messages = this.tutorialFlow[this.currentStep];
        if (this.currentMessageIndex < messages.length - 1) {
            this.currentMessageIndex++;
            this.speak(messages[this.currentMessageIndex]);
        }
    }
    
    showHint() {
        if (this.hintCount >= this.maxHintsPerStep) {
            this.speak("Ya has usado todas las pistas disponibles para este paso. Inténtalo de nuevo!", 'warning');
            return;
        }
        
        this.hintCount++;
        const hints = {
            1: "Busca el elemento con el nombre 'Pol II' en la barra lateral izquierda. Tiene un icono naranja.",
            2: "La Caja TATA es roja y contiene las letras TATAAA. Busca dónde aparecen esas letras en el ADN.",
            3: "El INR es azul y marca el sitio +1. Busca el sitio de inicio marcado en el ADN.",
            4: "Los factores se nombran TFIIB, TFIIF, TFIIE y TFIIH. Cada uno tiene un color único.",
            5: "Todos los factores deben estar cerca de la polimerasa y el ADN. Observa sus colores y posiciones."
        };
        
        this.speak(hints[this.currentStep] || "Intenta colocar los elementos cerca de sus contornos resaltados.");
    }
    
    checkAchievement(achievementId) {
        const achievement = this.achievementDefinitions[achievementId];
        if (!achievement) return false;
        
        if (!achievement.unlocked) {
            achievement.unlocked = true;
            this.saveAchievements();
            this.unlockAchievement(achievement);
            return true;
        }
        return false;
    }
    
    unlockAchievement(achievement) {
        // Show achievement popup
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Animate in
        setTimeout(() => popup.classList.add('show'), 10);
        
        // Celebrate with speech
        this.speak("¡Logro desbloqueado: " + achievement.name + "!", 'celebration');
        
        // Update frontend achievements display
        this.updateAchievementsDisplay();
        
        // Remove after delay
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                if (popup.parentNode) document.body.removeChild(popup);
            }, 300);
        }, 3000);
    }
    
    updateAchievementsDisplay() {
        const achievementsElement = document.getElementById('labAssistantAchievementsList');
        if (!achievementsElement) return;
        
        achievementsElement.innerHTML = '';
        
        Object.values(this.achievementDefinitions).forEach(achievement => {
            if (achievement.unlocked) {
                const achievementDiv = document.createElement('div');
                achievementDiv.className = 'achievement-item';
                achievementDiv.innerHTML = `
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-text">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-desc-small">${achievement.desc}</div>
                    </div>
                `;
                achievementsElement.appendChild(achievementDiv);
            }
        });
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('transcriptionLabAchievements');
        if (saved) {
            const savedAchievements = JSON.parse(saved);
            Object.keys(savedAchievements).forEach(key => {
                if (this.achievementDefinitions[key]) {
                    this.achievementDefinitions[key].unlocked = savedAchievements[key].unlocked;
                }
            });
        }
        return this.achievementDefinitions;
    }
    
    saveAchievements() {
        localStorage.setItem('transcriptionLabAchievements', JSON.stringify(this.achievementDefinitions));
    }
    
    checkProgress() {
        // Check if user has placed elements correctly
        const placedCorrectly = {};
        
        // Use the transcription state from the main script
        // Access through the global state variable if available
        const appState = window.__LAB_STATE__ || window.transcriptionState || null;
        if (!appState.droppedElements && appState.droppedElements !== {}) appState.droppedElements = {};

        if (!appState) return placedCorrectly;
        
        // Check TATA
        if (appState.droppedElements && appState.droppedElements.tata) {
            const correctPos = this.getCorrectPosition('tata', appState);
            
            const distance = Math.hypot(
                appState.droppedElements.tata.x - correctPos.x,
                appState.droppedElements.tata.y - correctPos.y
            );
            placedCorrectly.tata = distance < 40; // Tolerance for achievement
        }
        
        // Check INR
        if (appState.droppedElements.inr) {
            const correctPos = this.getCorrectPosition('inr', appState);
            const distance = Math.hypot(
                appState.droppedElements.inr.x - correctPos.x,
                appState.droppedElements.inr.y - correctPos.y
            );
            placedCorrectly.inr = distance < 40;
        }
        
        // Check factors
        const factors = ['tfiib', 'tfiif', 'tfiie', 'tfiih'];
        placedCorrectly.factors = factors.every(f => {
            if (!appState.droppedElements[f]) return false;
            const correctPos = this.getCorrectPosition(f, appState);
            const distance = Math.hypot(
                appState.droppedElements[f].x - correctPos.x,
                appState.droppedElements[f].y - correctPos.y
            );
            return distance < 40;
        });
        
        // Update achievements
        if (appState.droppedElements && Object.keys(appState.droppedElements).length > 0) {
            this.checkAchievement('firstDrag');
        }
        
        if (placedCorrectly.tata) {
            this.checkAchievement('correctTata');
        }
        
        if (placedCorrectly.inr) {
            this.checkAchievement('correctInr');
        }
        
        if (placedCorrectly.factors) {
            this.checkAchievement('allFactors');
        }
        
        // Check if full complex is assembled (step 5)
        if (appState.step >= 5 && placedCorrectly.tata && placedCorrectly.inr && placedCorrectly.factors) {
            this.checkAchievement('fullComplex');
        }
        
        return placedCorrectly;
    }
    
    getCorrectPosition(elementId, appState) {
        if (!appState || !appState.dna) return { x: 0, y: 0 };
        
        const { tataIndex, inrIndex } = appState.dna;
        const tataPoint = getHelixPoint(tataIndex, 1);
        const inrPoint = getHelixPoint(inrIndex, 1);
        const promoterMid = {
            x: (tataPoint.x + inrPoint.x) / 2,
            y: (tataPoint.y + inrPoint.y) / 2 + 6
        };

        const positions = {
            tata: { x: tataPoint.x, y: tataPoint.y - 45 },
            // Compatible con ambos spelling: promotor/promoter/promoter
            promotor: { x: promoterMid.x, y: promoterMid.y - 12 },
            promoter: { x: promoterMid.x, y: promoterMid.y - 12 },
            promoterMid: { x: promoterMid.x, y: promoterMid.y - 12 },
            inr: { x: inrPoint.x, y: inrPoint.y + 10 },
            tfiib: { x: tataPoint.x + 55, y: tataPoint.y - 25 },
            tfiif: { x: inrPoint.x - 95, y: inrPoint.y - 55 },
            tfiie: { x: inrPoint.x + 95, y: inrPoint.y - 55 },
            tfiih: { x: inrPoint.x + 95, y: inrPoint.y - 20 }
        };

        const key = String(elementId || '').toLowerCase();
        return positions[key] || { x: 0, y: 0 };

    }
    
    enterSandboxMode() {
        this.userLevel = 'sandbox';
        this.speak("¡Modo Experimento activado! Ahora puedes colocar los elementos donde quieras y observar qué ocurre. Intenta crear configuraciones incorrectas a propósito para ver qué pasa.", 'celebration');
    }
    
    provideContextualHelp() {
        // Analyze what user might be struggling with
        const appState = window.transcriptionState || (typeof state !== 'undefined' ? state : null);
        if (!appState) return;
        
        if (appState.step === 2 && !appState.droppedElements.tata) {
            // User hasn't placed TATA yet after some time
            const timeOnStep = Date.now() - (this.stepStartTime || Date.now());
            if (timeOnStep > 15000) { // 15 seconds
                this.showHint();
            }
        }
        
        if (appState.step === 4 && Object.keys(appState.droppedElements).filter(k => k.startsWith('tfi')).length < 2) {
            // User struggling with factors
            const timeOnStep = Date.now() - (this.stepStartTime || Date.now());
            if (timeOnStep > 20000) { // 20 seconds
                this.showHint();
            }
        }
    }
}

// Global instance
window.labAssistant = new LabAssistant();


