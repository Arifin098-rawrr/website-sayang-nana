document.getElementById('btn-buka').addEventListener('click', function () {
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');

    // 1. Putar Musik Otomatis
    if (bgMusic) {
        bgMusic.play().catch(error => {
            console.log("Autoplay diblokir browser, diputar setelah interaksi.");
        });
        if (musicToggle) musicToggle.classList.remove('hidden');
    }

    // 2. Animasi Transisi Premium Menggunakan GSAP
    const tl = gsap.timeline();

    tl.to('.glass-card', {
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: 'power3.inOut'
    })
    .to('#opening-screen', {
        backdropFilter: 'blur(30px)',
        backgroundSize: '120%',
        opacity: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
            // ✅ Setelah animasi selesai, langsung ke halaman galeri
            window.location.href = 'gallery.html';
        }
    }, '-=0.5');
});