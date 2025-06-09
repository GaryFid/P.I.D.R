// --- shop.js без import/export ---

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Загрузка данных магазина
async function loadShop() {
    try {
        const response = await fetch('/api/shop/items', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            // Загружаем категории
            const categories = data.categories || [];
            const categoriesContainer = document.querySelector('.shop-categories');
            categoriesContainer.innerHTML = categories.map(category => `
                <div class="category-item" data-category="${category.id}">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-name">${category.name}</div>
                </div>
            `).join('');
            
            // Загружаем товары
            const items = data.items || [];
            const itemsContainer = document.querySelector('.shop-items');
            itemsContainer.innerHTML = items.map(item => `
                <div class="shop-item" data-item-id="${item.id}" data-category="${item.category}">
                    <div class="item-preview">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.name}</div>
                        <div class="item-description">${item.description}</div>
                        <div class="item-price">
                            <span class="price-value">${item.price}</span>
                            <span class="price-currency">монет</span>
                        </div>
                    </div>
                    <button class="buy-button" data-item-id="${item.id}" ${item.owned ? 'disabled' : ''}>
                        ${item.owned ? 'Куплено' : 'Купить'}
                    </button>
                </div>
            `).join('');
            
            // Активируем первую категорию
            const firstCategory = document.querySelector('.category-item');
            if (firstCategory) {
                firstCategory.click();
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке магазина:', error);
    }
}

// Покупка предмета
async function buyItem(itemId) {
    try {
        const response = await fetch('/api/shop/buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ itemId })
        });
        const data = await response.json();
        
        if (data.success) {
            // Обновляем баланс
            document.querySelector('.balance-value').textContent = data.newBalance;
            
            // Обновляем кнопку
            const button = document.querySelector(`button[data-item-id="${itemId}"]`);
            button.disabled = true;
            button.textContent = 'Куплено';
            
            // Показываем уведомление
            showNotification('Покупка успешно совершена!', 'success');
        } else {
            showNotification(data.error || 'Ошибка при покупке', 'error');
        }
    } catch (error) {
        console.error('Ошибка при покупке:', error);
        showNotification('Произошла ошибка при покупке', 'error');
    }
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Фильтрация предметов по категории
function filterItems(categoryId) {
    document.querySelectorAll('.shop-item').forEach(item => {
        if (categoryId === 'all' || item.dataset.category === categoryId) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadShop();
    
    // Обработчик клика по категории
    document.querySelector('.shop-categories').addEventListener('click', (e) => {
        const category = e.target.closest('.category-item');
        if (category) {
            // Обновляем активную категорию
            document.querySelector('.category-item.active')?.classList.remove('active');
            category.classList.add('active');
            
            // Фильтруем товары
            filterItems(category.dataset.category);
        }
    });
    
    // Обработчик клика по кнопке покупки
    document.querySelector('.shop-items').addEventListener('click', (e) => {
        const buyButton = e.target.closest('.buy-button');
        if (buyButton && !buyButton.disabled) {
            buyItem(buyButton.dataset.itemId);
        }
    });
}); 