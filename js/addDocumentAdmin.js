const API = "http://127.0.0.1:5000";

const docForm = document.getElementById('docForm');
const fileInput = document.getElementById('documentFile');
const fileBtnText = document.getElementById('fileBtnText');
const filePreviewBox = document.getElementById('filePreviewBox');
const fileNameText = document.getElementById('fileNameText');
const removeFileBtn = document.getElementById('removeFileBtn');
const modalOverlay = document.getElementById('modalOverlay');

let currentBase64 = null;
let currentFileName = null;

// Выбор файла — переводим в Base64 и показываем имя
fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        currentFileName = file.name;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            currentBase64 = reader.result;
            fileNameText.textContent = currentFileName;
            filePreviewBox.style.display = 'flex';
            fileBtnText.textContent = 'Изменить документ';
        };
    }
});

// Удаление файла
removeFileBtn.addEventListener('click', function() {
    fileInput.value = '';
    currentBase64 = null;
    currentFileName = null;
    fileNameText.textContent = '';
    filePreviewBox.style.display = 'none';
    fileBtnText.textContent = 'Выбрать документ';
});

// Отправка
docForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const note = document.getElementById('note').value.trim();
    const token = localStorage.getItem('token');

    if (!note) {
        alert('Введите заметку / описание документа');
        return;
    }
    if (!currentBase64) {
        alert('Добавьте файл!');
        return;
    }

    try {
        const res = await fetch(`${API}/api/addDocument`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                note: note,
                fileName: currentFileName,   // может быть null — бэк должен уметь
                fileData: currentBase64,
                token: token || ''
            })
        });

        if (res.ok) {
            modalOverlay.classList.add('active');
        } else if(res.status === 401){
            alert('Вы не авторизованы. Пожалуйста вернитесь на страницу авторизации');
            window.location.href = "loginAdm.html";
        }else {
            const err = await res.text();
            alert('Ошибка: ' + res.status + ' ' + err);
        }
    } catch (err) {
        console.error(err);
        alert('Ошибка сети или сервер недоступен');
    }
});