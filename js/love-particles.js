const canvas = document.getElementById('love-canvas');
const ctx = canvas.getContext('2d');

let smallParticles = [];
let photoHearts = [];

// ===================================================
// DAFTAR FILE FOTO UNTUK LOVE MELAYANG
// ===================================================
const photoSources = [
    'images/foto1.jpg',
    'images/foto2.jpg',
    'images/foto3.jpg',
    'images/foto4.jpg',
    'images/foto5.jpg',
    'images/foto6.jpg'
];

const loadedImages = [];
photoSources.forEach((src) => {
    const img = new Image();
    img.src = src;
    loadedImages.push(img);
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===================================================
// PATH BENTUK HATI — lebih simetris & proporsional
// ===================================================
function drawHeartPath(context, cx, cy, size) {
    // cx, cy = titik puncak tengah atas hati
    // size = setengah lebar hati (radius)
    context.beginPath();
    context.moveTo(cx, cy + size * 0.35);
    context.bezierCurveTo(
        cx,             cy - size * 0.1,
        cx - size,      cy - size * 0.1,
        cx - size,      cy + size * 0.4
    );
    context.bezierCurveTo(
        cx - size,      cy + size * 1.1,
        cx,             cy + size * 1.5,
        cx,             cy + size * 1.9
    );
    context.bezierCurveTo(
        cx,             cy + size * 1.5,
        cx + size,      cy + size * 1.1,
        cx + size,      cy + size * 0.4
    );
    context.bezierCurveTo(
        cx + size,      cy - size * 0.1,
        cx,             cy - size * 0.1,
        cx,             cy + size * 0.35
    );
    context.closePath();
}

// ===================================================
// 1. KELAS PARTIKEL LOVE KECIL (BACKGROUND)
// ===================================================
class SmallHeart {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 40;
        this.size = Math.random() * 6 + 3;
        this.speedY = Math.random() * 1.0 + 0.3;
        this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.4;
        this.opacity = Math.random() * 0.35 + 0.1;
        const colors = ['#ff6b9d', '#c44569', '#fbc2eb', '#f5576c', '#ffd1dc', '#ff8fab'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -20) this.reset();
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        drawHeartPath(ctx, this.x, this.y, this.size);
        ctx.fill();
        ctx.restore();
    }
}

// ===================================================
// 2. KELAS FOTO BERBENTUK LOVE
//    - Face-aware: crop dari 1/4 atas foto agar wajah terlihat
//    - Glow yang lebih halus & cantik
// ===================================================
class PhotoHeart {
    constructor(index) {
        this.index = index;

        // Ukuran hati yang responsif
        this.size = Math.min(window.innerWidth * 0.20, 110);
        if (this.size < 80) this.size = 80;

        this.pulsePhase = Math.random() * Math.PI * 2;
        this.reset();
        // Sebar posisi awal agar tidak semua muncul dari bawah sekaligus
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * (canvas.width - this.size * 2) + this.size;
        this.y = canvas.height + Math.random() * 300 + 50;
        this.speedY = Math.random() * 0.45 + 0.18;
        this.wobbleSpeed = Math.random() * 0.018 + 0.006;
        this.wobbleCount = Math.random() * 100;
        this.opacity = 0; // fade-in dari bawah
    }

    update() {
        this.y -= this.speedY;
        this.wobbleCount += this.wobbleSpeed;
        this.x += Math.sin(this.wobbleCount) * 0.4;
        this.pulsePhase += 0.025;

        // Fade in saat muncul dari bawah
        const fadeZone = canvas.height * 0.08;
        if (this.y > canvas.height - fadeZone) {
            this.opacity = Math.max(0, 1 - (this.y - (canvas.height - fadeZone)) / fadeZone);
        } else {
            this.opacity = 1;
        }

        if (this.y < -this.size * 2.5) {
            this.reset();
        }
    }

    draw() {
        const img = loadedImages[this.index];
        if (!img) return;

        const pulse = 1 + Math.sin(this.pulsePhase) * 0.025; // efek napas halus
        const s = this.size * pulse;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        // ---- Outer glow: ring cahaya di luar hati ----
        ctx.save();
        ctx.globalAlpha = this.opacity * 0.3;
        ctx.shadowColor = '#ff6b9d';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(255, 107, 157, 0.15)';
        drawHeartPath(ctx, this.x, this.y, s * 1.08);
        ctx.fill();
        ctx.restore();

        // ---- Clip ke bentuk hati ----
        ctx.save();
        drawHeartPath(ctx, this.x, this.y, s);
        ctx.clip();

        if (img.complete && img.naturalWidth !== 0) {
            // Bounding box hati: lebar = 2s, tinggi ≈ 1.9s
            const drawW = s * 2;
            const drawH = s * 1.9;
            const drawX = this.x - s;
            const drawY = this.y;          // titik puncak atas hati

            const iW = img.naturalWidth;
            const iH = img.naturalHeight;
            const targetRatio = drawW / drawH;
            const imgRatio = iW / iH;

            let srcX, srcY, srcW, srcH;

            if (imgRatio > targetRatio) {
                // Gambar terlalu lebar → potong sisi kiri-kanan
                srcH = iH;
                srcW = iH * targetRatio;
                srcX = (iW - srcW) / 2;
                srcY = 0;
            } else {
                // Gambar terlalu tinggi → ambil dari atas (wajah biasanya di atas)
                // Offset 15% dari atas agar mahkota kepala tidak terpotong
                srcW = iW;
                srcH = iW / targetRatio;
                srcX = 0;
                // Face-aware: ambil dari 10% atas, bukan tengah
                const faceOffset = iH * 0.10;
                srcY = Math.min(faceOffset, iH - srcH);
                if (srcY < 0) srcY = 0;
            }

            ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);
        } else {
            // Fallback warna jika gambar belum load
            ctx.fillStyle = '#c44569';
            drawHeartPath(ctx, this.x, this.y, s);
            ctx.fill();
        }

        ctx.restore(); // lepas clip

        // ---- Inner glow: gradien di dalam tepi hati agar foto menyatu ----
        ctx.save();
        drawHeartPath(ctx, this.x, this.y, s);
        ctx.clip();

        // Highlight putih halus di bagian atas hati
        const hlGrad = ctx.createRadialGradient(
            this.x, this.y + s * 0.3, s * 0.05,
            this.x, this.y + s * 0.3, s * 0.9
        );
        hlGrad.addColorStop(0, 'rgba(255,255,255,0.12)');
        hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = hlGrad;
        ctx.fillRect(this.x - s, this.y, s * 2, s * 1.9);

        // Vignette merah muda di tepi
        const vgGrad = ctx.createRadialGradient(
            this.x, this.y + s * 0.95, s * 0.4,
            this.x, this.y + s * 0.95, s * 1.1
        );
        vgGrad.addColorStop(0, 'rgba(196,69,105,0)');
        vgGrad.addColorStop(1, 'rgba(196,69,105,0.35)');
        ctx.fillStyle = vgGrad;
        ctx.fillRect(this.x - s, this.y, s * 2, s * 1.9);

        ctx.restore();

        ctx.restore(); // lepas globalAlpha
    }

    isClicked(mouseX, mouseY) {
        // Deteksi klik sederhana dalam bounding box hati
        return (
            mouseX >= this.x - this.size &&
            mouseX <= this.x + this.size &&
            mouseY >= this.y &&
            mouseY <= this.y + this.size * 1.9
        );
    }
}

// ===================================================
// INISIALISASI & LOOP ANIMASI
// ===================================================
function initEngine() {
    smallParticles = [];
    photoHearts = [];

    for (let i = 0; i < 55; i++) {
        smallParticles.push(new SmallHeart());
    }

    for (let i = 0; i < photoSources.length; i++) {
        photoHearts.push(new PhotoHeart(i));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    smallParticles.forEach(p => { p.update(); p.draw(); });
    photoHearts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
}

// Deteksi klik pada foto love
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    photoHearts.forEach(p => {
        if (p.isClicked(mouseX, mouseY)) {
            const targetItem = document.querySelector(`#hidden-masonry-data .masonry-item[data-index="${p.index}"]`);
            if (targetItem) targetItem.click();
        }
    });
});

// Re-init saat resize agar ukuran hati menyesuaikan layar baru
window.addEventListener('resize', () => {
    photoHearts.forEach(p => {
        p.size = Math.min(window.innerWidth * 0.20, 110);
        if (p.size < 80) p.size = 80;
    });
});

initEngine();
animate();