window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');

    // Animasi keluar yang halus untuk loading screen
    gsap.to(loader, {
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        onComplete: () => {
            loader.style.display = 'none';
            // Inisialisasi animasi AOS setelah loading selesai
            AOS.init({
                duration: 1000,
                once: true
            });
        }
    });
});