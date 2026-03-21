let UI = {};
let ws = null;
let roomCode = null;
let currentUser = null;
let gameFinished = false; // Para evitar doble alert al cerrar

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar referencias al DOM DESPUÉS de que cargó la página
  UI = {
    sections: {
        lobby: document.getElementById('lobby-section'),
        game: document.getElementById('game-section'),
        results: document.getElementById('results-section')
    },
    lobby: {
        roomInput: document.getElementById('roomCode'),
        btnJoin: document.getElementById('btnJoin'),
        playersContainer: document.getElementById('playersWaitingContainer'),
        playersList: document.getElementById('playersList'),
        statusText: document.getElementById('lobbyStatusText')
    },
    game: {
        questionDisplay: document.getElementById('questionDisplay'),
        answerInput: document.getElementById('answerInput'),
        btnSubmit: document.getElementById('btnSubmitAnswer'),
        questionCounter: document.getElementById('questionCounter'),
        leaderboardList: document.getElementById('leaderboardList'),
        feedbackMessage: document.getElementById('feedbackMessage')
    },
    results: {
        winnerDisplay: document.getElementById('winnerDisplay'),
        finalLeaderboardList: document.getElementById('finalLeaderboardList')
    }
  };

  const usuarioStore = sessionStorage.getItem('usuarioMathBoost');
  if (!usuarioStore) {
      window.location.href = '/login';
      return;
  }
  currentUser = JSON.parse(usuarioStore);

  // Setup event listeners
  if (UI.lobby.btnJoin) {
    UI.lobby.btnJoin.addEventListener('click', joinRoom);
  }
  if (UI.game.btnSubmit) {
    UI.game.btnSubmit.addEventListener('click', submitAnswer);
  }
  if (UI.game.answerInput) {
    UI.game.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
  }
});

function joinRoom() {
  roomCode = UI.lobby.roomInput.value.trim();
  if (!roomCode || roomCode.length < 4) {
      alert("Por favor ingresa un código de sala válido de 4 caracteres.");
      return;
  }

  // Deshabilitar input mientras conecta
  UI.lobby.roomInput.disabled = true;
  UI.lobby.btnJoin.disabled = true;
  UI.lobby.btnJoin.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Conectando...';

  gameFinished = false;

  // Iniciar WebSocket
  const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/challenge/${roomCode}/${currentUser._id}/${encodeURIComponent(currentUser.nombre)}`;
  console.log("Conectando a:", wsUrl);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
      console.log("✅ Conectado a la sala", roomCode);
      UI.lobby.btnJoin.style.display = 'none';
      UI.lobby.playersContainer.style.display = 'block';
  };

  ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSocketMessage(data);
      } catch(e) {
        console.error("Error parseando mensaje WS:", e);
      }
  };

  ws.onclose = (event) => {
      console.log("Desconectado. Code:", event.code, "Reason:", event.reason);
      if (!gameFinished) {
        alert("Desconectado de la sala. Asegúrate de que el servidor backend (FastAPI) esté corriendo en el puerto 8000.");
        location.reload();
      }
  };

  ws.onerror = (err) => {
      console.error("Error WS:", err);
      // No mostrar alert aquí porque onclose se dispara justo después
      // y ya muestra su propio mensaje
  };
}

function handleSocketMessage(data) {
  console.log("📩 Mensaje recibido:", data);
  
  switch (data.type) {
      case 'error':
          alert(data.message);
          gameFinished = true;
          ws.close();
          break;
          
      case 'player_joined':
          if (UI.lobby.statusText) UI.lobby.statusText.textContent = data.message;
          if (UI.lobby.playersList) {
            UI.lobby.playersList.innerHTML = '';
            if (data.players) {
              data.players.forEach(p => {
                  const li = document.createElement('li');
                  li.innerHTML = `<i class="fas fa-user"></i> ${p.name}`;
                  UI.lobby.playersList.appendChild(li);
              });
            }
          }
          break;

      case 'game_start':
      case 'next_question':
          showSection('game');
          if (UI.game.questionDisplay) UI.game.questionDisplay.textContent = `${data.question} = ?`;
          if (UI.game.questionCounter) UI.game.questionCounter.textContent = `Pregunta ${data.question_index} de ${data.total_questions}`;
          if (UI.game.answerInput) {
            UI.game.answerInput.value = '';
            UI.game.answerInput.style.display = '';
            UI.game.answerInput.focus();
          }
          if (UI.game.btnSubmit) UI.game.btnSubmit.style.display = '';
          if (UI.game.feedbackMessage) UI.game.feedbackMessage.textContent = '';
          break;

      case 'leaderboard_update':
          if (data.leaderboard && UI.game.leaderboardList) {
              updateLeaderboard(data.leaderboard, UI.game.leaderboardList);
          }
          break;

      case 'feedback':
          if (UI.game.feedbackMessage) {
            UI.game.feedbackMessage.style.color = data.correct ? '#10b981' : '#ef4444';
            UI.game.feedbackMessage.textContent = data.correct ? '¡Correcto!' : 'Respuesta incorrecta, intenta de nuevo.';
          }
          if (!data.correct && UI.game.answerInput) {
              UI.game.answerInput.value = '';
              UI.game.answerInput.focus();
          }
          break;
          
      case 'waiting_others':
          if (UI.game.questionDisplay) UI.game.questionDisplay.textContent = "¡Terminaste!";
          if (UI.game.answerInput) UI.game.answerInput.style.display = 'none';
          if (UI.game.btnSubmit) UI.game.btnSubmit.style.display = 'none';
          if (UI.game.feedbackMessage) {
            UI.game.feedbackMessage.style.color = 'var(--secondary-color)';
            UI.game.feedbackMessage.textContent = data.message;
          }
          break;

      case 'game_over':
          gameFinished = true;
          showSection('results');
          if (UI.results.winnerDisplay) UI.results.winnerDisplay.textContent = `Ganador: ${data.winner}`;
          if (data.leaderboard && UI.results.finalLeaderboardList) {
              updateLeaderboard(data.leaderboard, UI.results.finalLeaderboardList);
          }
          ws.close();
          break;
  }
}

function updateLeaderboard(players, container) {
  container.innerHTML = '';
  players.forEach((p, index) => {
      const li = document.createElement('li');
      li.className = `leaderboard-item ${p.finished ? 'finished' : ''}`;
      
      let badge = '';
      if(index === 0) badge = '<span style="color:#f59e0b;"><i class="fas fa-crown"></i> </span>';
      
      li.innerHTML = `
          <span>${badge}${p.name} ${p.finished ? '<i class="fas fa-check-circle"></i>' : ''}</span>
          <span>${p.score} pts</span>
      `;
      container.appendChild(li);
  });
}

function submitAnswer() {
  const val = UI.game.answerInput.value.trim();
  if (val === '') return;
  
  if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
          type: 'submit_answer',
          answer: val
      }));
  }
}

function showSection(sectionName) {
  if (UI.sections.lobby) UI.sections.lobby.style.display = 'none';
  if (UI.sections.game) UI.sections.game.style.display = 'none';
  if (UI.sections.results) UI.sections.results.style.display = 'none';
  
  if (UI.sections[sectionName]) UI.sections[sectionName].style.display = 'block';
}
