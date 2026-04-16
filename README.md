# Thove Memorial Website

A simple, respectful memorial site built with plain HTML, CSS, and JavaScript, designed for Firebase Hosting + Firestore guestbook storage.

## Project structure

```text
.
├── .firebaserc
├── app.js
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── images/
│   └── README.md
├── index.html
├── styles.css
└── README.md
```

## What is included

- Hero section (name, dates, quote)
- Simple 23-photo slideshow with previous/next buttons and dot indicators
- Memorial text section
- Guestbook form (name + message + optional date)
- Guestbook messages stored and read from Firestore
- Basic spam protection:
  - Honeypot field
  - Client-side cooldown between submissions
  - Length validation

## Local setup

1. Clone the repository and enter it.
2. Add your photos in `images/` using the names `photo-01.jpg` through `photo-23.jpg` (or update `PHOTO_ITEMS` in `app.js`).
3. Open `app.js` and replace the Firebase config object with your own project values.
4. (Optional) Start a static server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Firebase setup (Hosting + Firestore)

### 1) Create Firebase project

1. Go to Firebase Console.
2. Create a new project.
3. In **Project settings > General**, add a **Web app**.
4. Copy the web config and paste it into `app.js`.

### 2) Enable Firestore

1. Go to **Firestore Database** in Firebase Console.
2. Click **Create database**.
3. Start in production mode (recommended).
4. Choose a Firestore region.

### 3) Configure local project files

1. Replace project id in `.firebaserc`:
   - `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`
2. Keep `firestore.rules` and `firestore.indexes.json` in repo root.

### 4) Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 5) Deploy Firestore rules/indexes + Hosting

From repo root:

```bash
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

When successful, CLI prints your Hosting URL.

## Editing guide

- `index.html`
  - Update hero text, dates, quote, memorial paragraphs.
- `app.js`
  - Update slideshow image paths + alt text in `PHOTO_ITEMS` (currently 23 photo slots).
  - Update Firebase config.
  - Adjust guestbook limits (`COOLDOWN_MS`, `MAX_MESSAGES`).
- `styles.css`
  - Adjust colors, spacing, typography for desired tone.

## Notes

- This is intentionally lightweight and framework-free.
- Firestore rules currently allow public create/read with schema + length checks.
- For stronger anti-spam, consider adding Firebase App Check and/or Cloud Functions moderation later.
