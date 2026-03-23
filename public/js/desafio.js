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
    const questionDisplay = document.getElementById('questionText');
    const answerInput = document.getElementById('answerInput');
    const btnSubmitAnswer = document.getElementById('btnSubmitAnswer');
    const feedbackMessage = document.getElementById('feedbackMessage');
    const leaderboardList = document.getElementById('leaderboardList');

    // Results
    const winnerDisplay = document.getElementById('winnerDisplay');
    const finalLeaderboardList = document.getElementById('finalLeaderboardList');

    const p1Name = document.getElementById('p1Name');
    const p1Avatar = document.getElementById('p1Avatar');
    const p2Name = document.getElementById('p2Name');
    const p2Avatar = document.getElementById('p2Avatar');

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
    let matchData = null;
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
        
        if (!roomCode) {
            alert("Por favor ingresa un código de sala para participar.");
            return;
        }

        // Nota: Actualmente el backend ignora el roomCode y usa una cola global,
        // pero lo mantenemos para futura implementación de salas privadas.
        
        try {
            btnJoin.disabled = true;
            btnJoin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            playersWaitingContainer.style.display = 'block';
            lobbyStatusText.textContent = "Buscando oponente...";
            
            const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
            if (!usuarioStore) return;
            const usuario = JSON.parse(usuarioStore);
            const token = sessionStorage.getItem('tokenMathBoost');

            // Llamar al backend para entrar a cola
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/queue`, {
                method: 'POST',
                headers: { 
                    'X-User-ID': usuario._id,
                    'X-User-Role': usuario.rol,
                    'Authorization': `Bearer ${token}`,
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
    async function checkStatus() {
        const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
        if (!usuarioStore) return;
        const usuario = JSON.parse(usuarioStore);
        const token = sessionStorage.getItem('tokenMathBoost');

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/current`, {
                headers: {
                    'X-User-ID': usuario._id,
                    'X-User-Role': usuario.rol,
                    'Authorization': `Bearer ${token}`
                }
            });
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
            const cleanBaseUrl = (window.API_BASE_URL || '').replace(/\/+$/, '');
            const src = /^https?:\/\//i.test(url) ? url : `${cleanBaseUrl}/${cleanPath}`;
            element.innerHTML = `<img src="${src}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
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
        questionDisplay.innerHTML = q.pregunta; // Usamos innerHTML para LaTeX/MathML
        feedbackMessage.textContent = '';
        answerInput.value = '';
        answerInput.focus();

        // Renderizar LaTeX dinámicamente
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            window.MathJax.typesetPromise([questionDisplay]).catch((err) => console.log('MathJax error:', err));
        }
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
                matchData = data; // Update matchData with latest scores
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
                matchData = data; // Ensure matchData is up-to-date
                finalLeaderboardList.innerHTML = '';
                let winnerId = null;
                let maxScore = -1;
                let isDraw = false;

                Object.keys(data.scores).forEach(playerId => {
                    const isMe = playerId === currentUser._id;
                    const pInfo = data.player_info[playerId];
                    const score = data.scores[playerId];
                    
                    if (score > maxScore) {
                        maxScore = score;
                        winnerId = playerId;
                        isDraw = false;
                    } else if (score === maxScore && maxScore !== -1) {
                        isDraw = true;
                    }

                    const li = document.createElement('li');
                    li.className = 'leaderboard-item';
                    li.innerHTML = `
                        <span>${isMe ? 'Tú' : pInfo.nombre}</span>
                        <span>${score} pts</span>
                    `;
                    finalLeaderboardList.appendChild(li);
                });

                const scores = Object.values(data.scores || {});
                const allZero = scores.length > 0 && scores.every(score => Number(score) === 0);
                const sameScore = scores.length > 1 && new Set(scores.map(score => Number(score))).size === 1;

                let winnerText = '';
                if (allZero || sameScore || isDraw) {
                    winnerText = 'Empate';
                } else if (winnerId === currentUser._id) {
                    winnerText = "¡Felicidades, ganaste!";
                } else if (winnerId) {
                    winnerText = `Ganador: ${data.player_info[winnerId].nombre}`;
                } else {
                    winnerText = "Empate";
                }
                winnerDisplay.textContent = winnerText;
            }
        } catch (e) {}
    };
});
