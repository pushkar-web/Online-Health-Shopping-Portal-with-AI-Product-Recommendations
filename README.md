# Online Health Shopping Portal with AI Product Recommendations

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Spring%20Boot-blueviolet)
![AI](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3%2070B-orange)
![Deployment](https://img.shields.io/badge/Deploy-AWS%20%2B%20Vercel-purple)

A next-generation e-commerce platform dedicated to health and wellness. This project utilizes an **AI-driven RAG (Retrieval-Augmented Generation) Agent** powered by **Groq LLaMA 3.3 70B** to provide personalized product recommendations, symptom analysis, voice assistance, and health insights, bridging the gap between standard e-commerce and personalized health consultancy.

**Live Demo**: [health-shopping-portal.vercel.app](https://health-shopping-portal.vercel.app)

---

## Key Features

### AI & Intelligent Systems (RAG Agent + Groq LLM)

* **RAG Agent with Knowledge Base**: Retrieval-Augmented Generation agent that indexes all 150+ products into a searchable knowledge base with TF-IDF scoring. Retrieves relevant context chunks and generates intelligent responses via Groq LLaMA 3.3 70B.

* **AI Health Chat**: Full conversational AI chat powered by RAG — answers health questions, recommends specific store products with prices, and provides evidence-based wellness advice with user health profile context.

* **AI Symptom Checker**: Describe symptoms in plain language and get structured AI analysis including severity assessment (mild/moderate/severe), possible causes, recommended supplements from the store, lifestyle recommendations, dietary suggestions, and when to see a doctor.

* **Voice Health Assistant**: Floating mic button on every page. Uses browser-native Web Speech API (SpeechRecognition + SpeechSynthesis) for zero-cost voice input/output. Groq classifies intent (SEARCH/ADD_TO_CART/SYMPTOM_CHECK/CHAT) and routes to the RAG agent for intelligent responses. Speaks answers aloud via text-to-speech.

* **AI Visual Supplement Scanner**: Camera capture or image upload with client-side OCR via Tesseract.js (WebAssembly). Extracts text from supplement labels, sends to Groq for ingredient analysis — returns safety scores, allergen alerts, ingredient breakdowns, and matching store products.

* **Health Shield (Predictive AI)**: 12-month seasonal health threat timeline with threat severity mapping. Personalizes risk scores based on user health profile (age, conditions, allergies). Recommends prevention bundles from the store for each threat.

* **Community Health Challenges**: Gamified health improvement with 6 seeded challenges (Immunity Boost, Sleep Reset, Energy Surge, Joint Recovery, Stress Detox, Skin Glow). AI generates daily personalized tasks via Groq. Points system with streak bonuses and leaderboards.

* **Health Literacy Hub**: 20 curated health topics across 8 categories. AI generates structured lessons via Groq with adaptive difficulty (beginner/intermediate/advanced). Interactive quizzes with explanations to test understanding.

* **Smart Recommendation Engine**:
  * **Content-Based Filtering**: Matches products to health goals (Immunity, Sleep, Muscle Gain, etc.)
  * **Collaborative Filtering**: "People like you bought..." recommendations
  * **Demographic Targeting**: Tailors suggestions based on age, gender, and lifestyle

* **Health Score & Insights**: Analyzes your profile to calculate a dynamic "Health Score" and identifies nutritional gaps.

* **Interaction Checker**: Warns users of potential conflicts between supplements and medications.

* **Smart Product Comparison**: AI-powered side-by-side comparison of supplements.

### Comprehensive E-Commerce

* **150+ Product Catalog** across 10 categories:
  * Vitamins & Supplements, Diabetic Care, Fitness Nutrition, Personal Care
  * Medical Devices, Herbal & Ayurvedic, Weight Management, Baby & Child
  * Senior Health, Sports Nutrition

* **Advanced Dashboard**: Modern Bento Grid layout with health stats, recent orders, and daily tips.
* **Smart Cart & Checkout**: Integrated coupon system and seamless checkout flow.
* **Wishlist**: Save products for later with quick add-to-cart.
* **Reviews & Ratings**: Star rating system with verified purchase reviews.

### User Roles

* **Customer**: Browse products, manage health profile, view AI insights, track orders, join challenges, take lessons.
* **Administrator**: Manage products, process orders, view platform analytics, manage users, AI admin dashboard.

---

## Tech Stack

### Frontend
* **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS with Glassmorphism design
* **Icons**: Lucide React
* **State**: Zustand
* **HTTP Client**: Axios
* **OCR**: Tesseract.js (WebAssembly, client-side)
* **Voice**: Web Speech API (SpeechRecognition + SpeechSynthesis)
* **Charts**: Recharts
* **Deployment**: Vercel

### Backend
* **Framework**: Spring Boot 3.2.3
* **Language**: Java 17
* **AI/LLM**: Groq API (LLaMA 3.3 70B Versatile)
* **RAG**: Custom RAG Agent with TF-IDF knowledge base indexing
* **Security**: Spring Security + JWT (Stateless Authentication)
* **Database**: PostgreSQL (Supabase) — Users, Orders, Products, Health Profiles
* **Documentation**: Swagger / OpenAPI 3.0
* **Deployment**: AWS Elastic Beanstalk

---

## Architecture

```
User (Browser)
    |
    ├── Voice Input (Web Speech API) ──> VoiceAssistant.tsx
    ├── Camera/OCR (Tesseract.js) ──> Scan Page
    └── UI Interaction ──> Next.js Pages
            |
            v
    Vercel (Next.js Frontend)
            |  (Server-side rewrites: /api/* -> AWS)
            v
    AWS Elastic Beanstalk (Spring Boot Backend)
            |
            ├── RAGAgent.java ──> RAGKnowledgeBase (TF-IDF) ──> GroqService ──> Groq API (LLaMA 3.3 70B)
            ├── VoiceIntentService.java ──> Intent Parser (Groq) ──> RAGAgent
            ├── SupplementScanService.java ──> Label Analyzer (Groq)
            ├── HealthShieldService.java ──> Seasonal Threat DB + User Profile
            ├── ChallengeService.java ──> Gamified Tasks (Groq) + In-Memory Store
            ├── HealthLiteracyService.java ──> Lesson Generator (Groq) + RAG Context
            └── RecommendationEngine.java ──> Content/Collaborative Filtering
                    |
                    v
            PostgreSQL (Supabase) ── Products, Users, Orders, Health Profiles, Reviews
```

---

## AI Features Deep Dive

### RAG Agent Pipeline
1. **Knowledge Indexing**: All 150+ products indexed with TF-IDF vectors (name, description, ingredients, benefits, health goals)
2. **Query Processing**: User query tokenized and scored against knowledge chunks
3. **Context Retrieval**: Top 8 most relevant chunks retrieved
4. **User Profile Enrichment**: Health profile (age, conditions, allergies, goals) injected as context
5. **LLM Generation**: Groq LLaMA 3.3 70B generates response with full context
6. **Product Extraction**: Mentioned products auto-linked to store catalog

### Voice Assistant Flow
1. **Speech-to-Text**: Browser-native `SpeechRecognition` API (zero backend cost)
2. **Intent Classification**: Groq parses transcript into SEARCH/ADD_TO_CART/SYMPTOM_CHECK/CHAT
3. **RAG Execution**: All intents routed through RAG agent for intelligent responses
4. **Fallback Logic**: If product search returns empty, falls back to RAG chat
5. **Text-to-Speech**: Browser-native `speechSynthesis` reads response aloud

### Symptom Analysis Structure
```json
{
  "severity": "moderate",
  "analysis": "Detailed AI analysis...",
  "possibleCauses": ["Cause 1", "Cause 2"],
  "recommendations": ["Supplement suggestions with dosages"],
  "lifestyleChanges": ["Exercise", "Sleep hygiene"],
  "dietarySuggestions": ["Foods to include/avoid"],
  "whenToSeeDoctor": "Specific warning signs",
  "suggestedProducts": [{ "id": 89, "name": "Melatonin 5mg", "price": 6.99 }]
}
```

---

## API Endpoints

### AI Endpoints (`/api/ai/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/rag/chat` | RAG Agent chat with knowledge base context |
| POST | `/api/ai/rag/symptoms` | AI symptom analysis with structured response |
| POST | `/api/ai/rag/educate` | AI health education on any topic |
| GET | `/api/ai/rag/stats` | RAG knowledge base statistics |
| POST | `/api/ai/voice/intent` | Voice intent parsing + RAG execution |
| POST | `/api/ai/scan/analyze` | Supplement label OCR analysis |
| GET | `/api/ai/health-shield` | Personalized seasonal health threats |
| GET | `/api/ai/learn/topics` | Health literacy topic catalog (20 topics) |
| GET | `/api/ai/learn/lesson/{topicId}` | AI-generated lesson content |
| POST | `/api/ai/learn/quiz/submit` | Quiz answer submission + scoring |

### Challenge Endpoints (`/api/challenges/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challenges` | List all health challenges |
| POST | `/api/challenges/{id}/join` | Join a challenge |
| GET | `/api/challenges/{id}/my-progress` | Get user progress |
| POST | `/api/challenges/{id}/complete-task` | Complete daily task |
| GET | `/api/challenges/{id}/leaderboard` | Challenge leaderboard |

### Other Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register`, `/api/auth/login` | Authentication |
| GET | `/api/products`, `/api/products/{id}` | Product catalog |
| GET/POST | `/api/cart/*` | Shopping cart |
| POST | `/api/orders` | Order placement |
| GET/PUT | `/api/user/health-profile` | Health profile management |
| GET/POST | `/api/wishlist/*` | Wishlist |
| GET/POST | `/api/reviews/*` | Product reviews |

---

## Getting Started

### Prerequisites
* **Java JDK 17+**
* **Node.js 18+**
* **PostgreSQL** (or Supabase cloud)
* **Groq API Key** (free at [console.groq.com](https://console.groq.com))

### Backend Setup
```bash
cd backend

# Set environment variables or update application.yml:
# GROQ_API_KEY=your_groq_api_key
# DATABASE_URL=your_postgresql_url

mvn spring-boot:run
```
* Server: `http://localhost:8080`
* Swagger: `http://localhost:8080/swagger-ui/index.html`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Client: `http://localhost:3000`

---

## Project Structure

```
├── backend/
│   ├── src/main/java/com/healthshop/
│   │   ├── ai/                        # AI Services
│   │   │   ├── RAGAgent.java          # RAG Agent (chat, symptoms, education)
│   │   │   ├── RAGKnowledgeBase.java  # TF-IDF knowledge indexing
│   │   │   ├── GroqService.java       # Groq LLM API client
│   │   │   ├── VoiceIntentService.java    # Voice intent parser + RAG router
│   │   │   ├── SupplementScanService.java # OCR label analyzer
│   │   │   ├── HealthShieldService.java   # Seasonal threat prediction
│   │   │   ├── ChallengeService.java      # Gamified health challenges
│   │   │   └── HealthLiteracyService.java # AI lesson generator
│   │   ├── config/                    # Security, CORS, Swagger
│   │   ├── controller/                # REST API Endpoints
│   │   │   ├── AIController.java      # All AI endpoints
│   │   │   └── ChallengeController.java # Challenge endpoints
│   │   ├── dto/                       # Data Transfer Objects
│   │   │   └── AIDTO.java            # All AI-related DTOs
│   │   ├── model/                     # JPA Entities
│   │   ├── repository/                # Data Access Layer
│   │   └── service/                   # Business Logic
│   └── src/main/resources/
│       └── application.yml            # Configuration
│
├── frontend/
│   ├── src/app/                       # Next.js App Router Pages
│   │   ├── ai/chat/                   # AI Health Chat (RAG)
│   │   ├── ai/dashboard/             # AI Features Dashboard
│   │   ├── ai/scan/                   # Visual Supplement Scanner
│   │   ├── symptom-search/           # Symptom Checker
│   │   ├── health-shield/            # Health Shield (Predictive)
│   │   ├── challenges/               # Community Challenges
│   │   ├── learn/                    # Health Literacy Hub
│   │   ├── products/                 # Product Catalog
│   │   ├── dashboard/                # User Dashboard
│   │   ├── admin/                    # Admin Console
│   │   └── ...
│   ├── src/components/
│   │   ├── VoiceAssistant.tsx        # Global voice assistant (floating mic)
│   │   ├── Navbar.tsx                # Navigation with AI Tools dropdown
│   │   ├── ProductCard.tsx           # Product display card
│   │   └── ...
│   └── src/lib/
│       └── api.ts                    # API client (aiAPI, challengeAPI, etc.)
└── ...
```

## Security Features

* **JWT Authentication**: Secure stateless login with token refresh.
* **Role-Based Access Control (RBAC)**: Distinct access for `USER` and `ADMIN`.
* **Input Validation**: Strict validation on all API endpoints.
* **CORS Configuration**: Whitelisted origins for frontend domains.
* **Health Profile Privacy**: User health data accessible only to the owning user.

## Deployment

* **Backend**: AWS Elastic Beanstalk (Java 17, Corretto)
* **Frontend**: Vercel (Next.js optimized)
* **Database**: Supabase (PostgreSQL cloud)
* **AI**: Groq Cloud API (LLaMA 3.3 70B Versatile)

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Built for the Future of Health E-Commerce.*
