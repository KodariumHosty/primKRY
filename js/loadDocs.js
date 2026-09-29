const IPA = "http://127.0.0.1:5000";
const BABA = 3;

const docsContainer = document.querySelector(".docs");
const loadMoreDocsBtn = document.getElementById("loadMoreDocsBtn");

const renderedDocIds = new Set();
let docsHasMore = true;
let docsLoading = false;

function renderDocCard(item) {
    if (renderedDocIds.has(item.idi)) return false;
    renderedDocIds.add(item.idi);

    const card = document.createElement("div");
    card.dataset.idi = item.idi;

    card.innerHTML = `
        <div class="cardBoxes">
            <div class="cardNews">
                <p class="doc-id">${item.idi}.${item.fileName}</p>
                <div class="botombar">
                    <div class="garey">${item.fileDate}</div>
                    <p class="garey">|</p>
                    <p class="pushed">Опубликовано</p>
                </div>
            </div>
            <button class="download-btn"><img src="imaginazer/dwnLoad.webp" alt=""></button>
            <button class="delete-btn"><img src="imaginazer/trash.webp" alt=""></button>
        </div>
        <hr>
    `;

    card.querySelector(".download-btn").addEventListener("click", () => {
        downloadDoc(item.idi, item.fileName);
    });

    card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteDoc(item.idi, card);
    });

    docsContainer.appendChild(card);
    return true;
}

async function fetchDocsBatch() {
    // Просим с запасом — сервер сам обрежет до 5
    const res = await fetch(`${IPA}/api/getDocuments=999`);
    const docs = await res.json();

    let added = 0;
    docs.forEach(item => {
        if (renderDocCard(item)) added++;
    });

    return { added, received: docs.length };
}

async function loadDocs() {
    if (!docsHasMore || docsLoading) return;

    docsLoading = true;
    loadMoreDocsBtn.disabled = true;

    try {
        let need = BABA;
        let guard = 0;

        while (need > 0 && docsHasMore && guard < 10) {
            guard++;
            const { added, received } = await fetchDocsBatch();

            need -= added;

            // Сервер вернул меньше, чем мы уже показали + BATCH —
            // значит новых больше нет
            if (received <= renderedDocIds.size) {
                docsHasMore = false;
                break;
            }

            // Ничего нового не добавилось — тоже стоп
            if (added === 0) {
                docsHasMore = false;
                break;
            }
        }

        if (!docsHasMore) {
            loadMoreDocsBtn.textContent = "Больше нет";
        }
    } catch (err) {
        console.error("Ошибка загрузки документов:", err);
    } finally {
        docsLoading = false;
        loadMoreDocsBtn.disabled = !docsHasMore;
    }
}

async function downloadDoc(idi, fileName) {
    try {
        const res = await fetch(`${IPA}/downloadFile/${idi}`);
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

async function deleteDoc(idi, cardEl) {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'loginAdm.html';
        return;
    }

    try {
        const res = await fetch(`${IPA}/deleteDocument/${idi}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            cardEl.remove();
            renderedDocIds.delete(idi);
        } else if (res.status === 401) {
            window.location.href = 'loginAdm.html';
        } else {
            alert("Ошибка при удалении документа");
        }
    } catch (err) {
        console.error(err);
        alert("Сервер недоступен");
    }
}

loadDocs();
loadMoreDocsBtn.addEventListener("click", loadDocs);