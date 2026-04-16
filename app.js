import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// FIREBASE CONFIG: Replace this object with your Firebase project's web app config.
const firebaseConfig = {
    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
      apiKey: "AIzaSyDP5W4Y9NMKiJLTKEWR7WcG8FLTH_OvRNU",
      authDomain: "thovememorial.firebaseapp.com",
      projectId: "thovememorial",
      storageBucket: "thovememorial.firebasestorage.app",
      messagingSenderId: "871173387508",
      appId: "1:871173387508:web:f559812a2b6c7af1165aa1",
      measurementId: "G-YTERE9QC03"
    };



const isFirebaseConfigured = !Object.values(firebaseConfig).some((value) => String(value).includes("REPLACE_WITH"));
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

const COOLDOWN_MS = 25_000;
const MAX_MESSAGES = 25;
const LAST_SUBMIT_KEY = "thove_memorial_last_submit";

// IMAGES: Replace filenames/alt text below with your 23 memorial photos in /images.
const PHOTO_ITEMS = [
  { src: "images/photo-01.jpg", alt: "Memorial photo 1" },
  { src: "images/photo-02.jpg", alt: "Memorial photo 2" },
  { src: "images/photo-03.jpg", alt: "Memorial photo 3" },
  { src: "images/photo-04.jpg", alt: "Memorial photo 4" },
  { src: "images/photo-05.jpg", alt: "Memorial photo 5" },
  { src: "images/photo-06.jpg", alt: "Memorial photo 6" },
  { src: "images/photo-07.jpg", alt: "Memorial photo 7" },
  { src: "images/photo-08.jpg", alt: "Memorial photo 8" },
  { src: "images/photo-09.jpg", alt: "Memorial photo 9" },
  { src: "images/photo-10.jpg", alt: "Memorial photo 10" },
  { src: "images/photo-11.jpg", alt: "Memorial photo 11" },
  { src: "images/photo-12.jpg", alt: "Memorial photo 12" },
  { src: "images/photo-13.jpg", alt: "Memorial photo 13" },
  { src: "images/photo-14.jpg", alt: "Memorial photo 14" },
  { src: "images/photo-15.jpg", alt: "Memorial photo 15" },
  { src: "images/photo-16.jpg", alt: "Memorial photo 16" },
  { src: "images/photo-17.jpg", alt: "Memorial photo 17" },
  { src: "images/photo-18.jpg", alt: "Memorial photo 18" },
  { src: "images/photo-19.jpg", alt: "Memorial photo 19" },
  { src: "images/photo-20.jpg", alt: "Memorial photo 20" },
  { src: "images/photo-21.jpg", alt: "Memorial photo 21" },
  { src: "images/photo-22.jpg", alt: "Memorial photo 22" },
  { src: "images/photo-23.jpg", alt: "Memorial photo 23" }
];

const slidesTrack = document.getElementById("slidesTrack");
const prevButton = document.getElementById("prevSlide");
const nextButton = document.getElementById("nextSlide");
const slideDots = document.getElementById("slideDots");
let slideIndex = 0;
let slides = [];

function buildSlides() {
  slidesTrack.innerHTML = "";

  PHOTO_ITEMS.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = `slide${index === 0 ? " is-active" : ""}`;

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;

    figure.append(image);
    slidesTrack.append(figure);
  });

  slides = [...document.querySelectorAll(".slide")];
}

function renderSlideDots() {
  slideDots.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slide-dot";
    dot.setAttribute("aria-label", `Go to photo ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    slideDots.append(dot);
  });
}

function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;

  slides.forEach((slide, idx) => {
    slide.classList.toggle("is-active", idx === slideIndex);
  });

  [...slideDots.children].forEach((dot, idx) => {
    dot.classList.toggle("is-active", idx === slideIndex);
  });
}

buildSlides();

if (slides.length > 1) {
  prevButton.addEventListener("click", () => showSlide(slideIndex - 1));
  nextButton.addEventListener("click", () => showSlide(slideIndex + 1));
  renderSlideDots();
  showSlide(0);
} else {
  prevButton.hidden = true;
  nextButton.hidden = true;
  slideDots.hidden = true;
}

const form = document.getElementById("guestbookForm");
const feedback = document.getElementById("formFeedback");
const submitButton = document.getElementById("submitMessage");
const messagesEl = document.getElementById("messages");
const guestbookRef = db ? collection(db, "guestbookMessages") : null;

function setFeedback(message, isError = true) {
  feedback.textContent = message;
  feedback.style.color = isError ? "#7f3d2f" : "#4d6c49";
}

function sanitizeInput(input) {
  return input.trim().replace(/\s+/g, " ");
}

function canSubmitNow() {
  const lastSubmitted = Number(localStorage.getItem(LAST_SUBMIT_KEY) || 0);
  const elapsed = Date.now() - lastSubmitted;
  return elapsed >= COOLDOWN_MS;
}

function storeSubmitTimestamp() {
  localStorage.setItem(LAST_SUBMIT_KEY, String(Date.now()));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!guestbookRef) {
    setFeedback("Guestbook is not set up yet. Please configure Firebase first.");
    return;
  }

  const formData = new FormData(form);
  const name = sanitizeInput(String(formData.get("name") || ""));
  const message = sanitizeInput(String(formData.get("message") || ""));
  const visitDate = String(formData.get("visitDate") || "");
  const honeypot = sanitizeInput(String(formData.get("website") || ""));

  if (honeypot) {
    setFeedback("Unable to submit right now. Please try again later.");
    return;
  }

  if (!name || !message) {
    setFeedback("Please enter your name and a message.");
    return;
  }

  if (name.length < 2 || message.length < 8) {
    setFeedback("Please share a slightly longer name/message.");
    return;
  }

  if (!canSubmitNow()) {
    setFeedback("Please wait a moment before posting again.");
    return;
  }

  submitButton.disabled = true;
  setFeedback("Sending your message…", false);

  try {
    await addDoc(guestbookRef, {
      name,
      message,
      visitDate: visitDate || null,
      createdAt: serverTimestamp()
    });

    storeSubmitTimestamp();
    form.reset();
    setFeedback("Thank you for sharing your memory.", false);
  } catch (error) {
    console.error(error);
    setFeedback("Sorry, something went wrong while saving your message.");
  } finally {
    submitButton.disabled = false;
  }
});

function formatMessageDate(data) {
  if (data.visitDate) {
    return new Date(`${data.visitDate}T12:00:00`).toLocaleDateString();
  }

  if (data.createdAt?.toDate) {
    return data.createdAt.toDate().toLocaleDateString();
  }

  return "Date unavailable";
}

function renderMessage(docSnap) {
  const data = docSnap.data();
  const card = document.createElement("article");
  card.className = "message-card";

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = `${data.name} • ${formatMessageDate(data)}`;

  const text = document.createElement("p");
  text.className = "message-text";
  text.textContent = data.message;

  card.append(meta, text);
  return card;
}

if (!guestbookRef) {
  messagesEl.innerHTML =
    "<p class='message-meta'>Guestbook will appear here after Firebase is configured in app.js.</p>";
} else {
  const messagesQuery = query(guestbookRef, orderBy("createdAt", "desc"), limit(MAX_MESSAGES));

  onSnapshot(messagesQuery, (snapshot) => {
    messagesEl.innerHTML = "";

    if (snapshot.empty) {
      messagesEl.innerHTML = "<p class='message-meta'>No messages yet. You can be the first.</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      messagesEl.append(renderMessage(docSnap));
    });
  });
}
