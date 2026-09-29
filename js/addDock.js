const API = "http://127.0.0.1:5000";

async function loadDocs() {
const container = document.querySelector(".docs");
container.innerHTML = "";

try {
    // Запрашиваем 15 документов
    const res = await fetch(`${API}/api/getDocuments=15`);
    const docs = await res.json();

    docs.forEach(item => {
        const card = document.createElement("div");

        const aidi = item.idi;
        const name = item.fileName;
        const dateeFile = item.fileDate;
        const notilus = item.note;

        const namanama = item.fileName;
        const extension = namanama.split('.').pop().toLowerCase();

        let imagURL = '';

        // Проверяем расширение
        if (['doc', 'docx', 'docm', 'dot', 'dotx'].includes(extension)) {
            imagURL = 'imaginazer/wrd.webp';
        } else if (['xls', 'xlsx', 'xlsm', 'xlsb', 'csv'].includes(extension)) {
            imagURL = 'imaginazer/exc.webp';
        } else if (['txt', 'text'].includes(extension)) {
            imagURL = 'imaginazer/txt.webp';
        } else if (['ppt', 'pptx', 'pps', 'ppsx', 'pot', 'potx'].includes(extension)) {
            imagURL = 'imaginazer/powerpoint.webp';
        } else {
            imagURL = 'imaginazer/NNDock.webp';
        }

        card.innerHTML = `
            <div class="cardDocs">
                <div class="flexerDoc">
                    <img src="${imagURL}" alt="" class="imaga">
                    <div class="contentCardDocs">
                        <p class="datei">${dateeFile}</p>
                        <h2 class="zaglav">${name}</h2>
                        <p class="nootes">${notilus}</p>
                    </div>
                </div>
                <button class="download-btn">Скачать</button>
            </div>
        `;

        card.querySelector(".download-btn").addEventListener("click", () => {
            downloadDoc(aidi, name);
        });

        container.appendChild(card);
    });
} catch (err) {
    console.error("Ошибка загрузки документов:", err);
}}

async function downloadDoc(idi, fileName) {
    try {
        const res = await fetch(`${API}/downloadFile/${idi}`);
        if (!res.ok) {
            alert("Не удалось получить файл");
            return;
        }

        const data = await res.json();
        const fileData = data.fileData;

        if (!fileData || fileData === 'NN') {
            alert("Файл отсутствует");
            return;
        }

        const a = document.createElement('a');
        a.href = fileData;
        a.download = data.fileName || fileName || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (err) {
        console.error(err);
        alert("Сервер недоступен");
    }
}

loadDocs();