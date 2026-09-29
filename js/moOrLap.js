document.addEventListener('DOMContentLoaded', function () {
    const banner = document.getElementById('bannerImg');

    // Проверка на мобильное устройство
    const isMobile = /Android|iPhone|iPod|Opera Mini|IEMobile|WPDesktop|BlackBerry|Mobile/i.test(navigator.userAgent);

    // Опционально: учесть и ширину экрана (узкие окна = мобильный вид)
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

    if (isMobile || isSmallScreen) {
        banner.src = 'imaginazer/bannerPhone.webp'; // картинка №1 для телефона
    } else {
        banner.src = 'imaginazer/banner.webp';        // картинка №2 для ПК/планшета
    }
});
