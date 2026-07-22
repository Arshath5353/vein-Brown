# 🏋️ Vein Brown

> **AI-Powered Fitness Coaching, Nutrition Planning & Personal Health Tracker**

Vein Brown is a modern **AI-powered fitness web application** that helps users track workouts, nutrition, body measurements, hydration, and daily fitness progress. It combines intelligent coaching with offline-first storage to provide a fast, secure, and personalized fitness experience.

---

## ✨ Features

### 🤖 AI Fitness Coach (Google Gemini)

- Personalized fitness coaching
- Workout recommendations
- Nutrition advice
- Recovery suggestions
- Daily motivational messages
- AI Diet Planner
- Interactive AI Chat Assistant
- Context-aware responses based on user fitness history

---

### 📊 Dashboard

- Personalized welcome message
- Daily progress overview
- Weekly statistics
- Weight trends
- Step trends
- Water intake
- BMI
- AI Suggestions
- Beautiful analytics charts

---

### 💪 Workout Tracking

- Exercise library
- Workout logging
- Rest timer
- Workout history
- Workout duration
- Calories burned
- Personal progress tracking

---

### 🍽️ Nutrition Tracking

Track daily nutrition including:

- Calories
- Protein
- Carbohydrates
- Fat
- Water intake

Meal categories:

- Breakfast
- Lunch
- Dinner
- Snacks
- Unlimited Custom Meals

---

### 📈 Statistics

Generate detailed reports:

- Daily
- Weekly
- Monthly
- Yearly

Track:

- Calories
- Protein
- Water
- Weight
- BMI
- Workout consistency
- Step count
- Progress trends

---

### 📅 Calendar

Daily fitness calendar showing:

- Meals
- Workouts
- Weight logs
- Water logs
- Steps
- Notes

---

### 👤 User Profile

Manage:

- Name
- Age
- Gender
- Height
- Weight
- Fitness Goal
- Activity Level
- Food Preference
- Medical Conditions
- Profile Picture

---

### 📱 Mobile First

Designed primarily for mobile devices.

- Responsive UI
- Touch-friendly
- Fast loading
- Smooth animations
- Progressive Web App ready

---

## 🚀 Tech Stack

### Frontend

- React 18
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Framer Motion
- Recharts
- Lucide React
- React Hot Toast

### Backend & Services

- Firebase Authentication
- Firebase Firestore
- Firebase Storage
- Google Gemini API

### Local Storage

- IndexedDB
- Compressed local storage
- Offline-first architecture

---

# 📂 Project Structure

```text
src/
│
├── components/
│   ├── ai/
│   ├── dashboard/
│   ├── exercises/
│   ├── layout/
│   └── ui/
│
├── constants/
├── context/
├── firebase/
├── hooks/
├── pages/
├── routes/
├── services/
├── utils/
│
├── App.jsx
├── main.jsx
└── index.css
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/vein-brown.git

cd vein-brown
```

Install dependencies

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root.

```env
# Firebase

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Gemini

VITE_GEMINI_API_KEY=
```

You can obtain:

- Firebase configuration from **Firebase Console → Project Settings → Your Apps**
- Gemini API key from **Google AI Studio**

---

# 🔥 Firebase Setup

Enable the following services:

### Authentication

Enable:

- Email/Password
- Google Sign-In

---

### Firestore

Create a Firestore database.

---

### Storage

Create a Storage bucket.

---

### Security Rules

Deploy rules

```bash
firebase login

firebase deploy --only firestore:rules
```

---

# ▶️ Run Development Server

```bash
npm run dev
```

Application runs at

```
http://localhost:5173
```

---

# 📦 Production Build

```bash
npm run build
```

The production files will be generated inside

```
dist/
```

---

# ☁️ Deployment

## Render

1. Push the project to GitHub.
2. Create a **Static Site** on Render.
3. Connect your repository.
4. Build command:

```bash
npm run build
```

5. Publish directory

```
dist
```

6. Add all environment variables from `.env` in Render.

---

## Netlify

Build command

```bash
npm run build
```

Publish directory

```
dist
```

Add the same environment variables from `.env`.

---

# 🗂️ Data Storage

Each authenticated user has a private local fitness database.

The application stores:

- Meals
- Water intake
- Weight
- BMI
- Workouts
- Steps
- Notes
- Statistics
- AI history

Data is:

- Stored locally
- Compressed
- Offline-first
- Linked to the Firebase User UID

No personal fitness history is shared between users.

---

# 📊 Analytics

The Statistics page provides:

- Daily Reports
- Weekly Reports
- Monthly Reports
- Yearly Reports

Including:

- Weight trends
- Workout trends
- Calories
- Protein
- Water
- Steps
- BMI
- Goal completion
- Consistency Score

---

# 🤖 AI Features

Powered by Google Gemini.

Includes:

- AI Coach
- AI Diet Planner
- AI Chat
- Meal Suggestions
- Workout Suggestions
- Recovery Advice
- Daily Motivation
- Personalized Recommendations

---

# 🔒 Security

- Firebase Authentication
- Protected Routes
- User-specific local storage
- Environment variables for API keys
- Firestore security rules

---

# 🎯 Future Roadmap

- Apple Health Integration
- Google Fit Integration
- Wear OS Support
- Android App
- iOS App
- Barcode Food Scanner
- QR Workout Sharing
- Social Challenges
- Push Notifications
- AI Voice Coach
- Offline PWA Installation
- Cloud Backup & Sync
- Multi-device Synchronization

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Developer

**Vein Brown**

An AI-powered fitness ecosystem built to help users achieve their health goals through intelligent coaching, offline-first tracking, and beautiful analytics.

---

## ⭐ If you like this project

Please consider giving it a **Star ⭐** on GitHub.

It helps support future development and improvements.