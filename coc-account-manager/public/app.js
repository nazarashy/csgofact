const API_BASE_URL = 'http://localhost:3000/api';

let accounts = [];

// Load accounts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAccounts();
});

// Load all accounts
async function loadAccounts() {
    try {
        const response = await fetch(`${API_BASE_URL}/accounts`);
        accounts = await response.json();
        renderAccounts();
    } catch (error) {
        showNotification('Ошибка загрузки аккаунтов: ' + error.message, true);
    }
}

// Render accounts table
function renderAccounts() {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';

    if (accounts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Аккаунты не найдены. Добавьте первый аккаунт!</td></tr>';
        return;
    }

    accounts.forEach(account => {
        const tr = document.createElement('tr');
        const statusClass = account.status === 'Прокачка' ? 'status-prokachka' : 'status-prodan';
        
        tr.innerHTML = `
            <td>${escapeHtml(account.email)}</td>
            <td>${escapeHtml(account.password)}</td>
            <td>${escapeHtml(account.playerTag)}</td>
            <td><span class="status-badge ${statusClass}">${account.status}</span></td>
            <td>
                <button class="btn btn-info" onclick="showCopyModal('${account.id}')" title="Копировать данные">📋</button>
                <button class="btn btn-primary" onclick="editAccount('${account.id}')" title="Редактировать">✏️</button>
                <button class="btn btn-success" onclick="toggleStatus('${account.id}')" title="Сменить статус">🔄</button>
                <button class="btn btn-danger" onclick="deleteAccount('${account.id}')" title="Удалить">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add new account
document.getElementById('addAccountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const playerTag = document.getElementById('playerTag').value;

    try {
        const response = await fetch(`${API_BASE_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, playerTag })
        });

        if (response.ok) {
            showNotification('Аккаунт успешно добавлен!');
            document.getElementById('addAccountForm').reset();
            loadAccounts();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка добавления аккаунта', true);
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, true);
    }
});

// Edit account
function editAccount(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    document.getElementById('editAccountId').value = account.id;
    document.getElementById('editEmail').value = account.email;
    document.getElementById('editPassword').value = account.password;
    document.getElementById('editPlayerTag').value = account.playerTag;
    document.getElementById('editStatus').value = account.status;

    document.getElementById('editModal').classList.add('active');
}

// Save edited account
document.getElementById('editAccountForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editAccountId').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;
    const playerTag = document.getElementById('editPlayerTag').value;
    const status = document.getElementById('editStatus').value;

    try {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, playerTag, status })
        });

        if (response.ok) {
            showNotification('Данные успешно обновлены!');
            closeEditModal();
            loadAccounts();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка обновления', true);
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, true);
    }
});

// Toggle status between "Прокачка" and "Продан"
async function toggleStatus(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    const newStatus = account.status === 'Прокачка' ? 'Продан' : 'Прокачка';

    try {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showNotification(`Статус изменен на "${newStatus}"`);
            loadAccounts();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка изменения статуса', true);
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, true);
    }
}

// Delete account
async function deleteAccount(id) {
    if (!confirm('Вы уверены, что хотите удалить этот аккаунт?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Аккаунт удален!');
            loadAccounts();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка удаления', true);
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, true);
    }
}

// Show copy modal
function showCopyModal(id) {
    const account = accounts.find(acc => acc.id === id);
    if (!account) return;

    document.getElementById('copyEmail').textContent = account.email;
    document.getElementById('copyPassword').textContent = account.password;
    document.getElementById('copyPlayerTag').textContent = account.playerTag;

    document.getElementById('copyModal').classList.add('active');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

// Close copy modal
function closeCopyModal() {
    document.getElementById('copyModal').classList.remove('active');
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Скопировано в буфер обмена!');
    }).catch(err => {
        showNotification('Ошибка копирования: ' + err, true);
    });
}

// Set API key
async function setApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        showNotification('Введите API ключ', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/coc-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apiKey })
        });

        if (response.ok) {
            showNotification('API ключ успешно сохранен!');
            document.getElementById('apiKeyInput').value = '';
        } else {
            const error = await response.json();
            showNotification(error.error || 'Ошибка сохранения ключа', true);
        }
    } catch (error) {
        showNotification('Ошибка: ' + error.message, true);
    }
}

// Show notification
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show' + (isError ? ' error' : '');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const copyModal = document.getElementById('copyModal');
    
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === copyModal) {
        closeCopyModal();
    }
};
