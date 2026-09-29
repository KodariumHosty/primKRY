const API = "http://127.0.0.1:5000";
const BATCH = 3;

const container = document.querySelector(".news");
const loadMoreBtn = document.getElementById("loadMoreBtn");

const renderedIds = new Set();
let hasMore = true;
let loading = false;

function renderCard(item) {
    if (renderedIds.has(item.idi)) return false;
    renderedIds.add(item.idi);

    const card = document.createElement("div");
    card.dataset.idi = item.idi;

    card.innerHTML = `
        <div class="cardBoxes">
            <div class="cardNews">
                <p class="dataContent">${item.idi}.${item.ahead}</p>
                <div class="botombar">
                    <div class="garey">${item.date} ${item.time}</div>
                    <p class="garey">|</p>
                    <p class="pushed">Опубликовано</p>
                </div>
            </div>
            <button class="delete-btn"><img src="imaginazer/trash.webp" alt=""></button>
        </div>
        <hr>
    `;

    card.querySelector(".delete-btn").addEventListener("click", () => {
        deleteNews(item.idi, card);
    });

    container.appendChild(card);
    return true;
}

// Один запрос: просим у сервера count = уже показано + BATCH
// Возвращает количество реально добавленных новых карточек
async function fetchBatch() {
    const count = renderedIds.size + BATCH;
    const res = await fetch(`${API}/api/getNews=${count}`);
    const news = await res.json();

    let added = 0;
    news.forEach(item => {
        if (renderCard(item)) added++;
    });

    return { added, received: news.length, requested: count };
}

async function loadNews() {
    if (!hasMore || loading) return;

    loading = true;
    loadMoreBtn.disabled = true;

    try {
        let need = BATCH;      // сколько новых карточек нам ещё нужно
        let guard = 0;         // защита от бесконечного цикла

        // Догружаем, пока не наберём BATCH новых или не упрёмся в конец
        while (need > 0 && hasMore && guard < 10) {
            guard++;
            const { added, received, requested } = await fetchBatch();

            need -= added;

            // Если сервер отдал меньше, чем мы просили — значит БД кончилась
            if (received < requested) {
                hasMore = false;
                break;
            }

            // Если сервер отдал полный набор, но все — дубли,
            // а мы так и не получили ничего нового за итерацию — стоп
            if (added === 0) {
                hasMore = false;
                break;
            }
        }

        if (!hasMore) {
            loadMoreBtn.textContent = "Больше нет";
        }
    } catch (err) {
        console.error("Ошибка загрузки новостей:", err);
    } finally {
        loading = false;
        loadMoreBtn.disabled = !hasMore;
    }
}

async function deleteNews(idi, cardEl) {
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'loginAdm.html';
        return;
    }

    try {
        const res = await fetch(`${API}/deleteNews/${idi}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            cardEl.remove();
            renderedIds.delete(idi);
        } else if (res.status === 401) {
            window.location.href = 'loginAdm.html';
        } else {
            alert("Ошибка при удалении новости");
        }
    } catch (err) {
        console.error(err);
        alert("Сервер недоступен");
    }
}

loadNews();
loadMoreBtn.addEventListener("click", loadNews);