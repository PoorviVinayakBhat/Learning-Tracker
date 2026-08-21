# Recall — Personal Learning Tracker

Track everything you learn (YouTube, books, courses, articles) in one place, get AI summaries,
AI-generated quizzes, and a **Knowledge Decay Radar** that shows what you're about to forget.

## Stack

- **Backend**: Spring Boot 3, Spring Security + JWT, Spring Data JPA, MySQL
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts
- **AI**: pluggable client (defaults to Anthropic's Messages API — swap to any OpenAI-compatible endpoint by changing `app.ai.*` config)

## The unique feature: Knowledge Decay Radar

Every resource you save gets a `retentionStrength` score. Retention over time is modeled with
an Ebbinghaus-style forgetting curve — `R(t) = e^(-t / S)` — and reviewing a resource or
passing a quiz on it boosts `S`, flattening the curve. The `/decay-radar` page renders this
per-topic as a literal radar/spider chart, and lists the resources decaying fastest so you know
exactly what to revisit. The Revision Planner then turns that + your exam/interview deadlines
into a daily AI-written study plan.

---

## Quickest way to run it: Docker Compose

Requires Docker + Docker Compose. From the project root:

```bash
# optional — set your AI key so summarization/quiz features work
export AI_API_KEY=sk-ant-...

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api
- Swagger docs: http://localhost:8080/swagger-ui.html
- MySQL: localhost:3306 (root/root, db `learning_tracker`)

Without `AI_API_KEY` set, everything works except summarization, quiz generation, and the
revision planner — those endpoints will return a clear 503 telling you the key is missing.

---

## Running without Docker

### Backend

Requires Java 17+, Maven, and a running MySQL 8 instance.

```bash
cd learning-tracker   # this folder
mysql -u root -p -e "CREATE DATABASE learning_tracker;"

export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=some-long-random-string
export AI_API_KEY=sk-ant-...        # optional, needed for AI features

mvn spring-boot:run
```

Backend runs on **http://localhost:8080**.

### Frontend

Requires Node 18+.

```bash
cd frontend
npm install
cp .env.example .env.local   # VITE_API_URL=http://localhost:8080/api
npm run dev
```

Frontend runs on **http://localhost:5173**.

---

## Project structure

```
learning-tracker/
├── src/main/java/com/learningtracker/
│   ├── entity/          User, Topic, Resource, Quiz, QuizQuestion, QuizAttempt
│   ├── repository/      Spring Data JPA repositories
│   ├── security/        JWT filter/service, UserDetails, SecurityUtils
│   ├── service/         Business logic incl. AiClient, DecayRadarService,
│   │                    RevisionPlannerService, SummarizationService, QuizService
│   ├── controller/      REST controllers (/api/auth, /api/topics, /api/resources,
│   │                    /api/ai, /api/decay-radar, /api/revision-planner,
│   │                    /api/search, /api/dashboard)
│   ├── dto/              Request/response DTOs
│   └── exception/       Global exception handling
├── frontend/             React app (Vite + Tailwind + Framer Motion)
├── Dockerfile            Backend multi-stage build
├── docker-compose.yml    Backend + frontend + MySQL
└── pom.xml
```

## API overview

| Method | Endpoint                              | Purpose                              |
|--------|----------------------------------------|---------------------------------------|
| POST   | `/api/auth/register`                   | Create account, returns JWT          |
| POST   | `/api/auth/login`                      | Log in, returns JWT                  |
| GET/POST/PUT/DELETE | `/api/topics`, `/api/topics/{id}` | Topic CRUD                    |
| GET/POST/PUT/DELETE | `/api/resources`, `/api/resources/{id}` | Resource CRUD          |
| POST   | `/api/resources/{id}/review`           | Mark reviewed (boosts retention)     |
| POST   | `/api/ai/resources/{id}/summarize`     | AI summary of a resource's notes     |
| POST   | `/api/ai/resources/{id}/quiz`          | AI-generate a quiz                   |
| POST   | `/api/ai/quizzes/{id}/submit`          | Submit answers, get scored           |
| GET    | `/api/decay-radar`                     | Knowledge Decay Radar data           |
| GET    | `/api/revision-planner/today`          | AI daily revision plan               |
| GET    | `/api/search?q=`                        | Search your resources                |
| GET    | `/api/dashboard`                        | Summary stats                        |

All endpoints except `/api/auth/**` require `Authorization: Bearer <token>`.

## What's left to build (steps 19-20 from your original plan, and polish)

This is a working full-stack app end to end — register, add topics/resources, get AI
summaries and quizzes, and see your decay radar and revision plan. A few things worth doing
next as you keep building:

- **Flashcards / spaced repetition mode** as an alternative to MCQ quizzes
- **Exam/Interview prep mode**: a filtered view scoped to one Topic's purpose with a countdown
- **Microservices split**: the AI service (summarization/quiz/planner) is already isolated
  behind the `AiClient` interface, making it straightforward to pull into its own service later
- **Refresh token rotation**: refresh tokens are issued but there's no `/api/auth/refresh`
  endpoint yet — access tokens currently just expire after 24h and require re-login
- **Rate limiting** on the AI endpoints before you expose this publicly (LLM calls cost money)
