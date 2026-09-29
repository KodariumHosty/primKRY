const newsForm = document.getElementById('newsForm');
const fileInput = document.getElementById('image');
const fileBtnText = document.getElementById('fileBtnText');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImgBtn = document.getElementById('removeImgBtn');
const modalOverlay = document.getElementById('modalOverlay');
let currentBase64 = null;

fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            currentBase64 = reader.result;
            imagePreview.src = currentBase64;
            previewContainer.style.display = 'inline-block';
            fileBtnText.textContent = 'Изменить фотографию';
        };
    }
});

removeImgBtn.addEventListener('click', function() {
    fileInput.value = '';
    currentBase64 = null;
    imagePreview.src = '';
    previewContainer.style.display = 'none';
    fileBtnText.textContent = 'Выбрать фотографию';
});

newsForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const text  = document.getElementById('text').value.trim();
    const token = localStorage.getItem('token');

    if (!title || !text) {
        alert('Заполните заголовок и текст!');
        return;
    }

    try {
        const res = await fetch('http://127.0.0.1:5000/api/addNews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                text: text,
                image: 'NN',
                token: token || ''
            })
        });

        if (res.ok) {
            modalOverlay.classList.add('active');
        } else if(res.status === 400){
            alert('Заполните все поля. Это обязательно!');
        } else if(res.status === 401){
            alert('Вы не авторизованы. Пожалуйста вернитесь на страницу авторизации');
            window.location.href = "loginAdm.html";
        }
    } catch (err) {
        alert('Ошибка соединения с сервером');
    }
});