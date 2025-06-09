// --- game-setup.js без import/export ---

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Состояние настроек
let gameSettings = {
    playerCount: 2,
    timeLimit: 0, // 0 = без ограничения
    aiOpponents: 0,
    customRules: []
};

// Инициализация страницы
function initSetup() {
    // Инициализация слайдера количества игроков
    const playerCountSlider = document.querySelector('#player-count');
    const playerCountValue = document.querySelector('#player-count-value');
    
    playerCountSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        gameSettings.playerCount = value;
        playerCountValue.textContent = value;
        updateAIOptions(value);
    });
    
    // Инициализация переключателя времени
    document.querySelectorAll('input[name="time-limit"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameSettings.timeLimit = parseInt(e.target.value);
        });
    });
    
    // Инициализация слайдера ИИ противников
    const aiSlider = document.querySelector('#ai-opponents');
    const aiValue = document.querySelector('#ai-value');
    
    aiSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        gameSettings.aiOpponents = value;
        aiValue.textContent = value;
    });
    
    // Инициализация чекбоксов правил
    document.querySelectorAll('.rule-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const ruleId = e.target.dataset.ruleId;
            if (e.target.checked) {
                gameSettings.customRules.push(ruleId);
            } else {
                const index = gameSettings.customRules.indexOf(ruleId);
                if (index > -1) {
                    gameSettings.customRules.splice(index, 1);
                }
            }
        });
    });
}

// Обновление опций ИИ в зависимости от количества игроков
function updateAIOptions(playerCount) {
    const aiSlider = document.querySelector('#ai-opponents');
    const maxAI = Math.max(0, playerCount - 1); // Минимум 1 реальный игрок
    
    aiSlider.max = maxAI;
    if (gameSettings.aiOpponents > maxAI) {
        aiSlider.value = maxAI;
        gameSettings.aiOpponents = maxAI;
        document.querySelector('#ai-value').textContent = maxAI;
    }
    
    // Отключаем слайдер, если нельзя добавить ИИ
    aiSlider.disabled = maxAI === 0;
}

// Создание игры
async function createGame() {
    try {
        const response = await fetch('/api/game/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(gameSettings)
        });
        const data = await response.json();
        
        if (data.success) {
            // Показываем окно с кодом игры
            showGameCode(data.gameCode);
        } else {
            showError(data.error || 'Ошибка при создании игры');
        }
    } catch (error) {
        console.error('Ошибка при создании игры:', error);
        showError('Произошла ошибка при создании игры');
    }
}

// Показ кода игры
function showGameCode(code) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Игра создана!</h3>
            <p>Поделитесь этим кодом с друзьями:</p>
            <div class="game-code">${code}</div>
            <button class="copy-code">Скопировать код</button>
            <button class="start-game">Начать игру</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Копирование кода
    modal.querySelector('.copy-code').addEventListener('click', () => {
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Код скопирован!', 'success');
        });
    });
    
    // Начало игры
    modal.querySelector('.start-game').addEventListener('click', () => {
        window.location.href = `/game.html?code=${code}`;
    });
}

// Показ ошибки
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initSetup();
    
    // Обработчик кнопки создания игры
    document.querySelector('.create-game').addEventListener('click', createGame);
});

document.addEventListener('DOMContentLoaded', function() {
    var tgApp = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if (tgApp) tgApp.expand();
    if (tgApp && tgApp.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tgApp.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tgApp.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-button-color', tgApp.themeParams.button_color || '#3390ec');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tgApp.themeParams.button_text_color || '#ffffff');
    }
    var user = window.getCurrentUser ? window.getCurrentUser() : null;
    var playerCount = 4;
    var withAI = false;
    // Выбор стола
    var tables = document.querySelectorAll('.oval-table');
    tables.forEach(function(table) {
        table.addEventListener('click', function() {
            playerCount = +table.dataset.players;
            tables.forEach(function(t) { t.classList.remove('selected'); });
            table.classList.add('selected');
        });
    });
    // Переключатель ботов
    var aiCheckbox = document.getElementById('with-ai');
    if (aiCheckbox) {
        aiCheckbox.addEventListener('change', function(e) {
            withAI = e.target.checked;
        });
    }
    // Кнопка "Начать игру"
    var startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', async function() {
            try {
                var res = await fetch('/api/games/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user && user.id,
                        username: user && user.username,
                        playerCount: playerCount,
                        withAI: withAI
                    })
                });
                var data = await res.json();
                if (data.game && data.game.id) {
                    window.location.href = '/game.html?id=' + data.game.id;
                } else {
                    window.showToast('Ошибка при создании игры', 'error');
                }
            } catch (e) {
                window.showToast('Ошибка при создании игры', 'error');
            }
        });
    }
    // Кнопка "Назад"
    var backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = '/index.html';
        });
    }
    // Кнопка "Правила игры"
    var rulesBtn = document.getElementById('rules-btn');
    if (rulesBtn) {
        rulesBtn.addEventListener('click', function() {
            window.showModal('Правила', '<p>Правила игры будут здесь.</p>');
        });
    }
});

// Получение элементов интерфейса
const ovalTables = document.querySelectorAll('.oval-table');
const withAIToggle = document.getElementById('with-ai');
const aiTestModeToggle = document.getElementById('ai-test-mode');
const startGameBtn = document.getElementById('start-game-btn');
const backBtn = document.getElementById('back-btn');
const rulesBtn = document.getElementById('rules-btn');
const rulesModal = document.getElementById('rules-modal');
const closeModal = document.querySelector('.close-modal');

// Переменная для хранения выбранного количества игроков
let selectedPlayerCount = 4;

// Выбираем по умолчанию стол для 4 игроков
ovalTables[0].classList.add('selected');

// Обработчик выбора стола
ovalTables.forEach(table => {
    table.addEventListener('click', function() {
        // Убираем класс selected у всех столов
        ovalTables.forEach(t => t.classList.remove('selected'));
        
        // Добавляем класс selected к выбранному столу
        this.classList.add('selected');
        
        // Обновляем выбранное количество игроков
        selectedPlayerCount = parseInt(this.getAttribute('data-players'));
        console.log(`Выбрано игроков: ${selectedPlayerCount}`);
    });
});

// Обработчик переключения режима тестирования с ИИ
aiTestModeToggle.addEventListener('change', function() {
    if (this.checked) {
        // Если включен режим тестирования с ИИ, автоматически включаем и обычный режим с ботами
        withAIToggle.checked = true;
    }
});

// Обработчик переключения режима с ботами
withAIToggle.addEventListener('change', function() {
    if (!this.checked && aiTestModeToggle.checked) {
        // Если отключаем ботов, то отключаем и режим тестирования с ИИ
        aiTestModeToggle.checked = false;
    }
});

// Обработчик открытия модального окна с правилами
rulesBtn.addEventListener('click', function() {
    rulesModal.style.display = 'block';
});

// Обработчик закрытия модального окна с правилами
closeModal.addEventListener('click', function() {
    rulesModal.style.display = 'none';
});

// Закрытие модального окна при клике за его пределами
window.addEventListener('click', function(event) {
    if (event.target === rulesModal) {
        rulesModal.style.display = 'none';
    }
});

// Обработчик кнопки "Назад"
backBtn.addEventListener('click', function() {
    window.location.href = '/index.html';
});

// Обработчик кнопки "Начать игру"
startGameBtn.addEventListener('click', function() {
    try {
        // Сохраняем настройки игры
        const gameSettings = {
            playerCount: selectedPlayerCount,
            withAI: withAIToggle.checked,
            aiTestMode: aiTestModeToggle.checked
        };
        localStorage.setItem('gameSettings', JSON.stringify(gameSettings));
        console.log(`Сохранены настройки игры: ${JSON.stringify(gameSettings)}`);
        // Если используем Telegram WebApp, отправляем данные в бота
        if (tg && tg.isExpanded) {
            const userData = JSON.parse(user);
            tg.sendData(JSON.stringify({
                action: 'start_game',
                userId: userData.id,
                playerCount: selectedPlayerCount,
                withAI: withAIToggle.checked,
                aiTestMode: aiTestModeToggle.checked
            }));
        }
        // Переходим на страницу игры
        window.location.href = '/game.html';
    } catch (error) {
        console.error('Ошибка при начале игры:', error);
        showToast('Произошла ошибка при начале игры. Пожалуйста, попробуйте еще раз.', 'error');
    }
});

// Универсальная функция для открытия модалки (не более одной одновременно)
window.safeShowModal = function(html, opts = {}) {
  const old = document.getElementById('universal-modal');
  if (old) old.remove();
  showModal(html, opts);
}; 