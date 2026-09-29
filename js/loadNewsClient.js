const API = "http://127.0.0.1:5000";

async function loadNews() {
    const container = document.querySelector(".news");
    container.innerHTML = "";

    try {
        const res = await fetch(`${API}/api/getNews=4`);
        const news = await res.json();

        function truncateWords(str, maxWords = 20) {
            if (!str) return '';
            const words = str.trim().split(/\s+/);
            if (words.length <= maxWords) return str;
            return words.slice(0, maxWords).join(' ') + '...';
        }

        news.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("cardNews");

    const aidi = item.idi;
    const datete = item.date;
    const timeme = item.time;
    const heading = item.ahead;
    const cont = truncateWords(item.textContent);

    // Уникальный ключ, под которым положим новость
    const storageKey = `news_${aidi}`;

    card.innerHTML = `
        <div class="imagin">
            ${item.content && item.content !== 'NN'
            ? `<div class="imgWrap"><img src="${item.content}" alt="Новость"></div>`
            : ''}
        </div>

        <div class="textContent">
            <p class="datata">${datete} • ${timeme}</p>
            <h2 class="Aheading">${heading}</h2>
            <p class="contentishe">${cont}</p>
        </div>
        <a href="mrBuilder.html?id=${encodeURIComponent(aidi)}" class="readNext" data-id="${aidi}">
            Читать подробнее →
        </a>
    `;

    // Сохраняем ПОЛНЫЙ объект (с полным текстом и картинкой) в sessionStorage
    try {
        sessionStorage.setItem(storageKey, JSON.stringify({
            idi: item.idi,
            date: item.date,
            time: item.time,
            ahead: item.ahead,
            textContent: item.textContent, // полный текст, не обрезанный
            content: item.content
        }));
    } catch (e) {
        console.warn("Не удалось сохранить новость в sessionStorage:", e);
    }

    container.appendChild(card);
});

    } catch (err) {
        // allNewsHeader, zagolovok, tuda
        document.querySelectorAll('.allNewsHeader').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.zagolovok').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.tuda').forEach(el => {
            el.style.display = 'none';
        });
        container.innerHTML = "";

        const card = document.createElement("div");
        card.classList.add("oops");

        card.innerHTML = `
            <img src="imaginazer/oops.webp" alt="" class="oppana">

            <div class="textAndBTNContents">
                <h2>Похоже, сервер ушел на технический перерыв</h2>
                <p>Disite устраняют эту проблему! Скоро всё снова будет работать. Приносим извинения за неудобства.</p>
            </div>
        `;

        // Вставляем ОШИБКУ в блок новостей, а не в конец body!
        container.appendChild(card);


    }
}
loadNews();