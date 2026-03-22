/**
 * desafio.js - Lógica del Desafío Matemático MathBoost
 * Sistema de Gamificación con Polling (KISS) y Soporte de Avatares.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Elementos del DOM ──
    const lobbySection = document.getElementById('lobbySection');
    const gameSection = document.getElementById('gameSection');
    const resultsSection = document.getElementById('resultsSection');

    // Lobby
    const btnStartQueue = document.getElementById('btnStartQueue');
    const searchingState = document.getElementById('searchingState');
    const timerDisplay = document.getElementById('timer');
    const btnCancelQueue = document.getElementById('btnCancelQueue');

    // Game
    const questionCount = document.getElementById('questionCount');
    const timeRemaining = document.getElementById('timeRemaining');
    const displayQuestion = document.getElementById('displayQuestion');
    const optionsContainer = document.getElementById('optionsContainer');
    const feedbackMsg = document.getElementById('feedbackMsg');

    // Players Info
    const p1Name = document.getElementById('p1Name');
    const p1Avatar = document.getElementById('p1Avatar');
    const p1Score = document.getElementById('p1Score');
    const p2Name = document.getElementById('p2Name');
    const p2Avatar = document.getElementById('p2Avatar');
    const p2Score = document.getElementById('p2Score');

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
        try {
            btnStartQueue.style.display = 'none';
            searchingState.style.display = 'block';
            
            // Iniciar timer visual
            secondsElapsed = 0;
            const timerInt = setInterval(() => {
                secondsElapsed++;
                const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
                const secs = String(secondsElapsed % 60).padStart(2, '0');
                timerDisplay.textContent = `${mins}:${secs}`;
            }, 1000);

            // Llamar al backend para entrar a cola
            const response = await fetch(`${window.API_BASE_URL}/api/v1/challenges/queue`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tokenMathBoost')}` }
            });

            // Iniciar Polling de estado
            pollInterval = setInterval(checkStatus, 2000);

            btnCancelQueue.addEventListener('click', async () => {
                clearInterval(timerInt);
                clearInterval(pollInterval);
                await fetch(`${window.API_BASE_URL}/api/v1/challenges/current`, { method: 'DELETE' });
                location.reload();
            });

        } catch (error) {
            console.error("Error al buscar partida:", error);
            alert("No se pudo conectar con el servidor de desafíos.");
        }
    };

    btnStartQueue.addEventListener('click', startSearching);

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
            element.innerHTML = `<img src="${window.API_BASE_URL}${url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
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
        questionCount.textContent = `Pregunta ${index + 1}/${questions.length}`;
        displayQuestion.textContent = q.pregunta;
        feedbackMsg.textContent = '';

        optionsContainer.innerHTML = '';
        q.opciones.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.onclick = () => handleAnswer(opt, btn);
            optionsContainer.appendChild(btn);
        });
    };

    const handleAnswer = async (answer, btn) => {
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
                btn.classList.add('correct');
                feedbackMsg.style.color = '#10b981';
                feedbackMsg.textContent = "¡Excelente!";
                p1Score.textContent = `${result.score_update} pts`;
            } else {
                btn.classList.add('wrong');
                feedbackMsg.style.color = '#ef4444';
                feedbackMsg.textContent = "¡Sigue intentando!";
            }

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
                const myId = currentUser._id;
                const opId = data.opponent_id;
                p1Score.textContent = `${data.scores[myId]} pts`;
                p2Score.textContent = `${data.scores[opId]} pts`;
            }
        } catch (e) {}
    };

    const finishGame = async () => {
        gameSection.style.display = 'none';
        resultsSection.style.display = 'block';

        // Última actualización de puntajes
        await updateScoresOnly();
        
        const myScore = parseInt(p1Score.textContent);
        const opScore = parseInt(p2Score.textContent);

        finalMyScore.textContent = myScore;
        finalOpScore.textContent = opScore;

        if (myScore > opScore) {
            resultTitle.textContent = "¡Eres el Ganador!";
            resultSubtitle.textContent = `Has superado a ${p2Name.textContent} en matemáticas.`;
        } else if (myScore < opScore) {
            resultTitle.textContent = "¡Buen esfuerzo!";
            resultSubtitle.textContent = `${p2Name.textContent} ha ganado esta vez. ¡Sigue practicando!`;
        } else {
            resultTitle.textContent = "¡Es un Empate!";
            resultSubtitle.textContent = "¡Ambos son genios matemáticos!";
        }
    };
});
