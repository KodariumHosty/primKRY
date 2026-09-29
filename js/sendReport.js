const overlay = document.getElementById('dididna');

function openModal() {
    overlay.classList.add('active');
}

function closeModal() {
    overlay.classList.remove('active');
}

const agreeCheckbox = document.getElementById('agree');
const sbmit     = document.getElementById('submitBtn');

agreeCheckbox.addEventListener('change', () => {
    sbmit.disabled = !agreeCheckbox.checked;
});

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileSelectedContainer = document.getElementById('fileSelectedContainer');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');
const changeFileBtn = document.getElementById('changeFileBtn');

function handleFileChange() {
    if (fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    fileName.textContent = file.name;

    uploadBtn.classList.add('hidden');
    fileSelectedContainer.classList.remove('hidden');
    } else {
    fileName.textContent = '';

    uploadBtn.classList.remove('hidden');
    fileSelectedContainer.classList.add('hidden');
    }
}

fileInput.addEventListener('change', handleFileChange);

changeFileBtn.addEventListener('click', () => {
    fileInput.click();
});

removeFileBtn.addEventListener('click', () => {
    fileInput.value = '';
    handleFileChange();
});




const phoneInput = document.getElementById('phone');

phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
});

phoneInput.addEventListener('paste', (e) => {
    e.preventDefault();
    let pasted = (e.clipboardData || window.clipboardData).getData('text');
    pasted = pasted.replace(/\D/g, '');          // только цифры
    if (pasted.startsWith('8')) pasted = pasted.slice(1);   // 8 → 9...
    if (pasted.startsWith('7')) pasted = pasted.slice(1);   // +7 → ...
    phoneInput.value = pasted.slice(0, 10);      // максимум 10 цифр
});

phoneInput.addEventListener('keydown', (e) => {
    if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        phoneInput.selectionStart === 0 &&
        phoneInput.selectionEnd === 0
    ) {
        e.preventDefault();
    }
});


function openSuccess(text, title = 'Обращение отправлено') {
        const modal = document.getElementById('successOverlay');
        document.getElementById('successTitle').textContent = title;
        document.getElementById('successText').textContent = text;
        modal.classList.add('active');
    }
    function closeSuccess() {
        document.getElementById('successOverlay').classList.remove('active');
    }
    function closeSuccessOnOverlay(e) {
        if (e.target.classList.contains('modal-overlay')) closeSuccess();
    }

    const form        = document.querySelector('.logg');
    const fileInputEl = document.getElementById('fileInput');
    const submitBtn   = document.getElementById('submitBtn');
    const agreeBox    = document.getElementById('agree');

    // Запоминаем исходный текст кнопки
    const submitBtnOriginalText = submitBtn.textContent;

    function setLoading(state) {
        if (state) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.textContent = submitBtnOriginalText;
            // возвращаем disabled в зависимости от чекбокса
            submitBtn.disabled = !agreeBox.checked;
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputs  = form.querySelectorAll('input[type="text"]');
        const name    = inputs[0].value.trim();
        const email   = inputs[1].value.trim();
        const phone   = '+7' + document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        let filePayload = null;
        if (fileInputEl.files && fileInputEl.files.length > 0) {
            const f = fileInputEl.files[0];
            const base64 = await fileToBase64(f);
            filePayload = {
                name: f.name,
                type: f.type,
                size: f.size,
                data: base64
            };
        }

        const payload = { name, email, phone, message, file: filePayload };

        // ==== ВКЛЮЧАЕМ ЗАГРУЗКУ ====
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:5000/api/sendieChicks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });


            if (res.status === 200) {
                openSuccess('Спасибо! Мы свяжемся с вами в ближайшее время.');
                form.reset();
                if (typeof handleFileChange === 'function') handleFileChange();
                agreeBox.checked = false;
            } else if (res.status === 429) {
                openSuccess('Система устраняет последствия DDos атаки на сервер. Попробуйте зайти позже', 'Ошибка');
            } else if (res.status === 400) {
                openSuccess('Ваше обращение не может быть отправлено. Возможно оно содержит спец. символы или пустые строки. Попробуйте еще раз', 'Ошибка');
            } else {
                openSuccess(`Что-то пошло не так. Ошибка ${res.status}`, 'Ошибка');
            }
        } catch (err) {
            console.error(err);
            openSuccess('Извините, сервер временно решил отдохнуть. Загляните попозже', 'Ошибка');
            form.reset();
        } finally {
            // ==== ВЫКЛЮЧАЕМ ЗАГРУЗКУ ====
            setLoading(false);
            closeModal();
        }
    });