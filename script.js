const qsPlatform = new URLSearchParams(location.search).get('tgWebAppPlatform') || '';
const getPlatform = () =>
  (window.Telegram?.WebApp?.platform || qsPlatform || 'unknown').toLowerCase();

(function earlyWebTgBlock() {
  const qsPlat  = (new URLSearchParams(location.search).get('tgWebAppPlatform') || '').toLowerCase();
  const refIsWeb = /\/\/web\.telegram\.org\//i.test(document.referrer || '');
  const wa      = window.Telegram && window.Telegram.WebApp;
  const plat    = (wa?.platform || qsPlat || '').toLowerCase();
  const isWeb   = plat === 'weba' || plat === 'webk' || refIsWeb;

  if (!isWeb) return;

  let sealed = false;
  const seal = () => {
    if (sealed) return;
    sealed = true;
    try { document.body.style.overflow = 'hidden'; } catch {}
    try {
      document.documentElement.innerHTML =
        '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;text-align:center;padding:24px;font:16px/1.4 system-ui">Игра недоступна в веб-версии Telegram.</div>';
    } catch {}
  };

  const closeOnce = () => {
    try { wa?.ready?.(); } catch {}
    try { wa?.close?.(); } catch {}

    setTimeout(() => {
      if (sealed) return;
      try { wa?.openTelegramLink?.('https://t.me/rollcam_bot'); } catch {}
      try { window.location.replace('about:blank'); } catch {}
      try { window.stop?.(); } catch {}
      seal();
    }, 150);
  };

  let tries = 0;
  const iv = setInterval(() => {
    if (sealed) return clearInterval(iv);
    if (wa && !window.Telegram?.WebApp) { clearInterval(iv); return seal(); }
    closeOnce();
    if (++tries >= 3) clearInterval(iv);
  }, 200);

  const stop = () => { try { clearInterval(iv); } catch {} seal(); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, { once: true });
  window.addEventListener('pagehide',   stop, { once: true });
  window.addEventListener('beforeunload', stop, { once: true });
})();

const prizes = [
  { label: "Stripchat", image: "assets/images/ui/3.svg" },
  { label: "Joke", image: "assets/images/ui/1.png" },
  { label: "Chaturbate", image: "assets/images/ui/2.svg" },
  { label: "Joke", image: "assets/images/ui/1.png" },
  { label: "WR", image: "assets/images/ui/4.png" },
  { label: "Stripchat", image: "assets/images/ui/3.svg" },
  { label: "Joke", image: "assets/images/ui/1.png" },
  { label: "Chaturbate", image: "assets/images/ui/2.svg" },
  { label: "WR", image: "assets/images/ui/4.png" },
  { label: "Joke", image: "assets/images/ui/1.png" }
];

const canvas = document.getElementById("fortuneWheel");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingQuality = 'high';
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 170;

const loadedImages = {};

let currentRotation = 0;

// --- Глобальный флаг доступности вращения ---
window.canSpin = false;

const spinDuration = 4; // seconds

function loadImages(callback) {
  let loadedCount = 0;
  prizes.forEach((p, i) => {
    const img = new Image();
    img.src = p.image;
    img.onload = () => {
      loadedImages[i] = img;
      loadedCount++;
      if (loadedCount === prizes.length) callback();
    };
    img.onerror = () => {
      loadedImages[i] = null;
      loadedCount++;
      if (loadedCount === prizes.length) callback();
    };
  });
}

function drawWheel() {
  const anglePerSector = (2 * Math.PI) / prizes.length;
  for (let i = 0; i < prizes.length; i++) {
    const startAngle = i * anglePerSector;
    const endAngle = startAngle + anglePerSector;

    // Сектор
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    let gradient;
    if (i % 2 === 0) {
      // Сектор с линейным градиентом: светло-зелёный
      gradient = ctx.createLinearGradient(
        centerX + Math.cos(startAngle) * radius,
        centerY + Math.sin(startAngle) * radius,
        centerX + Math.cos(endAngle) * radius,
        centerY + Math.sin(endAngle) * radius
      );
      gradient.addColorStop(0, "#DAFF9C");
      gradient.addColorStop(1, "#9BF3A0");
    } else {
      // Тёмно-зелёный сектор (без градиента)
      gradient = "#19363D";
    }
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Изображение
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSector / 2);
    
    const img = loadedImages[i];
    if (img) {
        const maxWidth = 100;
        const scale = maxWidth / img.width;
        const finalWidth = img.width * scale;
        const finalHeight = img.height * scale;

        // Увеличение масштаба на 15%
        let zoom = 1.15; // базовое увеличение

        if (prizes[i].label === "Joke") {
          zoom *= 0.5;
        } else if (prizes[i].label === "Stripchat") {
          zoom *= 1;
        } else if (prizes[i].label === "Chaturbate") {
          zoom *= 0.7;
        } else if (prizes[i].label === "WR") {
          zoom *= 0.6;
        }
        ctx.scale(zoom, zoom);
        let offsetX = 0;
        if (prizes[i].label === "Joke") {
          offsetX = radius * 1.3;
        } else if (prizes[i].label === "Stripchat") {
          offsetX = radius * 0.5;
        } else if (prizes[i].label === "Chaturbate") {
          offsetX = radius * 0.8;
        } else if (prizes[i].label === "WR") {
          offsetX = radius * 1.1;
        }
        ctx.translate(offsetX, 0);
        ctx.drawImage(img, -finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);
    } else {
      ctx.fillStyle = "white";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(prizes[i].label, radius - 10, 5);
    }
    ctx.restore();
  }
}

function startSpin() {
  // Проверка, можно ли крутить в данный момент
  if (!window.canSpin) {
    // Показываем окно "нет спинов", если оно скрыто
    const modal = document.getElementById("noSpinsModal");
    const overlay = document.getElementById("modalOverlay");
    if (modal && overlay) {
      modal.style.display = "block";
      overlay.style.display = "block";
    }
    return;
  }
  const spinButton = document.getElementById("spinBtn");
  const spinActionBtn = document.getElementById("spinActionBtn");
  if (spinButton.disabled) return; // предотвратим повторный клик
  spinButton.style.pointerEvents = "none";
  spinButton.disabled = true;
  if(spinActionBtn) spinActionBtn.disabled = true;
  spinButton.classList.add("spin-active");
  const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
  if (!tgUser || !tgUser.id) {
    const resultFrame = document.getElementById("resultText");
    const resultContent = document.getElementById("resultContent");
    resultContent.innerHTML = `
      <p>Пожалуйста, сначала нажмите "start" у бота в Telegram</p>
      <a href="https://t.me/rollcam_bot" target="_blank" style="color: #6C5CFE; font-weight: bold;">Нажмите сюда</a>
    `;
    resultFrame.style.display = "block";
    setTimeout(() => {
      resultFrame.style.display = "none";
    }, 10000);
    return;
  }

  const username = tgUser.username || "unknown";
  const userId = tgUser.id || "unknown";
  // const username = "unknown";
  // const userId = "unknown";

  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      const ip = data.ip;
      // Если OK — тогда крутим
      const anglePerSector = (2 * Math.PI) / prizes.length;

  // 🎯 Теория вероятностей выпадения категорий:
  // 60% — Joke, 10% — Stripchat, 10% — Chaturbate
  // Выбираем категорию с заданной вероятностью
  const rand = Math.random(); // 0..1
  let targetLabel = "";

  if (rand < 0.3) targetLabel = "Joke";          // 0 – 0.3  (30%)
  else if (rand < 0.6) targetLabel = "WR";       // 0.3 – 0.6 (30%)
  else if (rand < 0.8) targetLabel = "Stripchat"; // 0.6 – 0.8 (20%)
  else targetLabel = "Chaturbate";               // 0.8 – 1   (20%)

      // Собираем индексы всех секторов с нужной категорией
      const matchingIndexes = prizes
        .map((p, i) => (p.label === targetLabel ? i : -1))
        .filter(i => i !== -1);

      // Случайно выбираем один из подходящих индексов
      const targetIndex = matchingIndexes[Math.floor(Math.random() * matchingIndexes.length)];

      // Вычисляем нужный угол
      const targetAngle = 1.5 * Math.PI - (targetIndex + 0.5) * anglePerSector;

      // Добавляем обороты + точный угол
      const spinRadians = 2 * Math.PI * 5 + ((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      currentRotation += spinRadians;

      canvas.style.transition = `transform ${spinDuration}s ease-out`;
      canvas.style.transform = `rotate(${(currentRotation * 180) / Math.PI}deg)`;

      document.getElementById("spinBtn").style.transition = `transform ${spinDuration}s linear`;

      setTimeout(() => {
        const anglePerSector = (2 * Math.PI) / prizes.length;
        const pointerAngle = ((Math.PI * 1.5 - currentRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const prizeIndex = Math.floor(pointerAngle / anglePerSector) % prizes.length;
        const prizeLabel = prizes[prizeIndex].label;

        const resultFrame = document.getElementById("resultText");
        const resultContent = document.getElementById("resultContent");

        fetch("fortuna.json")
          .then(res => res.json())
          .then(data => {
            let finalText = "";

            if (prizeLabel === "Joke") {
              const jokes = data.joke;
              finalText = jokes[Math.floor(Math.random() * jokes.length)];
            } else if (prizeLabel === "Stripchat" || prizeLabel === "Chaturbate") {
              const key = prizeLabel.toLowerCase(); // "stripchat", "chaturbate"
              const source = data[key];
              const prizeRand = Math.random();
              const pool = prizeRand < 0.9 ? source.prize : source.superprize;
              const selected = pool[Math.floor(Math.random() * pool.length)];
              finalText = `${prizeLabel}: ${selected}`;
            } else {
              finalText = prizeLabel;
            }

            // Кастомное окно результата с разделением по призу
            let resultHTML = "";
            if (prizeLabel === "Joke") {
              resultHTML = `
                <img id="closeResult" src="assets/images/icons/close.png" alt="Закрыть" style="position: absolute; top: 10px; right: 14px; width: 18px; height: 18px; cursor: pointer;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 18px; font-weight: bold; color: #DAFF9C; margin-bottom: 10px;">Вау! Ваш приз это....</div>
                <img id="giftImg" src="" alt="gift" style="width: 248px; margin: 10px auto; border-radius: 12px;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 10px; font-weight: 400; color: white; margin: 12px 0;">${finalText.toUpperCase()}</div>
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 16px; color: #96D52B; font-weight: bold;">ХАХАШКА</div>
              `;

              // Загружаем случайную картинку для "Joke"
              fetch("images_ha.json")
                .then(res => res.json())
                .then(images => {
                  const randomImage = images[Math.floor(Math.random() * images.length)];
                  // Используем временный контейнер и onload для #giftImg
                  const tempContainer = document.createElement("div");
                  tempContainer.innerHTML = resultHTML;
                  const waitForGiftImg = tempContainer.querySelector('#giftImg');
                  if (waitForGiftImg) {
                    waitForGiftImg.onload = () => {
                      resultContent.innerHTML = tempContainer.innerHTML;
                      const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                      if (closeResultImg) {
                        closeResultImg.style.display = "none";
                      }
                      document.getElementById("resultOverlay").style.display = "block";
                      resultFrame.style.display = "block";
                      resultFrame.style.background = "#1F2C29";
                      resultFrame.style.color = "white";
                      if (closeResultImg) {
                        setTimeout(() => {
                          closeResultImg.style.display = "block";
                        }, 3000);
                        closeResultImg.addEventListener("click", () => {
                          document.getElementById("resultOverlay").style.display = "none";
                          document.getElementById("resultText").style.display = "none";
                          location.reload();
                        });
                      }
                    };
                    waitForGiftImg.src = randomImage;
                  } else {
                    resultContent.innerHTML = tempContainer.innerHTML;
                    document.getElementById("resultOverlay").style.display = "block";
                    resultFrame.style.display = "block";
                    resultFrame.style.background = "#1F2C29";
                    resultFrame.style.color = "white";
                    // Назначаем обработчик закрытия после вставки innerHTML
                    const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                    if (closeResultImg) {
                      closeResultImg.addEventListener("click", () => {
                        document.getElementById("resultOverlay").style.display = "none";
                        document.getElementById("resultText").style.display = "none";
                        location.reload(); // обновить страницу
                      });
                    }
                  }
                })
                .catch(err => {
                  console.error("Ошибка загрузки images_ha.json:", err);
                });
            }

            else if (prizeLabel === "Stripchat") {
              // Определяем pool и isSuperPrize
              const key = prizeLabel.toLowerCase();
              const source = data[key];
              const prizeRand = Math.random();
              const pool = prizeRand < 0.9 ? source.prize : source.superprize;
              const isSuperPrize = pool === source.superprize;
              const prizeTypeText = isSuperPrize ? "★ SUPERPRIZE ★" : "★ PRIZE ★";
              resultHTML = `
                <img id="closeResult" src="assets/images/icons/close.png" alt="Закрыть" style="position: absolute; top: 10px; right: 14px; width: 18px; height: 18px; cursor: pointer;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 18px; font-weight: bold; color: #DAFF9C; margin-bottom: 10px;">Вау! Ваш приз это....</div>
                <img src="assets/images/ui/3.svg" alt="Stripchat" style="width: 120px; transform: scale(1.2); margin: 12px auto; display: block;" />
                <img id="giftImg" src="" alt="gift" style="width: 248px; margin: 10px auto; border-radius: 12px;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 10px; font-weight: 400; color: white; margin: 12px 0;">${finalText.toUpperCase()}</div>
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 16px; font-weight: bold; color: #96D52B; margin-top: 10px;">${prizeTypeText}</div>
                <div style="background: rgba(255,255,255,0.08); padding: 14px; margin-top: 16px; border-radius: 10px;">
                  <div style="font-family: 'Ubuntu', sans-serif; font-size: 15px; font-weight: bold; color: white; margin-bottom: 6px;">Сделайте скриншот приза</div>
                  <div style="font-family: 'Ubuntu', sans-serif; font-size: 12px; color: #ccc;">Для получения приза, сделайте скриншот и отправьте в чат, нажав на кнопку внизу<br>* Призом нужно воспользоваться в течение 7 дней</div>
                </div>
                <button id="prizeBtn" style="width: 100%; background: #96D52B; border: none; padding: 12px; color: #1F2C29; font-weight: bold; border-radius: 8px; margin-top: 12px; cursor: pointer; font-family: 'Ubuntu', sans-serif; font-size: 16px;">Забрать приз</button>
              `;
              fetch("images_pr.json")
                .then(res => res.json())
                .then(images => {
                  const randomImage = images[Math.floor(Math.random() * images.length)];
                  // Используем временный контейнер и onload для #giftImg
                  const tempContainer = document.createElement("div");
                  tempContainer.innerHTML = resultHTML;
                  const waitForGiftImg = tempContainer.querySelector('#giftImg');
                  if (waitForGiftImg) {
                    waitForGiftImg.onload = () => {
                      resultContent.innerHTML = tempContainer.innerHTML;
                      // Скрыть #closeResult сразу после вставки innerHTML
                      const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                      if (closeResultImg) {
                        closeResultImg.style.display = "none";
                      }
                      // --- Добавляем обработчик на кнопку #prizeBtn после вставки innerHTML ---
                      const prizeBtn = document.getElementById("prizeBtn");
                      if (prizeBtn) {
                        prizeBtn.addEventListener("click", openPrizeChat);
                      }
                      // --- Конфетти для Stripchat и Chaturbate ---
                      const confettiCanvas = document.createElement("canvas");
                      confettiCanvas.style.position = "fixed";
                      confettiCanvas.style.top = 0;
                      confettiCanvas.style.left = 0;
                      confettiCanvas.style.width = "100vw";
                      confettiCanvas.style.height = "100vh";
                      confettiCanvas.style.pointerEvents = "none";
                      confettiCanvas.style.zIndex = 99999;
                      document.body.appendChild(confettiCanvas);

                      const script = document.createElement("script");
                      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
                      script.onload = () => {
                        const myConfetti = window.confetti.create(confettiCanvas, { resize: true });
                        myConfetti({
                          particleCount: 200,
                          spread: 100,
                          origin: { y: 0.6 },
                          startVelocity: 30,
                          gravity: 0.8,
                          ticks: 200
                        });

                        setTimeout(() => {
                          confettiCanvas.style.pointerEvents = "none";
                          confettiCanvas.style.display = "none";
                          confettiCanvas.remove();
                        }, 6000);
                      };
                      document.body.appendChild(script);
                      // --- конец конфетти ---
                      document.getElementById("resultOverlay").style.display = "block";
                      resultFrame.style.display = "block";
                      resultFrame.style.background = "#1F2C29";
                      resultFrame.style.color = "white";
                      // Назначаем обработчик закрытия после вставки innerHTML через setTimeout
                      setTimeout(() => {
                        const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                        if (closeResultImg) {
                          closeResultImg.style.display = "block";
                          closeResultImg.addEventListener("click", () => {
                            document.getElementById("resultOverlay").style.display = "none";
                            document.getElementById("resultText").style.display = "none";
                            location.reload(); // обновить страницу
                          });
                        }
                      }, 3000);
                    };
                    waitForGiftImg.src = randomImage;
                  } else {
                    resultContent.innerHTML = tempContainer.innerHTML;
                    document.getElementById("resultOverlay").style.display = "block";
                    resultFrame.style.display = "block";
                    resultFrame.style.background = "#1F2C29";
                    resultFrame.style.color = "white";
                    // Назначаем обработчик закрытия после вставки innerHTML
                    const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                    if (closeResultImg) {
                      closeResultImg.addEventListener("click", () => {
                        document.getElementById("resultOverlay").style.display = "none";
                        document.getElementById("resultText").style.display = "none";
                        location.reload(); // обновить страницу
                      });
                    }
                  }
                })
                .catch(err => {
                  console.error("Ошибка загрузки images_ha.json:", err);
                });
            }

            else if (prizeLabel === "Chaturbate") {
              // Общий блок для определения pool, selected и isSuperPrize
              const key = prizeLabel.toLowerCase(); // "chaturbate"
              const source = data[key];
              const prizeRand = Math.random();
              const pool = prizeRand < 0.9 ? source.prize : source.superprize;
              const selected = pool[Math.floor(Math.random() * pool.length)];
              const isSuperPrize = source.superprize.includes(selected);
              const prizeTypeText = isSuperPrize ? "★ SUPERPRIZE ★" : "★ PRIZE ★";
              finalText = `${prizeLabel}: ${selected}`;
              resultHTML = `
                <img id="closeResult" src="assets/images/icons/close.png" alt="Закрыть" style="position: absolute; top: 10px; right: 14px; width: 18px; height: 18px; cursor: pointer;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 18px; font-weight: bold; color: #DAFF9C; margin-bottom: 10px;">Вау! Ваш приз это....</div>
                <img src="assets/images/ui/2.svg" alt="Chaturbate" style="width: 120px; transform: scale(1.2); margin: 12px auto; display: block;" />
                <img id="giftImg" src="" alt="gift" style="width: 248px; margin: 10px auto; border-radius: 12px;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 10px; font-weight: 400; color: white; margin: 12px 0;">${finalText.toUpperCase()}</div>
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 16px; font-weight: bold; color: #96D52B; margin-top: 10px;">${prizeTypeText}</div>
                <div style="background: rgba(255,255,255,0.08); padding: 14px; margin-top: 16px; border-radius: 10px;">
                  <div style="font-family: 'Ubuntu', sans-serif; font-size: 15px; font-weight: bold; color: white; margin-bottom: 6px;">Сделайте скриншот приза</div>
                  <div style="font-family: 'Ubuntu', sans-serif; font-size: 12px; color: #ccc;">Для получения приза, сделайте скриншот и отправьте менеджеру, нажав на кнопку внизу<br>* Призом нужно воспользоваться в течение 7 дней</div>
                </div>
                <button id="prizeBtn" style="width: 100%; background: #96D52B; border: none; padding: 12px; color: #1F2C29; font-weight: bold; border-radius: 8px; margin-top: 12px; cursor: pointer; font-family: 'Ubuntu', sans-serif; font-size: 16px;">Забрать приз</button>
              `;
              fetch("images_pr.json")
                .then(res => res.json())
                .then(images => {
                  const randomImage = images[Math.floor(Math.random() * images.length)];
                  // Используем временный контейнер и onload для #giftImg
                  const tempContainer = document.createElement("div");
                  tempContainer.innerHTML = resultHTML;
                  const waitForGiftImg = tempContainer.querySelector('#giftImg');
                  if (waitForGiftImg) {
                    waitForGiftImg.onload = () => {
                      resultContent.innerHTML = tempContainer.innerHTML;
                      // Скрыть #closeResult сразу после вставки innerHTML
                      const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                      if (closeResultImg) {
                        closeResultImg.style.display = "none";
                      }
                      // --- Добавляем обработчик на кнопку #prizeBtn после вставки innerHTML ---
                      const prizeBtn = document.getElementById("prizeBtn");
                      if (prizeBtn) {
                        prizeBtn.addEventListener("click", openPrizeChat);
                      }
                      // --- Конфетти для Stripchat и Chaturbate ---
                      const confettiCanvas = document.createElement("canvas");
                      confettiCanvas.style.position = "fixed";
                      confettiCanvas.style.top = 0;
                      confettiCanvas.style.left = 0;
                      confettiCanvas.style.width = "100vw";
                      confettiCanvas.style.height = "100vh";
                      confettiCanvas.style.pointerEvents = "none";
                      confettiCanvas.style.zIndex = 99999;
                      document.body.appendChild(confettiCanvas);

                      const script = document.createElement("script");
                      script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
                      script.onload = () => {
                        const myConfetti = window.confetti.create(confettiCanvas, { resize: true });
                        myConfetti({
                          particleCount: 200,
                          spread: 100,
                          origin: { y: 0.6 },
                          startVelocity: 30,
                          gravity: 0.8,
                          ticks: 200
                        });

                        setTimeout(() => {
                          confettiCanvas.style.pointerEvents = "none";
                          confettiCanvas.style.display = "none";
                          confettiCanvas.remove();
                        }, 6000);
                      };
                      document.body.appendChild(script);
                      // --- конец конфетти ---
                      document.getElementById("resultOverlay").style.display = "block";
                      resultFrame.style.display = "block";
                      resultFrame.style.background = "#1F2C29";
                      resultFrame.style.color = "white";
                      // Новое: показать кнопку закрытия через 3 секунды
                      setTimeout(() => {
                        const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                        if (closeResultImg) {
                          closeResultImg.style.display = "block";
                          closeResultImg.addEventListener("click", () => {
                            document.getElementById("resultOverlay").style.display = "none";
                            document.getElementById("resultText").style.display = "none";
                            location.reload(); // обновить страницу
                          });
                        }
                      }, 3000);
                    };
                    waitForGiftImg.src = randomImage;
                  } else {
                    resultContent.innerHTML = tempContainer.innerHTML;
                    document.getElementById("resultOverlay").style.display = "block";
                    resultFrame.style.display = "block";
                    resultFrame.style.background = "#1F2C29";
                    resultFrame.style.color = "white";
                    // Назначаем обработчик закрытия после вставки innerHTML
                    const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                    if (closeResultImg) {
                      closeResultImg.addEventListener("click", () => {
                        document.getElementById("resultOverlay").style.display = "none";
                        document.getElementById("resultText").style.display = "none";
                        location.reload(); // обновить страницу
                      });
                    }
                  }
                })
                .catch(err => {
                  console.error("Ошибка загрузки images_ha.json:", err);
                });
            }

            else if (prizeLabel === "WR") {
              resultHTML = `
                <img id="closeResult" src="assets/images/icons/close.png" alt="Закрыть" style="position: absolute; top: 10px; right: 14px; width: 18px; height: 18px; cursor: pointer;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 18px; font-weight: bold; color: #DAFF9C; margin-bottom: 10px;">Вау! Ваш приз это....</div>
                <img id="giftImg" src="" alt="gift" style="width: 248px; margin: 10px auto; border-radius: 12px;" />
                <div style="font-family: 'Ubuntu', sans-serif; font-size: 10px; font-weight: 400; color: white; margin: 12px 0;">Бесплатный вывод токенов через обменник</div>              
                <div style="background: rgba(255,255,255,0.08); padding: 14px; margin-top: 16px; border-radius: 10px;">
                  <div style="font-family: 'Ubuntu', sans-serif; font-size: 15px; font-weight: bold; color: white; margin-bottom: 6px;">Сделайте скриншот приза</div>
                  <div style="font-family: 'Ubuntu', sans-serif; font-size: 12px; color: #ccc;">Для получения приза, сделайте скриншот и отправьте в чат, нажав на кнопку внизу<br>* Призом нужно воспользоваться в течение 7 дней</div>
                </div>
                <button id="prizeBtn" style="width: 100%; background: #96D52B; border: none; padding: 12px; color: #1F2C29; font-weight: bold; border-radius: 8px; margin-top: 12px; cursor: pointer; font-family: 'Ubuntu', sans-serif; font-size: 16px;">Забрать приз</button>
              `;
              // Загружаем случайную картинку для "Joke"
              fetch("images_wr.json")
                .then(res => res.json())
                .then(images => {
                  const randomImage = images[Math.floor(Math.random() * images.length)];
                  // Используем временный контейнер и onload для #giftImg
                  const tempContainer = document.createElement("div");
                  tempContainer.innerHTML = resultHTML;
                  const waitForGiftImg = tempContainer.querySelector('#giftImg');
                  if (waitForGiftImg) {
                    waitForGiftImg.onload = () => {
                      resultContent.innerHTML = tempContainer.innerHTML;
                      const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                      if (closeResultImg) {
                        closeResultImg.style.display = "none";
                      }
                      document.getElementById("resultOverlay").style.display = "block";
                      resultFrame.style.display = "block";
                      resultFrame.style.background = "#1F2C29";
                      resultFrame.style.color = "white";
                      if (closeResultImg) {
                        setTimeout(() => {
                          closeResultImg.style.display = "block";
                        }, 3000);
                        closeResultImg.addEventListener("click", () => {
                          document.getElementById("resultOverlay").style.display = "none";
                          document.getElementById("resultText").style.display = "none";
                          location.reload();
                        });
                      }
                    };
                    waitForGiftImg.src = randomImage;
                  } else {
                    resultContent.innerHTML = tempContainer.innerHTML;
                    document.getElementById("resultOverlay").style.display = "block";
                    resultFrame.style.display = "block";
                    resultFrame.style.background = "#1F2C29";
                    resultFrame.style.color = "white";
                    // Назначаем обработчик закрытия после вставки innerHTML
                    const closeResultImg = document.getElementById("resultContent").querySelector('#closeResult');
                    if (closeResultImg) {
                      closeResultImg.addEventListener("click", () => {
                        document.getElementById("resultOverlay").style.display = "none";
                        document.getElementById("resultText").style.display = "none";
                        location.reload(); // обновить страницу
                      });
                    }
                  }
                })
                .catch(err => {
                  console.error("Ошибка загрузки images_ha.json:", err);
                });
            }
            // resultContent.innerHTML = resultHTML;
            // document.getElementById("resultOverlay").style.display = "block";
            // resultFrame.style.display = "block";
            // resultFrame.style.background = "#1F2C29";
            // resultFrame.style.color = "white";

            // Remove any duplicated ✖️ close button if present
            const closeSpan = resultContent.querySelector('.close-btn');
            if (closeSpan) closeSpan.remove();

            // Add event listener for new closeResult image
            const closeResultImg = resultContent.querySelector('#closeResult');
            if (closeResultImg) {
              closeResultImg.addEventListener("click", () => {
                document.getElementById("resultOverlay").style.display = "none";
                resultFrame.style.display = "none";
                location.reload(); // Перезагрузка страницы
              });
            }

            if (window.wasSpinGrantedByFreespin) {
              // Сначала списываем фриспин
              fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                  action: "minusValue",
                  user_id: userId
                })
              })
              .then(res => res.text())
              .then(resultMinus => {
                console.log("❗ Списан фриспин:", resultMinus);

                if (resultMinus.startsWith("Error")) {
                  alert("❌ Ошибка: не удалось списать фриспин");
                  return;
                }
                // Попытки записать приз от друга
                let attempt = 0;
                const maxAttempts = 10;

                function tryAddPrize() {
                  attempt++;
                  console.log(`📤 Попытка #${attempt} записи приза от друга...`);

                  fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                      action: "addValue",
                      username: username,
                      user_id: userId,
                      prize: finalText,
                      ip: ip
                    })
                  })
                  .then(res => res.text())
                  .then(resultAdd => {
                    console.log("✅ Ответ от addValue:", resultAdd);
                    if (!resultAdd || !resultAdd.includes("OK")) {
                      if (attempt < maxAttempts) {
                        setTimeout(tryAddPrize, 500); // повтор через 0.5 сек
                      } else {
                        console.error("❌ Не удалось записать приз от друга после 3 попыток");
                      }
                    }
                  })
                  .catch(err => {
                    console.error("⚠️ Ошибка при fetch на addValue:", err);
                    if (attempt < maxAttempts) {
                      setTimeout(tryAddPrize, 500);
                    }
                  });
                }

                tryAddPrize(); // стартуем первую попытку
              })
              .catch(err => console.error("Ошибка при списании фриспина:", err));
            }
            document.getElementById("spinBtn").style.pointerEvents = "none";

            if (!window.wasSpinGrantedByFreespin) {
              const finalPayload = new URLSearchParams({
                action: "savePrize",
                username: username,
                user_id: userId,
                prize: finalText,
                ip: ip,
              });

              fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
                method: "POST",
                body: finalPayload.toString(),
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              }).catch(err => {
                console.error("❌ Не удалось записать приз:", err);
              });
            }
          });
        spinButton.style.pointerEvents = "auto";
        spinButton.disabled = false;
        if(spinActionBtn) spinActionBtn.disabled = false;
        spinButton.classList.remove("spin-active");
      }, spinDuration * 1000 + 10);
    });
}

document.getElementById("spinBtn").addEventListener("click", startSpin);
function openPrizeChat() {
  const rawText = 'Хочу забрать свой приз. Вот скриншот:';
  const url = `https://t.me/rollcammm?text=${rawText}`;
  if (window.Telegram?.WebApp?.openTelegramLink) {
    try {
      window.Telegram.WebApp.openTelegramLink(url);
      return;
    } catch (err) {
      console.error('openTelegramLink error:', err);
    }
  }
  window.open(url, '_blank');
}

loadImages(drawWheel);

window.addEventListener("DOMContentLoaded", async () => {
  if (window.subscriptionRequired) return;
  const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
  if (!tgUser || !tgUser.id) return;

  const isAvailable = await fetch(`https://your-backend.com/check?id=${tgUser.id}`)
    .then(res => res.json())
    .then(data => data.available)
    .catch(() => false);

  if (isAvailable) {
    document.getElementById("startModal").style.display = "flex";
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (window.subscriptionRequired) return;
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.expand();
  }
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("loader").style.display = "flex";
  const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
  if (!tgUser || !tgUser.id) {
    const resultFrame = document.getElementById("resultText");
    const resultContent = document.getElementById("resultContent");
    resultContent.innerHTML = `
      <p>Пожалуйста, сначала нажмите "start" у бота в Telegram</p>
      <a href="https://t.me/rollcam_bot" target="_blank" style="color: #6C5CFE; font-weight: bold;">Нажмите сюда</a>
    `;
    resultFrame.style.display = "block";
    setTimeout(() => {
      resultFrame.style.display = "none";
    }, 10000);
    return;
  }

  const username = tgUser.username || "unknown";
  const userId = tgUser.id || "unknown";

  // const username = "unknown";
  // const userId = "unknown";

  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      const ip = data.ip;

      let payload = new URLSearchParams({
        action: "savePrize",
        username: username,
        user_id: userId,
        prize: "check",
        ip: ip
      });

      fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
        method: "POST",
        body: payload.toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(res => res.text())
      .then(text => {
        const countdownSpan = document.getElementById("countdownTimer");

        window.canSpin = false;
        window.wasSpinGrantedByFreespin = false;

        if (text.startsWith("Too Soon|")) {
          const millisLeft = parseInt(text.split("|")[1], 10);

          function startCountdown(msLeft) {
            function updateTimer(ms) {
              const totalSeconds = Math.floor(ms / 1000);
              const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
              const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
              const s = String(totalSeconds % 60).padStart(2, '0');
              countdownSpan.textContent = `${h}:${m}:${s}`;
              const modalTimer = document.getElementById("modalCountdownTimer");
              if (modalTimer) modalTimer.textContent = `${h}:${m}:${s}`;
            }

            let remaining = msLeft;
            updateTimer(remaining);
            const timerInterval = setInterval(() => {
              remaining -= 1000;
              if (remaining <= 0) {
                clearInterval(timerInterval);
                countdownSpan.textContent = "00:00:00";
                const modalTimer = document.getElementById("modalCountdownTimer");
                if (modalTimer) modalTimer.textContent = "00:00:00";
              } else {
                updateTimer(remaining);
              }
            }, 1000);
          }

          startCountdown(millisLeft);
        } else {
          document.getElementById("countdownTimer").textContent = "доступен";
          window.canSpin = true;
        }

        fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ action: "getValue", user_id: userId })
        })
        .then(res => res.text())
        .then(result => {
          const num = result.includes("Error") ? 0 : parseInt(result, 10) || 0;
          document.getElementById("friendsCount").textContent = num;

          const loader = document.getElementById("loader");
          const mainContent = document.getElementById("mainContent");

          loader.style.display = "none";
          mainContent.style.display = "block";
          document.getElementById("resultOverlay").style.display = "none";
          // document.getElementById("modalOverlayTimer").style.display = "block";

          const saBtn = document.getElementById("spinActionBtn");

          if (num > 0 || window.canSpin) {
            window.canSpin = true;
            window.wasSpinGrantedByFreespin = num > 0;
            document.getElementById("spinBtn").style.pointerEvents = "auto";
            if (saBtn) saBtn.disabled = false;
          } else {
            // Если спинов нет — блокируем кнопку
            document.getElementById("spinBtn").style.pointerEvents = "none";
            if (saBtn) saBtn.disabled = true;

            // Если уже показывается таймерная модалка — ничего не показываем сейчас
            // const isTimerVisible = getComputedStyle(document.getElementById("modalOverlayTimer")).display !== "none";

            // if (!isTimerVisible) {
            //   // Если таймер не показан — сразу показываем "нет спинов"
            //   document.getElementById("noSpinsModal").style.display = "block";
            //   document.getElementById("modalOverlay").style.display = "block";
            // }
            document.getElementById("noSpinsModal").style.display = "block";
            document.getElementById("modalOverlay").style.display = "block";
            // Иначе — после закрытия modalOverlayTimer мы покажем noSpinsModal (см. ниже)
          }
        })
        .catch(err => {
          console.error("Ошибка при getValue:", err);
        });
      })
      .catch(err => {
        console.error("Ошибка при savePrize:", err);
      });
});
// Обработчик закрытия модального окна "нет спинов"
document.getElementById("closeNoSpins").addEventListener("click", () => {
  document.getElementById("modalOverlay").style.display = "none";
  document.getElementById("noSpinsModal").style.display = "none";
});
// Обработчик закрытия модального окна "разрешён спин"
if (document.getElementById("closeYesSpin")) {
  document.getElementById("closeYesSpin").addEventListener("click", () => {
    document.getElementById("modalOverlay").style.display = "none";
    document.getElementById("yesSpinModal").style.display = "none";
    document.getElementById("modalOverlayStart").style.display = "none";
  });
}
["closeTimerSpins", "closeTimerSpins2"].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener("click", () => {
      // document.getElementById("modalOverlayTimer").style.display = "none";
      // document.getElementById("TimerSpinsModal").style.display = "none";

      // Если всё ещё нельзя крутить — показываем "нет спинов"
      if (!window.canSpin) {
        document.getElementById("noSpinsModal").style.display = "block";
        document.getElementById("modalOverlay").style.display = "block";
      }
    });
  }
});
document.getElementById("startSpinBtn").addEventListener("click", function () {
  document.getElementById("modalOverlayStart").style.display = "none";
});

// Invite button in modalAccessGranted (added below)

if (document.getElementById("inviteBtn")) {
  document.getElementById("inviteBtn").addEventListener("click", copyLink);
}

if (document.getElementById("spinActionBtn")) {
  document.getElementById("spinActionBtn").addEventListener("click", startSpin);
}

function copyLink() {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  // const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || { id: "123456789" };
  if (!tgUser || !tgUser.id) return;

  const link = `https://t.me/rollcam_bot?start=${tgUser.id}`;
  navigator.clipboard.writeText(link).then(() => {
    const toast = document.getElementById("toast");
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 3000);
  });
}

// --- open Telegram share for main invite button ---
document.getElementById("inviteBtnMain").addEventListener("click", function (e) {
  e.preventDefault();
  // const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || { id: "123456789" };
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!tgUser || !tgUser.id) return;
  const link = `https://t.me/rollcam_bot?start=${tgUser.id}`;
  const comment = `Привет! Заходи в колесо-вебкама и получай бесплатное продвижение на Stripchat и Chaturbate, бесплатные лайки Chaturbate и курс от ТОП модели!`;
  const shareLink = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(comment)}`;
  window.Telegram.WebApp.openTelegramLink(shareLink);
});

document.getElementById("inviteBtnModalStart").addEventListener("click", function (e) {
  e.preventDefault();
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!tgUser || !tgUser.id) return;
  const link = `https://t.me/rollcam_bot?start=${tgUser.id}`;
  const comment = `Привет! Заходи в колесо-вебкама и получай бесплатное продвижение на Stripchat и Chaturbate, бесплатные лайки Chaturbate и курс от ТОП модели!`;
  const shareLink = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(comment)}`;
  window.Telegram.WebApp.openTelegramLink(shareLink);
});

// showToast function (if not exists)
function showToast(msg) {
  const toast = document.getElementById("resultText");
  document.getElementById("resultContent").textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 5000);
}

// --- Spin button animation: spinAndPulse ---
// Анимация запускается через добавление/удаление класса .spin-active в обработчике клика выше.
// window.onload = function () {
//   fetch("images_ha.json")
//     .then(res => res.json())
//     .then(images => {
//       if (!Array.isArray(images) || images.length === 0) {
//         console.error("Список картинок пуст или некорректен.");
//         return;
//       }
//
//       const randomImage = images[Math.floor(Math.random() * images.length)];
//       const giftImg = document.getElementById("giftImg");
//       if (giftImg) {
//         giftImg.src = randomImage;
//       } else {
//         console.error("Не найден элемент с id='giftImg'");
//       }
//     })
//     .catch(err => {
//       console.error("Ошибка загрузки images_ha.json:", err);
//     });
// };
(async function () {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  tg.ready();
  try {
    const resp = await fetch('/api/check_subscription/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_data: tg.initData || '' }),
    });
    const data = await resp.json();
    if (!data.is_subscribed) {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('mainContent').style.display = 'none';
      const sb = document.getElementById('subscribeBlock');
      if (sb) sb.style.display = 'flex';
      window.canSpin = false;
      window.subscriptionRequired = true;
    }
  } catch (e) {
    console.error('check_subscription failed', e);
  }
})();

const endTime = new Date("2025-08-14T00:00:00");

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = endTime - now;

    if (distance <= 0) {
      document.getElementById("timerDisplay").textContent = "00:00:00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    const dayWord = getDayWord(days);

    document.getElementById("timerDisplay").textContent =
      `${days} ${dayWord} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  function getDayWord(days) {
    if (days % 100 >= 11 && days % 100 <= 14) return "дней";
    const lastDigit = days % 10;
    if (lastDigit === 1) return "день";
    if (lastDigit >= 2 && lastDigit <= 4) return "дня";
    return "дней";
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
});