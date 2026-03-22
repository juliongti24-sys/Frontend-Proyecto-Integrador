/**
 * desafio.js - Lógica del Desafío Matemático MathBoost
 * Sistema de Gamificación con Polling (KISS) y Soporte de Avatares.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Elementos del DOM ──
    const lobbySection = document.getElementById('lobby-section');
    const gameSection = document.getElementById('game-section');
    const resultsSection = document.getElementById('results-section');

    // Lobby
    const btnJoin = document.getElementById('btnJoin');
    const roomCodeInput = document.getElementById('roomCode');
    const playersWaitingContainer = document.getElementById('playersWaitingContainer');
    const lobbyStatusText = document.getElementById('lobbyStatusText');
    const playersList = document.getElementById('playersList');

    // Game
    const questionCounter = document.getElementById('questionCounter');
    const questionDisplay = document.getElementById('questionDisplay');
    const answerInput = document.getElementById('answerInput');
    const btnSubmitAnswer = document.getElementById('btnSubmitAnswer');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const leaderboardList = document.getElementById('leaderboardList');

    // Results
    const winnerDisplay = document.getElementById('winnerDisplay');
    const finalLeaderboardList = document.getElementById('finalLeaderboardList');

    // Results
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    const finalMyScore = document.getElementById('finalMyScore');
    const finalOpScore = document.getElementById('finalOpScore');

    // ── Estado de la Aplicación ──
    let pollInterval = null;
    let secondsElapsed = 0;
    let matchId = null;
    let currentQuestionIndex = 0;
    let questions = [];
    let isWaitingResponse = false;
    let currentUser = JSON.parse(sessionStorage.getItem('usuarioMathBoost'));

    if (!currentUser) {
        window.location.href = '/login';
        return;
    }

    // ════════════════════════════════════════════════════════════════
    //  Lógica de Búsqueda (Cola)
    // ════════════════════════════════════════════════════════════════
    const startSearching = async () => {
        const roomCode = roomCodeInput.value.trim();
        // Nota: Actualmente el backend ignora el roomCode y usa una cola global,
        // pero lo mantenemos para futura implementación de salas privadas.
        
        try {
            btnJoin.disabled = true;
            btnJoin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            playersWaitingContainer.style.display = 'block';
            lobbyStatusText.textContent = "Buscando oponente...";
            
            // Llamar al backend para entrar a cola
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/queue`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${sessionStorage.getItem('tokenMathBoost')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ room_code: roomCode })
            });

            // Iniciar Polling de estado
            pollInterval = setInterval(checkStatus, 2000);

        } catch (error) {
            console.error("Error al buscar partida:", error);
            alert("No se pudo conectar con el servidor de desafíos.");
            btnJoin.disabled = false;
            btnJoin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar a la Sala';
        }
    };

    btnJoin.addEventListener('click', startSearching);

    // ════════════════════════════════════════════════════════════════
    //  Polling de Estado
    // ════════════════════════════════════════════════════════════════
    const checkStatus = async () => {
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/current`);
            const data = await response.json();

            if (data.status === 'matched' || data.status === 'active') {
                clearInterval(pollInterval);
                matchId = data.match_id;
                questions = data.exercises;
                setupGame(data);
            }
        } catch (e) {
            console.error("Error en polling:", e);
        }
    };

    // ════════════════════════════════════════════════════════════════
    //  Configuración del Juego
    // ════════════════════════════════════════════════════════════════
    const setupGame = (data) => {
        lobbySection.style.display = 'none';
        gameSection.style.display = 'block';

        // Set player info
        const myId = currentUser._id;
        const opId = data.opponent_id;
        const info = data.player_info;

        // Player 1 (Tú)
        p1Name.textContent = "Tú";
        renderAvatar(p1Avatar, info[myId].foto_perfil, info[myId].nombre);
        
        // Player 2 (Oponente)
        p2Name.textContent = info[opId].nombre;
        renderAvatar(p2Avatar, info[opId].foto_perfil, info[opId].nombre);

        showQuestion(0);
        
        // Polling de puntajes en paralelo
        setInterval(updateScoresOnly, 3000);
    };

    const renderAvatar = (element, url, name) => {
        if (url) {
            const cleanPath = url.replace(/^\//, '');
            element.innerHTML = `<img src="${window.API_BASE_URL}/${cleanPath}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        } else {
            element.textContent = name ? name.charAt(0).toUpperCase() : '?';
        }
    };

    const showQuestion = (index) => {
        if (index >= questions.length) {
            finishGame();
            return;
        }

        currentQuestionIndex = index;
        const q = questions[index];
        questionCounter.textContent = `Pregunta ${index + 1} de ${questions.length}`;
        questionDisplay.textContent = q.pregunta;
        feedbackMessage.textContent = '';
        answerInput.value = '';
        answerInput.focus();
    };

    btnSubmitAnswer.onclick = () => {
        const answer = answerInput.value.trim();
        if (answer) {
            handleAnswer(answer);
        }
    };

    answerInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            const answer = answerInput.value.trim();
            if (answer) {
                handleAnswer(answer);
            }
        }
    };

    const handleAnswer = async (answer) => {
        if (isWaitingResponse) return;
        isWaitingResponse = true;

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/${matchId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_index: currentQuestionIndex,
                    answer: answer
                })
            });

            const result = await response.json();
            
            if (result.correct) {
                feedbackMessage.style.color = '#10b981';
                feedbackMessage.textContent = "¡Excelente! +10 pts";
            } else {
                feedbackMessage.style.color = '#ef4444';
                feedbackMessage.textContent = "¡Sigue intentando!";
            }

            // Actualizar marcador local inmediatamente para feedback rápido
            updateScoresOnly();

            setTimeout(() => {
                isWaitingResponse = false;
                showQuestion(currentQuestionIndex + 1);
            }, 1000);

        } catch (e) {
            console.error("Error enviando respuesta:", e);
            isWaitingResponse = false;
        }
    };

    const updateScoresOnly = async () => {
        if (!matchId || gameSection.style.display === 'none') return;
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/current`);
            const data = await response.json();
            if (data.scores) {
                leaderboardList.innerHTML = '';
                Object.keys(data.scores).forEach(playerId => {
                    const isMe = playerId === currentUser._id;
                    const pInfo = data.player_info[playerId];
                    const li = document.createElement('li');
                    li.className = 'leaderboard-item';
                    li.innerHTML = `
                        <span>${isMe ? 'Tú' : pInfo.nombre}</span>
                        <span>${data.scores[playerId]} pts</span>
                    `;
                    leaderboardList.appendChild(li);
                });
            }
        } catch (e) {}
    };

    const finishGame = async () => {
        gameSection.style.display = 'none';
        resultsSection.style.display = 'block';

        // Última actualización de puntajes
        try {
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/current`);
            const data = await response.json();
            if (data.scores) {
                finalLeaderboardList.innerHTML = '';
                let winnerId = null;
                let maxScore = -1;

                Object.keys(data.scores).forEach(playerId => {
                    const isMe = playerId === currentUser._id;
                    const pInfo = data.player_info[playerId];
                    const score = data.scores[playerId];
                    
                    if (score > maxScore) {
                        maxScore = score;
                        winnerId = playerId;
                    }

                    const li = document.createElement('li');
                    li.className = 'leaderboard-item';
                    li.innerHTML = `
                        <span>${isMe ? 'Tú' : pInfo.nombre}</span>
                        <span>${score} pts</span>
                    `;
                    finalLeaderboardList.appendChild(li);
                });

                if (winnerId === currentUser._id) {
                    winnerDisplay.textContent = "¡Felicidades, ganaste!";
                } else {
                    winnerDisplay.textContent = `Ganador: ${data.player_info[winnerId].nombre}`;
                }
            }
        } catch (e) {}
    };
});
