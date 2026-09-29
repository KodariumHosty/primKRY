async function send() {
    let res;
    try {
        res = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                login: document.getElementById('login').value,
                password: document.getElementById('password').value
            })
        });
    } catch (err) {
        console.error(err);
        openModal('Сервер временно недоступен. Повторите попытку через некоторое время');
        return;
    }

    let data;
    try {
        data = await res.json();
    } catch (err) {
        console.error(err);
        openModal('Ой! что-то не так. Попробуйте еще раз');
        return;
    }

    if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpires', Date.now() + 7 * 24 * 60 * 60 * 1000);
        window.location.href = 'adminPanel.html';
    } else {
        openModal(data.message || 'Неверный логин или пароль.');
    }
}


document.querySelectorAll('.logg input').forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            send();
        }
    });
});


// Функция открытия модалки
function openModal(text, title = 'Ошибка') {
    const modal = document.getElementById('modalOverlay');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalText').textContent = text;
    modal.classList.add('active');
}

// Функция закрытия модалки
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function closeModalOnOverlay(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModal();
    }
}