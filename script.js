document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Player Logic ---
    const playBtn = document.getElementById('play-btn');
    const audio = document.getElementById('bg-music');
    const spools = document.querySelectorAll('.spool');
    let isPlaying = false;

    function toggleAudio() {
        if (isPlaying) {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i> PLAY "KIDS"';
            spools.forEach(spool => spool.classList.remove('playing'));
        } else {
            audio.play().then(() => {
                playBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
                spools.forEach(spool => spool.classList.add('playing'));
                isPlaying = true;
            }).catch(err => {
                console.log("Audio play failed (likely browser policy):", err);
            });
        }
        isPlaying = !audio.paused;
    }

    playBtn.addEventListener('click', toggleAudio);

    // AutoPlay Attempt
    const autoPlayPromise = audio.play();
    if (autoPlayPromise !== undefined) {
        autoPlayPromise.then(() => {
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i> PAUSE';
            spools.forEach(spool => spool.classList.add('playing'));
        }).catch(error => {
            console.log("Autoplay prevented. Waiting for interaction.");
            document.body.addEventListener('click', () => {
                if (!isPlaying) toggleAudio();
            }, { once: true });
        });
    }

    // --- Scroll Animations ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .exp-card, .project-card').forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);

        // 3D Tilt Effect
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
            const rotateY = ((x - centerX) / centerX) * 10;

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- Upside Down Effect ---
    window.activateUpsideDown = function () {
        document.body.style.transform = 'rotate(180deg)';
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';
        setTimeout(() => {
            document.body.style.transform = 'none';
            document.body.style.filter = 'none';
        }, 5000);
    };

    // Konami Code Easter Egg
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateUpsideDown();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // --- Spiders Logic (Custom SVGs) ---
    const spiderCount = 8;
    const spiders = [];
    const spiderAssets = [
        'assets/spider.svg',
        'assets/halloween-pumpkin-head-outline-svgrepo-com.svg',
        'assets/halloween-witch-hat-svgrepo-com.svg',
        'assets/new-halloween-email-with-bat-wings-svgrepo-com.svg',
        'assets/candle-with-burning-flame-hand-drawn-outline-svgrepo-com.svg',
        'assets/halloween-frightening-onomatopeia-svgrepo-com.svg'
    ];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    for (let i = 0; i < spiderCount; i++) {
        const spider = document.createElement('img');
        spider.classList.add('spider');
        // Randomly select an asset
        spider.src = spiderAssets[Math.floor(Math.random() * spiderAssets.length)];
        document.body.appendChild(spider);

        spiders.push({
            el: spider,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            speed: 1 + Math.random() * 2,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        });
    }

    function updateSpiders() {
        spiders.forEach(spider => {
            // Calculate angle to mouse
            const dx = mouseX - spider.x;
            const dy = mouseY - spider.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 300) { // Chase if close
                spider.angle = Math.atan2(dy, dx);
                spider.speed = 3.5; // Run faster
            } else {
                // Random wander
                spider.angle += (Math.random() - 0.5) * 0.2;
                spider.speed = 1.5;
            }

            spider.x += Math.cos(spider.angle) * spider.speed;
            spider.y += Math.sin(spider.angle) * spider.speed;

            // Wrap around screen
            if (spider.x < -50) spider.x = window.innerWidth + 50;
            if (spider.x > window.innerWidth + 50) spider.x = -50;
            if (spider.y < -50) spider.y = window.innerHeight + 50;
            if (spider.y > window.innerHeight + 50) spider.y = -50;

            // Update DOM
            spider.rotationSpeed += (Math.random() - 0.5) * 0.01;
            const rotation = (spider.angle * 180 / Math.PI) + 90 + (spider.rotationSpeed * 100);
            spider.el.style.transform = `translate(${spider.x}px, ${spider.y}px) rotate(${rotation}deg)`;
        });
        requestAnimationFrame(updateSpiders);
    }

    updateSpiders();
});
