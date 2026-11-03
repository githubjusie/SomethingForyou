// CHANGE THESE ANSWERS BEFORE SHARING YOUR WEBSITE.
const correctPin = "3971";
const correctSnack = "San Marino";
const correctIdol = "Bernila";

const questions = [
  {
    text: "Unsay password sa akong phone?",
    type: "pin"
  },
  {
    text: "What's my favorite snack?",
    type: "choice",
    options: ["Winston", "San Marino", "Burger", "Hotdog"],
    answer: correctSnack
  },
  {
    text: "Kinsa akong idol?",
    type: "choice",
    options: ["Bernila", "Ashtine", "Primo", "Tasha"],
    answer: correctIdol
  }
];

const WRONG_MESSAGE = "Enkkkk, di jud diay ko nimo love? 😭";

let currentQuestion = 0;
let enteredPin = "";
let selectedAnswer = "";
let answerLocked = false;

// GET HTML ELEMENTS
const card = document.getElementById("card");
const landing = document.getElementById("landing"); // NEW: the welcome page
const stepsNav = document.getElementById("steps");  // NEW: page indicator
const quiz = document.getElementById("quiz");
const welcome = document.getElementById("welcome");
const scrapbook = document.getElementById("scrapbook");
const jacket = document.getElementById("jacket");
const finale = document.getElementById("finale");

const questionText = document.getElementById("questionText");
const questionNumber = document.getElementById("questionNumber");
const progress = document.getElementById("progress");

const pinScreen = document.getElementById("pinScreen");
const pinDotsBox = document.getElementById("pinDots");
const choices = document.getElementById("choices");
const nextButton = document.getElementById("nextButton");
const message = document.getElementById("message");

const pinDots = document.querySelectorAll(".pin-dot");
const stepDots = document.querySelectorAll(".step");

/* ---------- SMALL HELPERS ---------- */

function restartAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // force reflow so the animation can replay
  element.classList.add(className);
  setTimeout(() => element.classList.remove(className), 600);
}

/* ---------- SECTION NAVIGATION ---------- */

// CHANGED: added "landing" (the new welcome page, no step highlighted)
const stepOf = { landing: 0, quiz: 1, welcome: 1, scrapbook: 2, jacket: 3, intentions: 4, finale: 5 };

// CHANGED: the website now starts on the welcome page instead of the quiz
let currentSection = landing;
let transitioning = false;

function setStep(number) {
  stepDots.forEach((dot) => {
    const step = Number(dot.dataset.step);
    dot.classList.toggle("active", step === number);
    dot.classList.toggle("done", step < number);
  });
}

function goTo(id) {
  const next = document.getElementById(id);

  if (transitioning || !next || next === currentSection) {
    return;
  }

  transitioning = true;
  currentSection.classList.add("section-leave");

  setTimeout(() => {
    currentSection.classList.add("hidden");
    currentSection.classList.remove("section-leave");

    next.classList.remove("hidden");
    next.classList.add("section-enter");
    currentSection = next;

    setStep(stepOf[id]);

    // NEW: the page indicator stays hidden on the welcome page only
    stepsNav.classList.toggle("steps-hidden", id === "landing");

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (id === "finale") {
      resetNoButton();
    }

    setTimeout(() => {
      next.classList.remove("section-enter");
      transitioning = false;
    }, 650);
  }, 350);
}

/* ---------- NEW — SECTION 0: WELCOME PAGE ---------- */

// "Let's Begin ♡" fades the welcome page out and the authentication in
document.getElementById("beginButton").addEventListener("click", () => {
  goTo("quiz");
});

/* ---------- SECTION 1: QUIZ ---------- */

function showQuestion() {
  const question = questions[currentQuestion];

  questionText.textContent = question.text;
  questionNumber.textContent = `QUESTION 0${currentQuestion + 1} OF 03`;
  progress.style.width = `${(currentQuestion / 3) * 100}%`;

  message.textContent = "";
  selectedAnswer = "";
  answerLocked = false;
  nextButton.disabled = true;
  choices.innerHTML = "";
  pinDotsBox.classList.remove("ok");

  pinScreen.classList.toggle("hidden", question.type !== "pin");
  choices.classList.toggle("hidden", question.type !== "choice");

  if (question.type === "choice") {
    question.options.forEach((option) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "choice";
      button.textContent = option;

      button.addEventListener("click", () => {
        if (answerLocked) {
          return;
        }

        selectedAnswer = option;

        choices.querySelectorAll(".choice").forEach((item) => {
          item.classList.remove("selected");
        });

        button.classList.add("selected");
        nextButton.disabled = false;
        message.textContent = "";
      });

      choices.appendChild(button);
    });
  }
}

function updatePinDots() {
  pinDots.forEach((dot, index) => {
    dot.classList.toggle("filled", index < enteredPin.length);
  });
}

function checkPin() {
  if (enteredPin.length !== 4) {
    message.textContent = "Enter all four numbers first. ♡";
    return;
  }

  if (enteredPin === correctPin) {
    nextButton.disabled = false;
    pinDotsBox.classList.add("ok");
    message.textContent = "Correct! Tap the button to continue. ♡";
  } else {
    message.textContent = WRONG_MESSAGE;
    restartAnimation(pinDotsBox, "shake");
    enteredPin = "";
    updatePinDots();
  }
}

// PHONE KEYPAD
document.getElementById("keypad").addEventListener("click", (event) => {
  const keyButton = event.target.closest("[data-key]");

  if (!keyButton || answerLocked) {
    return;
  }

  const key = keyButton.dataset.key;

  if (key === "clear") {
    enteredPin = enteredPin.slice(0, -1);
    message.textContent = "";
    nextButton.disabled = true;
    pinDotsBox.classList.remove("ok");
  } else if (key === "enter") {
    checkPin();
    return;
  } else if (enteredPin.length < 4) {
    enteredPin += key;
    message.textContent = "";
    nextButton.disabled = true;
    pinDotsBox.classList.remove("ok");
  }

  updatePinDots();
});

// CHECK ANSWER AND MOVE ON
nextButton.addEventListener("click", () => {
  if (answerLocked) {
    return;
  }

  const question = questions[currentQuestion];
  let isCorrect = false;

  if (question.type === "pin") {
    isCorrect = enteredPin === correctPin;
  } else {
    isCorrect =
      selectedAnswer.toLowerCase() === question.answer.toLowerCase();
  }

  if (!isCorrect) {
    message.textContent = WRONG_MESSAGE;
    restartAnimation(card, "shake");
    return;
  }

  answerLocked = true;
  nextButton.disabled = true;

  if (question.type === "choice") {
    const picked = choices.querySelector(".choice.selected");

    if (picked) {
      picked.classList.add("correct");
    }
  }

  message.textContent = "Correct! ♡";
  progress.style.width = `${((currentQuestion + 1) / 3) * 100}%`;

  setTimeout(() => {
    currentQuestion++;

    if (currentQuestion < questions.length) {
      enteredPin = "";
      updatePinDots();
      showQuestion();
    } else {
      goTo("welcome");
    }
  }, 650);
});

/* ---------- SECTION 2: SCRAPBOOK + MODAL ---------- */

const memoryModal = document.getElementById("memoryModal");
const closeMemory = document.getElementById("closeMemory");
const expandedMedia = document.getElementById("expandedMedia");
const expandedTitle = document.getElementById("expandedTitle");
const expandedText = document.getElementById("expandedText");
const memoryMessage = document.getElementById("memoryMessage");

let lastFocused = null;

function openMemory(mediaNode, title, text) {
  lastFocused = document.activeElement;

  // pause the video in the scrapbook so two videos never play together
  const gridVideo = document.querySelector(".memory-video");
  if (gridVideo) {
    gridVideo.pause();
  }

  expandedMedia.innerHTML = "";
  expandedMedia.appendChild(mediaNode);
  expandedTitle.textContent = title;
  expandedText.textContent = text;

  memoryModal.classList.remove("closing");
  memoryModal.classList.remove("hidden");
  closeMemory.focus();
}

function closeMemoryModal() {
  if (memoryModal.classList.contains("hidden") ||
      memoryModal.classList.contains("closing")) {
    return;
  }

  memoryModal.classList.add("closing");

  setTimeout(() => {
    memoryModal.classList.add("hidden");
    memoryModal.classList.remove("closing");

    // removing the media also stops any playing video
    const video = expandedMedia.querySelector("video");
    if (video) {
      video.pause();
    }
    expandedMedia.innerHTML = "";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }, 280);
}

function openFromCard(cardElement) {
  const video = cardElement.querySelector("video");
  const image = cardElement.querySelector("img");
  let node;

  if (video) {
    const source = video.querySelector("source");
    node = document.createElement("video");
    node.controls = true;
    node.autoplay = false;
    node.setAttribute("playsinline", "");
    node.preload = "metadata";
    node.src = source ? source.getAttribute("src") : video.getAttribute("src");
  } else {
    node = document.createElement("img");
    node.src = image.getAttribute("src");
    node.alt = image.alt || "Our memory";
  }

  const caption = cardElement.querySelector(".photo-caption");
  const title = caption ? caption.textContent.trim() : "A special memory";

  openMemory(node, title, cardElement.dataset.note);

  memoryMessage.textContent = cardElement.dataset.note;

  document.querySelectorAll(".memory-card").forEach((item) => {
    item.classList.remove("memory-selected");
  });
  cardElement.classList.add("memory-selected");
}

document.querySelectorAll(".memory-card").forEach((cardElement) => {
  cardElement.addEventListener("click", (event) => {
    // do not interrupt the video controls
    if (event.target.closest("video")) {
      return;
    }
    openFromCard(cardElement);
  });

  cardElement.addEventListener("keydown", (event) => {
    if (event.target !== cardElement) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFromCard(cardElement);
    }
  });
});

closeMemory.addEventListener("click", closeMemoryModal);

memoryModal.addEventListener("click", (event) => {
  if (event.target === memoryModal) {
    closeMemoryModal();
  }
});

document.getElementById("surpriseButton").addEventListener("click", () => {
  goTo("scrapbook");
});

document.getElementById("nextStoryButton").addEventListener("click", () => {
  goTo("jacket");
});

/* ---------- SECTION 3: JACKET MEMORY ---------- */

const jacketPhoto = document.getElementById("jacketPhoto");
const jacketFrame = document.getElementById("jacketFrame");

// If the jacket photo file does not exist yet, show the placeholder instead.
function checkJacketPhoto() {
  const missing = !jacketPhoto.complete || jacketPhoto.naturalWidth === 0;
  jacketFrame.classList.toggle("no-photo", missing && jacketPhoto.complete);
}

jacketPhoto.addEventListener("error", () => {
  jacketFrame.classList.add("no-photo");
});

jacketPhoto.addEventListener("load", () => {
  jacketFrame.classList.remove("no-photo");
});

checkJacketPhoto();

// Tapping the jacket photo opens the popup with the photo + the jacket message
// (the message text is read from the hidden <p id="jacketMessage"> in index.html)
document.getElementById("jacketPolaroid").addEventListener("click", () => {
  let node;

  if (jacketFrame.classList.contains("no-photo")) {
    node = jacketFrame.querySelector(".jacket-placeholder").cloneNode(true);
  } else {
    node = document.createElement("img");
    node.src = jacketPhoto.getAttribute("src");
    node.alt = jacketPhoto.alt;
  }

  openMemory(
    node,
    "The Jacket Memory",
    document.getElementById("jacketMessage").textContent
  );
});

// the jacket section leads to "intentions"
document.getElementById("jacketNextButton").addEventListener("click", () => {
  goTo("intentions");
});

document.getElementById("jacketBackButton").addEventListener("click", () => {
  goTo("scrapbook");
});

/* ---------- SECTION 4: MY INTENTIONS ---------- */

const intentPhoto = document.getElementById("intentPhoto");
const intentFrame = document.getElementById("intentFrame");

// If the photo file does not exist yet, show the placeholder instead.
intentPhoto.addEventListener("error", () => {
  intentFrame.classList.add("no-photo");
});

intentPhoto.addEventListener("load", () => {
  intentFrame.classList.remove("no-photo");
});

if (intentPhoto.complete && intentPhoto.naturalWidth === 0) {
  intentFrame.classList.add("no-photo");
}

document.getElementById("intentNextButton").addEventListener("click", () => {
  goTo("finale");
});

document.getElementById("intentBackButton").addEventListener("click", () => {
  goTo("jacket");
});

/* ---------- SECTION 5: THE FINAL QUESTION ---------- */

const answerStage = document.getElementById("answerStage");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const dodgeNote = document.getElementById("dodgeNote");
const finalQuestion = document.getElementById("finalQuestion");
const finalSub = document.getElementById("finalSub");

const dodgePhrases = [
  "Hala, nilayo! 🙈",
  "Hehe, wala ka ma-click! ♡",
  "Naa pa'y chance, pili ug lain~",
  "Shy man ning button ba 🥺",
  "Nahadlok siya nimo, HAHA",
  "Try YES instead? 👀",
  "Wa gyud ka maka-click! ✨",
  "Ok na, i-click na ang YES ♡"
];

let dodgeCount = 0;
let lastDodge = 0;
let answeredYes = false;

function rectsOverlap(a, b, pad) {
  return !(
    a.right + pad < b.left ||
    a.left - pad > b.right ||
    a.bottom + pad < b.top ||
    a.top - pad > b.bottom
  );
}

function resetNoButton() {
  if (answeredYes) {
    return;
  }

  const stage = answerStage.getBoundingClientRect();
  const no = noButton.getBoundingClientRect();
  const yes = yesButton.getBoundingClientRect();

  const maxX = Math.max(0, stage.width - no.width - 6);
  const maxY = Math.max(0, stage.height - no.height - 6);

  let x = stage.width / 2 + yes.width / 2 + 16;
  let y = (stage.height - no.height) / 2;

  // not enough space on the right: put it below YES instead
  if (x > maxX) {
    x = (stage.width - no.width) / 2;
    y = maxY;
  }

  noButton.style.left = `${Math.min(x, maxX)}px`;
  noButton.style.top = `${Math.min(y, maxY)}px`;
}

function dodgeNo() {
  if (answeredYes) {
    return;
  }

  const now = Date.now();
  if (now - lastDodge < 160) {
    return;
  }
  lastDodge = now;

  const stage = answerStage.getBoundingClientRect();
  const no = noButton.getBoundingClientRect();
  const yes = yesButton.getBoundingClientRect();

  const maxX = Math.max(0, stage.width - no.width - 6);
  const maxY = Math.max(0, stage.height - no.height - 6);

  const currentX = no.left - stage.left;
  const currentY = no.top - stage.top;

  let x = 0;
  let y = 0;
  let tries = 0;
  let ok = false;

  while (!ok && tries < 25) {
    x = 6 + Math.random() * Math.max(0, maxX - 6);
    y = 6 + Math.random() * Math.max(0, maxY - 6);

    const candidate = {
      left: stage.left + x,
      right: stage.left + x + no.width,
      top: stage.top + y,
      bottom: stage.top + y + no.height
    };

    const farEnough = Math.hypot(x - currentX, y - currentY) > 90;
    ok = farEnough && !rectsOverlap(candidate, yes, 14);
    tries++;
  }

  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;

  dodgeNote.textContent = dodgePhrases[dodgeCount % dodgePhrases.length];
  dodgeCount++;

  // YES slowly grows to say "pick me"
  yesButton.style.setProperty("--grow", String(1 + Math.min(dodgeCount, 8) * 0.04));
}

noButton.addEventListener("pointerenter", dodgeNo);
noButton.addEventListener("pointerdown", dodgeNo);
noButton.addEventListener("focus", dodgeNo);
noButton.addEventListener("click", (event) => {
  event.preventDefault();
  dodgeNo();
});

window.addEventListener("resize", () => {
  if (currentSection === finale) {
    resetNoButton();
  }
});

/* YES POPUP + CONFETTI */

const yesModal = document.getElementById("yesModal");
const confettiLayer = document.getElementById("confettiLayer");
const closeYes = document.getElementById("closeYes");
const yesDone = document.getElementById("yesDone");

const confettiColors = ["#d6b46a", "#f6f0dc", "#9bb392", "#55784f", "#d99aa0", "#e8d28f"];
let confettiTimer = null;

function launchCelebration() {
  confettiLayer.innerHTML = "";

  const total = window.innerWidth < 600 ? 45 : 80;

  for (let i = 0; i < total; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[i % confettiColors.length];
    piece.style.borderRadius = i % 3 === 0 ? "50%" : "2px";
    piece.style.animationDuration = `${2.6 + Math.random() * 2.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.9}s`;
    piece.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
    piece.style.setProperty("--rot", `${360 + Math.random() * 720}deg`);

    confettiLayer.appendChild(piece);
  }

  for (let i = 0; i < 18; i++) {
    const heart = document.createElement("span");

    heart.className = "float-heart";
    heart.textContent = i % 2 ? "♡" : "♥";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.color = i % 2 ? "#f6f0dc" : "#d99aa0";
    heart.style.fontSize = `${16 + Math.random() * 26}px`;
    heart.style.animationDuration = `${3.5 + Math.random() * 3}s`;
    heart.style.animationDelay = `${Math.random() * 1.6}s`;

    confettiLayer.appendChild(heart);
  }

  clearTimeout(confettiTimer);
  confettiTimer = setTimeout(() => {
    confettiLayer.innerHTML = "";
  }, 8000);
}

function openYes() {
  lastFocused = document.activeElement;
  answeredYes = true;

  yesModal.classList.remove("closing");
  yesModal.classList.remove("hidden");
  launchCelebration();
  yesDone.focus();
}

function closeYesModal() {
  if (yesModal.classList.contains("hidden") ||
      yesModal.classList.contains("closing")) {
    return;
  }

  yesModal.classList.add("closing");

  setTimeout(() => {
    yesModal.classList.add("hidden");
    yesModal.classList.remove("closing");
    clearTimeout(confettiTimer);
    confettiLayer.innerHTML = "";

    // after YES: the NO button is gone and the page stays calm
    noButton.classList.add("hidden");
    finalQuestion.textContent = "You said yes. ♡";
    finalSub.textContent = "Tap YES anytime to see the confetti again.";
    dodgeNote.textContent = "";
    yesButton.textContent = "YES! ♡";

    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus({ preventScroll: true });
    }
  }, 280);
}

yesButton.addEventListener("click", openYes);
closeYes.addEventListener("click", closeYesModal);
yesDone.addEventListener("click", closeYesModal);

yesModal.addEventListener("click", (event) => {
  if (event.target === yesModal) {
    closeYesModal();
  }
});

// ESC closes whichever popup is open
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  if (!yesModal.classList.contains("hidden")) {
    closeYesModal();
  } else if (!memoryModal.classList.contains("hidden")) {
    closeMemoryModal();
  }
});

/* ---------- LOCK SCREEN CLOCK ---------- */

function updateLockScreen() {
  const now = new Date();

  document.getElementById("lockTime").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  document.getElementById("lockDate").textContent =
    now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit"
    }).toUpperCase();
}

updateLockScreen();
setInterval(updateLockScreen, 30000);

/* ---------- BACKGROUND MUSIC ---------- */
// The music file itself is set in index.html (the <audio id="bgMusic"> tag).
// Browsers block autoplay, so the music starts after her first tap/click/key press
// (now that is the "Let's Begin" button on the welcome page).
// If she pauses it with the music button, it stays paused.

const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let musicOn = false;          // is the music supposed to be playing?
let musicDucked = false;      // temporarily paused while a video plays
let musicChoiceMade = false;  // she used the music button herself

bgMusic.volume = 0.5;

function setMusicUI(on) {
  musicOn = on;
  musicToggle.classList.toggle("playing", on);
  musicToggle.setAttribute("aria-pressed", String(on));
  musicToggle.setAttribute(
    "aria-label",
    on ? "Pause background music" : "Play background music"
  );
  musicToggle.title = on ? "Pause music" : "Play music";
}

function playMusic() {
  const attempt = bgMusic.play();

  if (attempt && typeof attempt.then === "function") {
    attempt
      .then(() => setMusicUI(true))
      .catch((error) => {
        setMusicUI(false);

        if (error && error.name === "NotSupportedError") {
          // music file missing or unsupported: hide the button
          musicToggle.classList.add("hidden");
        } else if (error && error.name === "NotAllowedError" && !musicChoiceMade) {
          // browser still wants a real interaction: try again on the next one
          armFirstInteraction();
        }
      });
  } else {
    setMusicUI(true);
  }
}

// Start the music after the first interaction (never forced before that)
function startMusicOnFirstInteraction(event) {
  if (event.target.closest && event.target.closest("#musicToggle")) {
    return;
  }

  document.removeEventListener("click", startMusicOnFirstInteraction);
  document.removeEventListener("keydown", startMusicOnFirstInteraction);

  if (!musicChoiceMade && !musicOn) {
    playMusic();
  }
}

function armFirstInteraction() {
  document.addEventListener("click", startMusicOnFirstInteraction);
  document.addEventListener("keydown", startMusicOnFirstInteraction);
}

armFirstInteraction();

// The play / pause button
musicToggle.addEventListener("click", () => {
  musicChoiceMade = true;

  if (musicOn) {
    bgMusic.pause();
    musicDucked = false;
    setMusicUI(false);
  } else {
    playMusic();
  }
});

// If the music file cannot be loaded (still the placeholder name), hide the button
bgMusic.addEventListener("error", () => {
  setMusicUI(false);
  musicToggle.classList.add("hidden");
});

// Pause the music while a video plays, then bring it back afterwards
document.addEventListener("play", (event) => {
  const video = event.target;

  if (!(video instanceof HTMLVideoElement)) {
    return;
  }

  if (musicOn && !bgMusic.paused) {
    bgMusic.pause();
    musicDucked = true;
  }

  const resumeMusic = () => {
    video.removeEventListener("pause", resumeMusic);
    video.removeEventListener("ended", resumeMusic);

    if (musicDucked && musicOn) {
      bgMusic.play().catch(() => {});
    }

    musicDucked = false;
  };

  video.addEventListener("pause", resumeMusic);
  video.addEventListener("ended", resumeMusic);
}, true);

/* ---------- ANIMATED BACKGROUND (leaves, hearts, glowing dots) ---------- */

(function startBackground() {
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width = 0;
  let height = 0;
  let particles = [];
  let frame = null;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);

    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function createParticle(startAnywhere) {
    const roll = Math.random();
    const type = roll < 0.45 ? "leaf" : roll < 0.7 ? "heart" : "dot";

    return {
      type,
      x: Math.random() * width,
      y: startAnywhere ? Math.random() * height : (type === "leaf" ? -20 : height + 20),
      size: type === "dot" ? 1.5 + Math.random() * 3 : 7 + Math.random() * 9,
      speed: 0.25 + Math.random() * 0.55,
      sway: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      alpha: 0.18 + Math.random() * 0.35
    };
  }

  function setup() {
    const count = width < 600 ? 22 : 42;
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(true));
    }
  }

  function drawLeaf(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "#7da174";
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.85, 0, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.85, 0, 0, -p.size);
    ctx.fill();
    ctx.strokeStyle = "rgba(14, 26, 19, 0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(0, p.size);
    ctx.stroke();
    ctx.restore();
  }

  function drawHeart(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.sin(p.phase) * 0.3);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = "#d99aa0";
    ctx.font = `${p.size * 1.6}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♥", 0, 0);
    ctx.restore();
  }

  function drawDot(p) {
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
    const pulse = 0.6 + Math.sin(p.phase) * 0.4;

    glow.addColorStop(0, `rgba(240, 214, 140, ${p.alpha * pulse + 0.15})`);
    glow.addColorStop(1, "rgba(240, 214, 140, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      if (p.type === "leaf") {
        drawLeaf(p);
      } else if (p.type === "heart") {
        drawHeart(p);
      } else {
        drawDot(p);
      }
    });
  }

  function update() {
    particles.forEach((p, index) => {
      p.phase += 0.015;
      p.x += Math.sin(p.phase) * p.sway * 0.5;
      p.rotation += p.spin;

      // leaves fall, hearts and glowing dots drift upward
      p.y += p.type === "leaf" ? p.speed : -p.speed;

      const gone = p.y > height + 30 || p.y < -30 || p.x < -40 || p.x > width + 40;

      if (gone) {
        particles[index] = createParticle(false);
      }
    });
  }

  function loop() {
    update();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (!frame && !reduceMotion) {
      frame = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  resize();
  setup();
  draw();
  start();

  window.addEventListener("resize", () => {
    resize();
    setup();
    draw();
  });

  // pause when the tab is hidden to save battery
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });
})();

/* ---------- NEW: FLOATING GLOWING HEART PARTICLES ---------- */
// Small soft-green / muted-white hearts that drift upward and sway.
// They are plain elements animated with CSS (smooth and light on phones),
// and the layer has pointer-events: none so it never blocks a tap or click.

(function startHeartParticles() {
  const field = document.getElementById("heartField");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!field || reduceMotion) {
    return;
  }

  // fewer hearts on phones to keep things light
  const count = window.innerWidth < 600 ? 10 : 18;

  // soft matcha greens and a muted white
  const colors = [
    [155, 179, 146],
    [201, 216, 193],
    [246, 240, 220],
    [125, 161, 116]
  ];

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    const size = 8 + Math.random() * 14;                 // different sizes
    const duration = 16 + Math.random() * 18;            // different speeds
    const [r, g, b] = colors[i % colors.length];

    heart.className = "glow-heart";
    heart.textContent = "♥";

    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${size.toFixed(1)}px`;
    heart.style.color = `rgb(${r}, ${g}, ${b})`;
    heart.style.textShadow =
      `0 0 ${Math.round(size * 0.6)}px rgba(${r}, ${g}, ${b}, 0.85), ` +
      `0 0 ${Math.round(size * 1.4)}px rgba(${r}, ${g}, ${b}, 0.45)`;

    // different opacity levels (kept subtle)
    heart.style.setProperty("--o", (0.22 + Math.random() * 0.33).toFixed(2));
    heart.style.setProperty("--sway", `${Math.round((Math.random() - 0.5) * 80)}px`);
    heart.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 60)}px`);

    heart.style.animationDuration = `${duration.toFixed(1)}s`;
    // negative delay: hearts are already spread across the screen when the page opens
    heart.style.animationDelay = `-${(Math.random() * duration).toFixed(1)}s`;

    fragment.appendChild(heart);
  }

  field.appendChild(fragment);
})();

// START THE WEBSITE
showQuestion();
