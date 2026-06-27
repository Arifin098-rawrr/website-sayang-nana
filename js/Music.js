// =============================================
//  MUSIC MANAGER
//  - Auto play saat halaman dibuka
//  - Loop/berulang jika habis
//  - Lanjut dari posisi yang sama antar halaman
// =============================================

const bgMusic     = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

if (bgMusic) {

    // ── Pastikan loop aktif ──
    bgMusic.loop = true;

    // ── Ambil posisi & status dari halaman sebelumnya ──
    const savedTime  = parseFloat(localStorage.getItem('music-time') || '0');
    const wasPaused  = localStorage.getItem('music-playing') === 'false';

    // Set posisi lanjutan
    bgMusic.currentTime = savedTime;

    // ── Auto play langsung ──
    if (!wasPaused) {
        bgMusic.play().then(() => {
            // Musik berhasil diputar, tampilkan tombol
            if (musicToggle) {
                musicToggle.classList.remove('hidden');
                musicToggle.classList.remove('paused');
            }
        }).catch(() => {
            // Browser blokir autoplay sebelum interaksi user
            // Tunggu klik pertama di halaman lalu langsung play
            document.addEventListener('click', function playOnce() {
                bgMusic.play();
                if (musicToggle) {
                    musicToggle.classList.remove('hidden');
                    musicToggle.classList.remove('paused');
                }
                document.removeEventListener('click', playOnce);
            }, { once: true });
        });
    } else {
        // Sebelumnya di-pause user, tetap pause
        if (musicToggle) {
            musicToggle.classList.remove('hidden');
            musicToggle.classList.add('paused');
        }
    }

    // ── Simpan posisi setiap detik ──
    setInterval(() => {
        if (!bgMusic.paused) {
            localStorage.setItem('music-time', bgMusic.currentTime);
        }
    }, 1000);

    // ── Simpan posisi & status tepat saat pindah halaman ──
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('music-time', bgMusic.currentTime);
        localStorage.setItem('music-playing', bgMusic.paused ? 'false' : 'true');
    });
}

// ── Toggle play/pause via tombol ──
if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.remove('paused');
            localStorage.setItem('music-playing', 'true');
        } else {
            bgMusic.pause();
            musicToggle.classList.add('paused');
            localStorage.setItem('music-playing', 'false');
        }
    });
}