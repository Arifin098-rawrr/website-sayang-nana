document.addEventListener('DOMContentLoaded', () => {
    const masonryItems  = document.querySelectorAll('#hidden-masonry-data .masonry-item');
    const lightbox      = document.getElementById('premium-lightbox');
    const closeBtn      = document.querySelector('.lightbox-close');
    const swiperWrapper = document.getElementById('lightbox-swiper-wrapper');
    const infoTitle     = document.getElementById('lightbox-title');
    const infoDate      = document.getElementById('lightbox-date');
    const infoLocation  = document.getElementById('lightbox-location');

    let lightboxSwiper = null;

    // 1. Inisialisasi Swiper Slider Popup
    function initSwiper() {
        lightboxSwiper = new Swiper('.lightbox-swiper', {
            loop: false,
            speed: 450,
            spaceBetween: 40,
            grabCursor: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            keyboard: { enabled: true },
            on: {
                slideChange: function () { updateInfoPanel(this.activeIndex); }
            }
        });
    }

    // 2. Update panel deskripsi teks saat slide digeser
    function updateInfoPanel(index) {
        const item = masonryItems[index];
        if (!item) return;
    
        // Tampilkan hanya judul
        infoTitle.textContent = item.getAttribute('data-caption');
    
        // Sembunyikan tanggal dan lokasi
        infoDate.style.display = 'none';
        infoLocation.style.display = 'none';
    }

    // 3. Memasukkan foto asli yang sama ke dalam slider popup ukuran penuh
    function buildLightboxSlides() {
        swiperWrapper.innerHTML = '';
        
        const photoSources = [
            'images/foto1.jpg',
            'images/foto2.jpg',
            'images/foto3.jpg',
            'images/foto4.jpg',
            'images/foto5.jpg',
            'images/foto6.jpg'
        ];

        masonryItems.forEach((item, index) => {
            const imgSrc = photoSources[index % photoSources.length];
            const slideContent = `<img src="${imgSrc}" alt="Kenangan Indah">`;
            swiperWrapper.insertAdjacentHTML('beforeend', `<div class="swiper-slide">${slideContent}</div>`);
        });
    }

    // 4. Integrasi trigger klik item tersembunyi
    masonryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            buildLightboxSlides();

            if (!lightboxSwiper) {
                initSwiper();
            } else {
                lightboxSwiper.update();
            }

            lightbox.classList.remove('hidden');
            lightboxSwiper.slideTo(index, 0, false);
            updateInfoPanel(index);
            document.body.style.overflow = 'hidden';
        });
    });

    // 5. Fungsi Penutup Lightbox
    function closeLightbox() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // 6. Logika Handler Form — Kirim Otomatis ke Email via Formspree
    const memoryForm = document.getElementById('memory-form');
    const submitBtn  = memoryForm ? memoryForm.querySelector('.btn-submit') : null;

    if (memoryForm) {
        memoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name    = document.getElementById('sender-name').value.trim();
            const message = document.getElementById('sender-message').value.trim();

            if (!name || !message) return;

            // ============================================================
            // CARA SETUP FORMSPREE (gratis, 50 pesan/bulan):
            // 1. Daftar di https://formspree.io
            // 2. Klik "+ New Form" → masukkan email kamu
            // 3. Salin endpoint URL yang diberikan
            // 4. Ganti URL di bawah ini dengan endpoint milikmu
            //    Contoh: 'https://formspree.io/f/abcdefgh'
            // ============================================================
            const FORMSPREE_ENDPOINT = 'https://formspree.io/f/maqgjeon';

            // Tampilkan loading di tombol
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Mengirim...</span> <i class="fas fa-spinner fa-spin"></i>`;

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name,
                        message: message,
                        _subject: `💌 Pesan Kenangan dari ${name}`
                    })
                });

                if (response.ok) {
                    showNotification('success', `Pesan dari ${name} berhasil terkirim! 💖`);
                    memoryForm.reset();
                } else {
                    showNotification('error', 'Gagal mengirim pesan. Coba lagi ya! 😢');
                }
            } catch (err) {
                console.error(err);
                showNotification('error', 'Koneksi bermasalah. Cek internetmu! 😢');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Kirim Pesan</span> <i class="fas fa-paper-plane"></i>`;
            }
        });
    }

    // 7. Fungsi notifikasi toast cantik (pengganti alert biasa)
    function showNotification(type, text) {
        const old = document.getElementById('notif-toast');
        if (old) old.remove();

        const toast = document.createElement('div');
        toast.id = 'notif-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: ${type === 'success'
                ? 'linear-gradient(135deg,#c44569,#f5576c)'
                : 'linear-gradient(135deg,#555,#333)'};
            color: #fff;
            padding: 14px 28px;
            border-radius: 50px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 15px;
            font-weight: 500;
            box-shadow: 0 8px 30px rgba(196,69,105,0.4);
            z-index: 99999;
            opacity: 0;
            transition: all 0.4s ease;
            white-space: nowrap;
        `;
        toast.textContent = text;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }
});