# 🏥 Online Health Shopping Portal with AI Recommendations

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Spring%20Boot-blueviolet)

A next-generation e-commerce platform dedicated to health and wellness. This project utilizes an **AI-driven User-Based Expert System** to provide personalized product recommendations, symptom analysis, and health insights, bridging the gap between standard e-commerce and personalized health consultancy.

---

## 🚀 Key Features

### 🧠 AI & Intelligent Systems
*   **Smart Recommendation Engine**:
    *   **Content-Based Filtering**: Matches products to your health goals (e.g., Immunity, Sleep, Muscle Gain).
    *   **Collaborative Filtering**: "People like you bought..." recommendations.
    *   **Demographic Targeting**: Tailors suggestions based on age, gender, and lifestyle.
*   **NLP Symptom Checker**: Describe your symptoms in plain English (e.g., "I have trouble sleeping and feel stressed"), and the system identifies potential issues and recommends suitable products (e.g., Melatonin, Ashwagandha).
*   **Health Score & Insights**: Analyzes your profile to calculate a dynamic "Health Score" and identifies nutritional gaps.
*   **Interaction Checker**: Automatically warns users of potential conflicts between supplements and medications.

### 🛍️ Comprehensive E-Commerce
*   **Vast Product Catalog**:
    *   **Vitamins & Supplements**: Multivitamins, Omega-3, Probiotics, etc.
    *   **Diabetic Care**: Sugar support, diabetic-friendly snacks, monitoring tools.
    *   **Fitness Nutrition**: Protein powders, BCAAs, pre-workouts.
    *   **Medical Devices**: BP monitors, oximeters, thermometers.
    *   **Personal Care**: Organic skin care, hygiene products.
*   **Advanced Dashboard**: Features a modern **Bento Grid** layout for a quick overview of health stats, recent orders, and daily tips.
*   **Smart Cart & Checkout**: Integrated coupon system and seamless checkout flow.

### 👥 User Roles
*   **Customer**: Browse products, manage health profile, view AI insights, track orders.
*   **Administrator**: Manage products, processed orders, view platform analytics, and manage users.

---

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons)
*   **UI/UX**: Glassmorphism design, Bento Grid layouts, Responsive mobile-first design.

### **Backend**
*   **Framework**: Spring Boot 3.2.3
*   **Language**: Java 17
*   **Security**: Spring Security + JWT (Stateless Authentication)
*   **Database**:
    *   **PostgreSQL**: Primary transactional data (Users, Orders, Products).
    *   **MongoDB**: Analytics, logs, and unstructured health data.
*   **Documentation**: Swagger / OpenAPI 3.0

---

## 🏃‍♂️ Getting Started

### Prerequisites
*   **Java JDK 17+**
*   **Node.js 18+**
*   **PostgreSQL** (Running on port 5432)
*   **MongoDB** (Running on port 27017)

### Experience the App (Quick Start)

We have provided convenient batch scripts for Windows users:

1.  **Run Everything**:
    ```bash
    ./run_app.bat
    ```
    *Starts the backend server and frontend development server simultaneously.*

2.  **Deploy / Update**:
    ```bash
    ./deploy_update.bat
    ```
    *Pushes changes to GitHub and triggers a Vercel deployment.*

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
# Update application.properties with your DB credentials if needed
./mvnw spring-boot:run
```
*   Server runs at: `http://localhost:8080`
*   Swagger UI: `http://localhost:8080/swagger-ui/index.html`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*   Client runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
├── backend/
│   ├── src/main/java/com/healthshop/
│   │   ├── ai/          # AI Logic (Recommendation, NLP)
│   │   ├── config/      # Security, CORS, Swagger Config
│   │   ├── controller/  # REST API Endpoints
│   │   ├── model/       # JPA & Mongo Entities
│   │   └── service/     # Business Logic
│   └── src/main/resources/
│       └── application.properties # Configuration
│
├── frontend/
│   ├── src/app/         # Next.js App Router Pages
│   │   ├── dashboard/   # User Dashboard (Bento Grid)
│   │   ├── products/    # Product Listing & Details
│   │   ├── admin/       # Admin Console
│   │   └── ...
│   ├── src/components/  # Reusable UI Components
│   └── public/          # Static Assets
└── ...
```

## 🔐 Security Features

*   **JWT Authentication**: Secure stateless login.
*   **Role-Based Access Control (RBAC)**: Distinct access for `USER` and `ADMIN`.
*   **Input Validation**: Strict validation on all API endpoints.

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
*Built for the Future of Health E-Commerce.*
