<div align="center">
  <h1>📸 Kilogram</h1>
  <p><strong>A modern, AI-powered image sharing social network inspired by Instagram.</strong></p>
</div>

---

## 📝 Overview

Kilogram is a robust, full-stack social media platform built using a monolithic core architectural approach that seamlessly integrates with a standalone AI service. It goes beyond standard image sharing by adding a dedicated AI Recommendation engine and real-time communication capabilities. From discovering personalized content via smart feeds to chatting with friends instantly, Kilogram is designed to provide a complete, modern social networking experience.

## ✨ Key Features

- **📸 Core Social Elements**
  - **Multimedia Posts:** Upload and share multiple images seamlessly in carousel format.
  - **Social Engagement:** Like, comment, and follow users to build a network.
- **🧠 AI-Powered "Explore" Feed**
  - A dedicated recommendation service using **Hybrid Algorithms** (Collaborative Filtering + Trending).
  - Delivers hyper-personalized content based on user interaction history and global trends.
- **⚡ Real-Time Interactions**
  - **Private Chat (1-on-1):** Instant, low-latency messaging powered by WebSockets/STOMP.
  - **Live Notifications:** Real-time push alerts for likes, comments, and new followers right to the client interface.
- **🚀 Optimized User Experience**
  - **Infinity Scroll:** Continuous, dynamically loaded data pagination for an uninterrupted browsing experience.
  - **Responsive UI:** A clean, modern aesthetic driven by React and TailwindCSS.

## 🏗️ Technical Stack

Kilogram operates primarily through a robust core backend, enhanced by a specialized AI service to separate complex ML/AI operations from the main business logic.

### ☕ Backend Core
- **Language/Framework:** Java 21, Spring Boot 4.0.3
- **Responsibilities:** Core business logic, RESTful APIs, User Authentication & Security (JWT), and WebSocket/STOMP session management.

### 🤖 AI Service 
- **Language/Framework:** Python, FastAPI
- **Responsibilities:** Intelligent content ranking and feature extraction. Utilizes **APScheduler** for running offline model training pipelines.

### 🎨 Frontend
- **Framework:** React, TypeScript, TailwindCSS
- **Responsibilities:** Delivering a performant, reactive, and beautiful single-page application.

### 🗄️ Infrastructure & Storage
- **Database:** MySQL (Persistent relational data)
- **Caching & Broker:** Redis (Handles caching layers, WebSocket message routing, and fast access points)
- **Local Environment:** Docker Support & `docker-compose.yml` (For spinning up local DB and Redis instances)

## 📁 Repository Structure

```text
kilogram/
├── backend-core/     # Primary Spring Boot backend applications
├── ai-service/       # Python FastAPI application for AI/ML tasks
├── frontend/         # React SPA web interface
└── docker-compose.yml# Container orchestration for infrastructure (DB, Redis, etc.)
```

## 📬 Contact

* **Author:** Vu Quoc Anh
* **Email:** quocanh20705@gmail.com
* **GitHub:** [Quocker20](https://www.google.com/search?q=https://github.com/Quocker20)

---

## 📄 Copyright

*© 2026 Vu Quoc Anh. All Rights Reserved.*