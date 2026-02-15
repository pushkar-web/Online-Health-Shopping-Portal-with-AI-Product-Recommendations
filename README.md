# Online Health Shopping Portal with AI Recommendations

A comprehensive e-commerce platform dedicated to health and wellness, featuring an advanced "User-Based Expert System" for personalized product recommendations, symptom analysis, and health insights.

## 🚀 Project Overview

This project is a modern, full-stack web application designed to help users find the right health supplements and products based on their specific needs. Unlike standard e-commerce sites, it integrates **AI-driven algorithms** to understand user health profiles, analyze symptoms, and provide tailored advice including lifestyle tips and severity assessments.

## 👥 User Roles

### **1. AI-Powered User (Customer)**
*   **Personalized Dashboard**: View health score, daily tips, and recommended products based on health goals.
*   **Shop & Browse**: Explore a vast catalog of health products with advanced filtering.
*   **AI Health Assistant**: Chat with an intelligent bot to describe symptoms and get instant product suggestions, lifestyle advice, and medical severity warnings.
*   **Health Tools**:
    *   **Symptom Checker**: Identify potential causes and remedies for symptoms.
    *   **Interaction Checker**: Check for potential interactions between supplements/medications.
    *   **Dosage Calculator**: Get personalized dosage recommendations based on profile.
    *   **Product Comparison**: Smart comparison of nutritional values and benefits.
*   **Order Management**: Place orders, track status, view history, and manage wishlist.
*   **Profile Management**: Update health metrics (age, weight, height), allergies, and health goals for better recommendations.

### **2. Administrator**
*   **Dashboard**: Overview of sales, user growth, and popular products.
*   **Product Management**: Add, edit, or remove products, categories, and inventory.
*   **Order Management**: View and process customer orders.
*   **User Management**: Oversee user accounts and system access.

## 🧠 AI & Backend Intelligence

 The core of the platform is a robust set of rule-based AI engines located in `com.healthshop.ai`:

*   **Recommendation Engine**: uses a hybrid approach:
    *   **Content-Based**: Matches products to your specific health goals (e.g., "Immunity", "Muscle Gain").
    *   **Collaborative Filtering**: "Customers also bought" logic to find products purchased by similar users.
    *   **Demographic Filtering**: Suggestions popular in your specific age group.
*   **Health Insights Engine**: Analyzes your profile to calculate a "Health Score", identify nutrition gaps, and generate daily health tips.
*   **Symptom Analysis NLP**: Uses natural language pattern matching to identify symptoms from free-text descriptions (e.g., "trouble sleeping") and map them to relevant product categories (e.g., Melatonin, Magnesium).
*   **Safety Engines**:
    *   **Interaction Checker**: Prevents harmful combinations.
    *   **Dosage Calculator**: Adjusts standard dosages based on user weight/age.

## 🛠️ Tech Stack

### **Frontend**
*   **Framework**: [Next.js 14](https://nextjs.org/) (React)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (Glassmorphism UI design)
*   **Icons**: Lucide React
*   **State Management**: React Hooks

### **Backend**
*   **Framework**: Spring Boot 3.2.3 (Java 17)
*   **Security**: Spring Security + JWT (JSON Web Tokens)
*   **Documentation**: Swagger / OpenAPI
*   **Data Access**: Spring Data JPA & Spring Data MongoDB
*   **Utilities**: Lombok, Validation API

### **Database**
*   **Relational**: PostgreSQL (Primary data: Users, Products, Orders)
*   **NoSQL**: MongoDB (Analytics, Logs, or Flexible Data)

## 🏃‍♂️ How to Run

### **Prerequisites**
*   Java JDK 17+
*   Node.js 18+
*   PostgreSQL & MongoDB installed and running

### **Quick Start**

You can use the provided batch file to start both services:
```bash
./run_app.bat
```

**Manual Start:**

1.  **Backend**:
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
    *Server runs on: `http://localhost:8080`*

2.  **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Client runs on: `http://localhost:3000`*

## 📚 API Documentation
Once the backend is running, access the full API documentation at:
`http://localhost:8080/swagger-ui/index.html`
