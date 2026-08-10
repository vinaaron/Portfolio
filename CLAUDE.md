# Aaron Vinod - Portfolio & Career Context

This file preserves important context for Claude Code sessions working on this portfolio and career strategy.

---

## About Aaron

**Education:** MEng Engineering Mathematics, First Class - University of Bristol (2024)
**Location:** Cambridge, UK
**Status (Feb 2026):** Left LINQ. Now full-time job seeking (MLE preferred, SWE open) + building ScrollBuddy + personal brand.
**Previous Role:** CTO & Technical Co-founder at LINQ (Sep 2025 - ~Jan 2026)

### Personality & Quirks
- Badminton lover (discovered at uni during COVID, dad played too)
- Cambridge United dev squad in Year 6 (football background)
- Night owl by necessity (UK mornings are brutal)
- Runs on water only - no coffee ("pure willpower")
- Hyperfocus mode - forgets to eat, loses track of time, late to things
- "Game character" mindset - believes you can level up any skill
- Philosophy: "If you don't change it, you're choosing it"
- Genuinely curious about people and conversations

### Motivations
- **Impact** - Build things people actually use
- **Freedom** - Own path, own boss
- **Learning** - Understanding how things work
- **Competition** - Hackathons, proving yourself

---

## Projects & Technical Experience

### LINQ (CTO, Sep 2025 - ~Jan 2026) — LEFT
AI-powered professional networking platform, partnered with Simon Squibb. Team of 4 (solo technical founder).
**Infrastructure:**
- AWS: CloudFront → ALB → ECS Fargate (auto-scaling) → RDS PostgreSQL
- CI/CD: GitHub Actions → ECR → ECS, Terraform IaC
- Security: CloudFront origin validation, Security Groups, OIDC auth to AWS (no long-lived credentials)
- Monitoring: Sentry + CloudWatch + structlog

**Database & API (SWE depth):**
- PostgreSQL: 20+ tables, 70 Alembic migrations, pgvector HNSW indexes, PostGIS geo-indexes
- FastAPI: async, repository pattern, dependency injection, Pydantic validation, rate limiting (slowapi)
- Multi-provider OIDC auth interface (Auth0, Keycloak, Cognito, Clerk)
- JWT-based RBAC, 5h access / 30-day refresh TTL

**Mobile (SWE depth):**
- React Native: Zustand (client) + React Query (server) + MMKV (encrypted persistence)
- Auth0 JWT with automatic token refresh, Axios interceptors (401 queue, 429 backoff)
- 1,035+ TypeScript files, 50+ service modules

**ML/AI:**
- Gemini embeddings (752D), 80-90% match accuracy, chose over OpenAI for cost
- Groq LLM re-ranking (<5s latency)
- Benchmarked embedding models on synthetic data, score distribution variance (0.6-0.8)

**Stack:** React Native/Expo + FastAPI + PostgreSQL + AWS
**Codebase:** `/Users/avini/Documents/LINQ/LINQ-code/`

### ScrollBuddy (Founder, Aug 2025 - Present)
Anti-doomscrolling iOS app shipped to App Store.
- 2M+ organic TikTok views through content-led growth
- First paying user within 48 hours

**SWE depth (from codebase):**
- Custom Expo native modules bridging iOS Screen Time API (DeviceActivity framework) with Swift
- App Group coordination between main app and shield extension
- MMKV encrypted storage, dual event queues (optimistic vs confirmed usage)
- 14-layer provider dependency hierarchy
- RevenueCat in-app purchases, premium status synced to Swift extensions via UserDefaults
- Background sync: exponential backoff, idempotency, 30s rate limiting
- Sentry + structured logging, Zod runtime validation
- Deep linking with auth-gated intent storage

**Stack:** React Native/Expo + Supabase
**Codebase:** `/Users/avini/Documents/GitHub/doomscrollr`

### Encode Club Hackathon ($2.5K Winner, Feb 2025)
Sign language detection system.
- Pivoted from image-based CNN to coordinate-based neural network using Google MediaPipe
- 70% accuracy on ASL dataset using hand coordinate features
- Decentralized ML: Filecoin for model storage + Lilypad for distributed compute
- Demo: Next.js frontend + Python API

### thoughts2actions (Jan 2025)
Voice-to-structured-actions web app.
- Built in 7 days, concept to production
- Pipeline: audio → transcription → AI processing → searchable knowledge base
- Stack: Next.js + Vercel

### Aviini Ltd (Jul 2023 - Jan 2025)
E-commerce business.
- £25K profit at 25-35% margin over 18 months
- Built eBay/Etsy API integrations for automated revenue and order tracking

### MyGreenDoor (ML Engineer, Jan-Jun 2023)
Property retrofit recommendations for UK sustainability initiative.
- k-NN clustering with feature selection and hyperparameter tuning
- Evaluated feature subsets, iterated on k values and distance metrics
- Stack: Python, pandas, scikit-learn

---

## Portfolio Design Decisions

### Hero Section Terminal
- Shows **personality code snippets** (NOT name/role - that would be redundant)
- 12 snippets in `/src/data/codeSnippets.tsx` covering:
  - **Sports:** Badminton discovery, Cambridge United throwback
  - **Work style:** Hyperfocus mode, grind loop, late to everything, game character leveling
  - **Philosophy:** Change or choose it, conversation collector, freedom, impact driven
  - **Lifestyle:** Night owl, hydration gang (water only)
- Shuffle button (Lucide React `<Shuffle />` icon) to cycle through snippets
- Languages cycle: TypeScript (.tsx), Python (.py), C++ (.cpp)

### Desktop Layout (>768px)
- "AARON VINOD" headline: **VISIBLE**
- "Founder & Engineer" role: **HIDDEN** (redundant - terminal has this context)
- Subtitle: "Building products end-to-end: React Native to AWS infrastructure."

### Mobile Layout (≤768px)
- "AARON VINOD" headline: **VISIBLE** (responsive font: `clamp(2.5rem, 10vw, 4rem)`)
- Role: **HIDDEN**
- Terminal + cards stack vertically
- Visual section has `order: -1` (appears before text content)

### Social Links (all 6 shown)
| Platform | URL |
|----------|-----|
| GitHub | github.com/ce20480 |
| LinkedIn | linkedin.com/in/aaron-vinod-a80016243 |
| X (Twitter) | x.com/AviniLimited |
| YouTube | youtube.com/@aviini |
| Instagram | instagram.com/aviinilimited |
| TikTok | tiktok.com/@aviinilimited |

---

## Technical Stack

**Framework:** Next.js 16.1.0 (Turbopack, App Router)
**Language:** TypeScript
**Styling:** CSS Modules
**Deployment:** Vercel

### Key Files
| File | Purpose |
|------|---------|
| `/src/components/hero/HeroVisual.tsx` | Terminal + cards + social icons |
| `/src/components/hero/HeroContent.tsx` | Headline + subtitle |
| `/src/components/hero/Hero.module.css` | All hero styling + responsive breakpoints |
| `/src/data/codeSnippets.tsx` | 12 personality code snippets |
| `/src/data/socials.ts` | Social link URLs and metadata |
| `/src/types/index.ts` | TypeScript interfaces (SocialLink, Project, etc.) |

### Dependencies Added
- `lucide-react` - Shuffle icon for terminal
- `@vercel/analytics` - Analytics tracking

---

## Resume/CV Status

- **SWE v6**: `Aaron_Vinod_Resume_SWE_v6.tex` — engineering-depth rewrite, ATS-optimized (replaces v5)
- **MLE v5**: `Aaron_Vinod_Resume_MLE_v5.tex` — completed, ATS-optimized, LINQ dates fixed
- **LinkedIn**: Updated with detailed experience entries (Feb 2026)
- **Plan file**: Outreach schedule + CV strategy at `/Users/avini/.claude/plans/drifting-whistling-oasis.md`

### Key Lesson: Engineer vs Founder Language
SWE v5 read like a founder pitch deck. v6 rewrites every bullet to show HOW (architecture, patterns, trade-offs) not just WHAT was shipped. Example:
- Bad: "Built cross-platform mobile app (React Native/Expo) + FastAPI REST API + PostgreSQL"
- Good: "Designed PostgreSQL schema (20+ tables, 70 Alembic migrations) with pgvector HNSW indexes for vector similarity, PostGIS geo-indexes for distance ranking"

### Key Skills (for ATS)
**Languages:** TypeScript, Python, SQL, Swift (native modules)
**Frontend:** React Native/Expo, Next.js/React, Zustand, React Query, Expo Router
**Backend:** FastAPI, PostgreSQL, SQLAlchemy 2.0, Pydantic, Alembic, REST APIs
**Cloud & DevOps:** AWS (ECS Fargate, RDS, CloudFront, ALB), Docker, Terraform, CI/CD (GitHub Actions)
**Tools:** Sentry, structlog, MMKV, RevenueCat, Auth0/OIDC, pgvector, PostGIS
**ML:** Vector embeddings, LLM integration (Groq, Gemini), scikit-learn, PyTorch, RAG, Computer Vision (MediaPipe)

---

## Job Search Strategy

### Target Companies (Expanded)

**London Fintech (all actively hiring ML, 2026):**
| Company | ML Focus | Salary |
|---------|----------|--------|
| Monzo | Fraud detection, personalization | £95-130K + stock |
| Revolut | FinCrime, Growth, RAG assistants | Competitive + equity |
| Wise | ML Platform team | Competitive |
| GoCardless | Payment intelligence, fraud | £82-103K + equity |
| Deliveroo | Recommendations, logistics | Competitive |
| Starling Bank | Data & ML Engineering | Competitive |
| Thought Machine | Cloud banking infra | Competitive |
| Checkout.com | Payments | Competitive |
| Paddle | SaaS billing | Competitive |

**Cambridge AI/ML (local advantage):**
| Company | ML Focus | Notes |
|---------|----------|-------|
| Arm | GenAI, ML compilers, NPUs | Graduate + senior roles |
| Darktrace | AI cybersecurity | 16 Cambridge jobs |
| Speechmatics | ASR, billion-param models | 19 jobs, £59-81K |
| Healx | ML drug discovery | Research engineer roles |
| Luminance | Legal AI (LLMs, RAG) | Raised $75M |
| Cambridge Consultants | Tech consulting | Graduate 2026 |

### Outreach Process (Per Company)
1. Apply through career page (ATS)
2. Cold email recruiter same day (find via Hunter.io / Apollo.io)
3. LinkedIn DM if no email response in 3 days
4. One follow-up after 5-7 days
5. Move on if nothing. Volume: 5-8 personalized per day.

### Finding Contacts
- LinkedIn: "[Company]" + "Engineering Recruiter" or "Talent Partner" (current employees)
- If no recruiter: Engineering Manager or Head of ML
- Cambridge companies: smaller teams = DM CTO/Head of Eng directly
- Emails: Hunter.io (25 free/month), Apollo.io, patterns: firstname@company.com

### Job Boards
1. Direct company careers pages (highest response)
2. Wellfound (formerly AngelList) — £104K avg London ML
3. MachineLearningJobs.co.uk — UK-specific
4. LinkedIn Jobs — largest volume
5. Glassdoor UK — interview insights

### Salary Targets
- London: £95-110K base + equity
- Cambridge: £85-100K base + equity
- CTO experience is a differentiator — negotiate on leadership + end-to-end ownership

### Interview Formats (UK Fintech MLE)
1. Screening (30-45min)
2. LeetCode coding (1-2 rounds, medium)
3. ML system design (45-60min) — fraud detection, rec systems, embedding search
4. ML theory/stats — bias-variance, regularization, evaluation metrics
5. Behavioral (STAR, deep follow-ups)

**Monzo:** Take-home + 5 interviews + intense behavioral
**Revolut:** Live coding + system design + 3 culture fit rounds

---

## Daily Schedule (Full-Time, Night Owl)

### Block 1 — Outreach (1.5-2h) — DO FIRST
Research, personalize, send 5-8 messages. Highest-leverage activity.

### Block 2 — Technical Prep (2-2.5h)
- **Mon/Wed/Fri:** LeetCode (Python, NeetCode 150, pattern-based, 3-4 problems)
- **Tue/Thu:** ML prep (system design, feature engineering, stats)
- **Book:** "Designing Machine Learning Systems" by Chip Huyen
- **Scala/FP:** 30min evening reading (depth, not direct interview ROI)

### Block 3 — ScrollBuddy (2.5-3h)
Feature dev, growth, user feedback. Also resume-building.

### Block 4 — Personal Brand (1h)
"Building a business vs applying for a role in 2026" series on TikTok.
Doubles as ScrollBuddy marketing (founder journey -> followers -> users).

### Weekly Rhythm
- Mon-Fri: Full 4-block (~8h)
- Sat: Deep ScrollBuddy (4-5h) + light LeetCode
- Sun: Rest / batch content / Scala reading

---

## Contact
- Email: aaronvinod25@gmail.com
- Phone: +44 7476 904065
- Portfolio: portfolio-zeta-ecru-53.vercel.app
