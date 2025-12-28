# Qalb & Quran - Software Architecture

## 1. System Overview

**App Name:** Qalb & Quran  
**Platform:** Mobile (iOS & Android)  
**Target Users:** Girls and young Muslim women  
**Purpose:** Qur'an memorization and personal growth with community support

---

## 2. High-Level Architecture

### 2.1 Architecture Pattern
**Pattern:** Clean Architecture with MVVM (Model-View-ViewModel)
- Ensures separation of concerns
- Makes the app testable and maintainable
- Supports offline-first functionality

### 2.2 System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (UI Components, ViewModels, State Management)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│  (Business Logic, Use Cases, Entities)                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  (Repositories, Data Sources, API/DB)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Architecture Components

### 3.1 Mobile Application Layer

#### Technology Stack Recommendations:
- **Cross-Platform:** Flutter or React Native (single codebase for iOS/Android)
- **Alternative:** Native (Swift/SwiftUI for iOS, Kotlin/Jetpack Compose for Android)

#### Core Modules:

**A. Authentication Module**
- User registration/login
- Profile management
- Privacy settings (gender-specific mentor preferences)

**B. Hifz Tracker Module**
- Goal setting (daily/weekly/monthly)
- Progress tracking
- "Qur'an Tree" visualization
- Streak counter with reminders

**C. Review System Module**
- Spaced repetition algorithm implementation
- Notification scheduler
- Integration with life goals/milestones

**D. Voice Recording Module**
- Audio capture and storage
- AI-powered tajwid checker integration
- Local audio library management
- Compression and optimization

**E. Tajwid Learning Module**
- Video/animation player
- Interactive quizzes
- Progress-based unlockables
- Tajwid tracker with visual charts

**F. Sister Circles (Community) Module**
- Group creation and management
- Real-time chat/video rooms (WebRTC)
- Privacy controls (audio-only, no downloads)
- Community challenges dashboard
- Du'a board with commenting

**G. Reflection Journal Module**
- Guided prompt engine
- Tafsir integration
- Mood tracking
- PDF export functionality

**H. Rewards & Gamification Module**
- Badge system
- Avatar customization
- Leaderboards (optional)
- Seasonal rewards logic

**I. Qur'an Buddy AI Module**
- Conversational AI interface (ChatGPT-style)
- Personalized encouragement engine
- Islamic knowledge base integration

**J. Lunar Calendar Module**
- Islamic calendar integration
- Event-based reminders
- Du'a of the day system

**K. Mindful Breaks Module**
- Guided audio sessions
- Timer functionality
- Scheduling system

**L. Vision Board Module**
- Digital canvas for combining goals/images/ayahs
- Image gallery integration
- Sharing functionality

**M. Global Stories Module**
- Content feed with moderation
- Story submission and commenting
- Anonymous posting

**N. Offline Mode Module**
- Audio library management
- Local progress sync
- Offline journal and tracker

---

### 3.2 Backend Services Layer

#### Technology Stack:
- **API Framework:** Node.js (Express/NestJS) or Python (FastAPI/Django)
- **Database:** PostgreSQL (relational data) + MongoDB (documents/media)
- **Cache:** Redis (sessions, frequently accessed data)
- **File Storage:** AWS S3 or Google Cloud Storage
- **Real-time:** WebSockets (Socket.io) for Sister Circles

#### Microservices Architecture:

```
┌──────────────────────────────────────────────────────────────┐
│                       API GATEWAY                             │
│              (Authentication, Rate Limiting, Routing)         │
└──────────────────────────────────────────────────────────────┘
           │           │           │           │
           ↓           ↓           ↓           ↓
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │   User   │ │  Content │ │ Community│ │   AI     │
    │ Service  │ │ Service  │ │ Service  │ │ Service  │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
           │           │           │           │
           └───────────┴───────────┴───────────┘
                          ↓
              ┌────────────────────────┐
              │   Shared Data Layer    │
              │ (Databases, Caching)   │
              └────────────────────────┘
```

#### Key Services:

**1. User Service**
- User authentication and authorization (JWT)
- Profile management
- Subscription management (freemium/premium)
- Privacy and settings

**2. Content Service**
- Qur'an text and audio management
- Tafsir and hadith content
- Tajwid lessons and videos
- Multilingual support

**3. Hifz Management Service**
- Goal tracking and progress calculation
- Spaced repetition algorithm
- Reminder scheduling
- Streak calculations

**4. AI/ML Service**
- Tajwid checker (audio analysis)
- Personalized AI companion
- Recommendation engine
- Content moderation

**5. Community Service**
- Sister Circles management
- Real-time messaging (WebRTC/WebSocket)
- Group challenges and leaderboards
- Story feed and moderation

**6. Media Service**
- Audio recording upload/download
- Video streaming
- Image processing and storage
- PDF generation (journal export)

**7. Notification Service**
- Push notification management
- Email notifications
- In-app notification center
- Scheduled reminders

**8. Analytics Service**
- User behavior tracking
- Progress analytics
- Feature usage metrics
- A/B testing support

**9. Payment Service**
- Subscription processing (Stripe/PayPal)
- In-app purchases
- Donation handling
- Receipt generation

---

### 3.3 AI/ML Components

#### A. Tajwid Checker
**Technology:** 
- Speech-to-text (Whisper API or Google Speech-to-Text)
- Custom ML model trained on tajwid rules
- Audio feature extraction (librosa/pydub)

**Flow:**
```
User Records → Audio Upload → Feature Extraction → 
Tajwid Rule Analysis → Feedback Generation → User Display
```

#### B. Qur'an Buddy AI
**Technology:**
- OpenAI GPT-4 or custom fine-tuned model
- Islamic knowledge base (RAG - Retrieval Augmented Generation)
- Context management for personalized responses

**Features:**
- Answers questions about tajwid, tafsir, memorization
- Provides motivational messages
- Adapts to user progress

#### C. Spaced Repetition Algorithm
**Algorithm:** Modified SuperMemo/Anki algorithm
- Calculates optimal review intervals
- Adjusts based on user performance
- Integrates with notification system

---

### 3.4 Database Schema Design

#### Primary Entities:

**Users Table**
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  username VARCHAR,
  gender ENUM,
  language_preference VARCHAR,
  subscription_tier ENUM,
  created_at TIMESTAMP,
  avatar_customization JSONB
)
```

**Hifz Progress Table**
```sql
hifz_progress (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  surah_id INT,
  ayah_range VARCHAR,
  memorized_date DATE,
  review_count INT,
  next_review_date DATE,
  status ENUM (memorizing, reviewing, mastered)
)
```

**Goals Table**
```sql
goals (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  type ENUM (daily, weekly, monthly),
  target_value INT,
  current_progress INT,
  start_date DATE,
  end_date DATE,
  linked_milestone VARCHAR
)
```

**Recordings Table**
```sql
recordings (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  surah_id INT,
  ayah_range VARCHAR,
  audio_url VARCHAR,
  tajwid_feedback JSONB,
  recorded_at TIMESTAMP,
  shared_with_mentor BOOLEAN
)
```

**Sister Circles Table**
```sql
sister_circles (
  id UUID PRIMARY KEY,
  name VARCHAR,
  created_by UUID FOREIGN KEY,
  privacy_settings JSONB,
  member_count INT,
  created_at TIMESTAMP
)
```

**Journal Entries Table**
```sql
journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  ayah_reference VARCHAR,
  reflection_text TEXT,
  mood_tags VARCHAR[],
  created_at TIMESTAMP
)
```

**Additional Tables:**
- badges
- notifications
- subscriptions
- mentor_profiles
- community_stories
- challenges
- audio_library

---

### 3.5 API Design

#### RESTful API Endpoints:

**Authentication:**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh-token
PUT  /api/auth/profile
```

**Hifz Tracking:**
```
GET    /api/hifz/progress
POST   /api/hifz/goals
PUT    /api/hifz/goals/{id}
GET    /api/hifz/tree-visualization
POST   /api/hifz/mark-complete
GET    /api/hifz/review-schedule
```

**Voice & Tajwid:**
```
POST   /api/recordings/upload
GET    /api/recordings/user/{userId}
POST   /api/tajwid/analyze
GET    /api/tajwid/lessons
POST   /api/tajwid/quiz-submit
GET    /api/tajwid/tracker
```

**Sister Circles:**
```
POST   /api/circles/create
GET    /api/circles/user/{userId}
POST   /api/circles/{id}/join
GET    /api/circles/{id}/members
POST   /api/circles/{id}/messages
WebSocket: /ws/circles/{id}
```

**AI Companion:**
```
POST   /api/ai/chat
GET    /api/ai/daily-message
POST   /api/ai/ask-question
```

**Journal:**
```
POST   /api/journal/entries
GET    /api/journal/entries
PUT    /api/journal/entries/{id}
GET    /api/journal/export-pdf
```

---

## 4. Infrastructure Architecture

### 4.1 Cloud Architecture (AWS Example)

```
┌─────────────────────────────────────────────────────────┐
│                     USERS/CLIENTS                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│            CloudFront (CDN) + WAF                        │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         Application Load Balancer (ALB)                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────┬──────────────────┬───────────────────┐
│   ECS/EKS        │   Lambda         │   API Gateway     │
│   (Containers)   │   (Serverless)   │   (REST/WS)      │
└──────────────────┴──────────────────┴───────────────────┘
                         ↓
┌──────────────────┬──────────────────┬───────────────────┐
│   RDS            │   S3             │   ElastiCache     │
│   (PostgreSQL)   │   (Media Files)  │   (Redis)         │
└──────────────────┴──────────────────┴───────────────────┘
```

### 4.2 Deployment Strategy
- **Containerization:** Docker
- **Orchestration:** Kubernetes (EKS) or ECS
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** CloudWatch, Datadog, or Sentry
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 5. Security Architecture

### 5.1 Security Measures

**Authentication & Authorization:**
- JWT-based authentication
- OAuth 2.0 for social login (optional)
- Role-based access control (RBAC)
- Gender-based privacy controls

**Data Protection:**
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Sensitive data masking
- GDPR compliance

**API Security:**
- Rate limiting (per user/IP)
- API key management
- Input validation and sanitization
- CORS policy enforcement

**Privacy Features:**
- Audio-only circle options
- Download prevention in circles
- Gender-specific mentor matching
- Data anonymization for stories

**Content Moderation:**
- AI-powered content filtering
- Manual review queue
- User reporting system
- Automated flagging for inappropriate content

---

## 6. Offline-First Architecture

### 6.1 Offline Strategy

**Local Storage:**
- SQLite for relational data
- Realm or Hive for document storage
- Local file system for audio/media

**Sync Strategy:**
```
┌──────────────────────────────────────────────────┐
│  User Action → Local DB (Immediate)              │
│        ↓                                          │
│  Queue Sync Request                              │
│        ↓                                          │
│  Background Sync (when online)                   │
│        ↓                                          │
│  Conflict Resolution (last-write-wins)           │
└──────────────────────────────────────────────────┘
```

**Offline Features:**
- Downloaded audio library
- Local progress tracking
- Journal entries saved locally
- Sync indicator UI

---

## 7. Scalability Considerations

### 7.1 Performance Optimization

**Caching Strategy:**
- CDN for static assets
- Redis for API responses
- Client-side caching
- Database query optimization

**Load Balancing:**
- Auto-scaling groups
- Horizontal scaling for services
- Database read replicas
- Queue-based processing for heavy tasks

**Media Optimization:**
- Audio compression (Opus/AAC)
- Image compression (WebP)
- Lazy loading
- Progressive audio streaming

---

## 8. Third-Party Integrations

### 8.1 Required Services

**AI/ML:**
- OpenAI API (GPT-4)
- Google Speech-to-Text or Whisper
- Custom ML model hosting (SageMaker/Vertex AI)

**Payment:**
- Stripe or PayPal
- In-app purchase SDKs (Apple/Google)

**Communication:**
- Twilio or Agora (video/audio)
- SendGrid or AWS SES (email)
- Firebase Cloud Messaging (push notifications)

**Content:**
- Qur'an API (quran.com API or similar)
- Islamic calendar API
- Hadith databases

**Analytics:**
- Mixpanel or Amplitude
- Google Analytics
- Firebase Analytics

---

## 9. Development Roadmap

### Phase 1 - MVP (3-4 months)
- User authentication
- Basic hifz tracker
- Simple progress visualization
- Audio recording
- Basic journal

### Phase 2 - Core Features (3-4 months)
- AI tajwid checker
- Sister Circles (basic)
- Review system with notifications
- Tajwid lessons
- Rewards system

### Phase 3 - Advanced Features (3-4 months)
- Qur'an Buddy AI
- Advanced community features
- Mindful breaks
- Vision board
- Global stories

### Phase 4 - Polish & Scale (2-3 months)
- Offline mode enhancement
- Multi-language support
- Monetization features
- Performance optimization
- Advanced analytics

---

## 10. Monitoring & Maintenance

### 10.1 Key Metrics

**Performance Metrics:**
- API response times
- App load times
- Crash rate
- Memory usage

**Business Metrics:**
- Daily/Monthly Active Users (DAU/MAU)
- Retention rate
- Feature adoption
- Subscription conversion
- User satisfaction (in-app surveys)

**Technical Health:**
- Error rates
- Service uptime
- Database performance
- API success rates

---

## 11. Compliance & Ethics

### 11.1 Considerations

- **Islamic Content Accuracy:** Review by qualified scholars
- **Gender Privacy:** Strict enforcement of gender-specific features
- **Data Privacy:** GDPR, CCPA compliance
- **Child Safety:** Age verification, parental controls
- **Charity Transparency:** Clear donation tracking

---

## 12. Technology Stack Summary

### Frontend (Mobile)
- **Framework:** Flutter or React Native
- **State Management:** Riverpod/Provider or Redux
- **Local DB:** SQLite, Hive
- **Audio:** flutter_sound or react-native-audio

### Backend
- **API:** Node.js (NestJS) or Python (FastAPI)
- **Database:** PostgreSQL + MongoDB
- **Cache:** Redis
- **Queue:** RabbitMQ or AWS SQS
- **Storage:** AWS S3

### Infrastructure
- **Cloud:** AWS or Google Cloud
- **Containers:** Docker + Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Datadog, Sentry

### AI/ML
- **LLM:** OpenAI GPT-4
- **Speech:** Google Speech-to-Text
- **Custom Models:** TensorFlow/PyTorch
- **Hosting:** AWS SageMaker

---

## Conclusion

This architecture provides a scalable, secure, and user-friendly foundation for the Qalb & Quran app. The modular design allows for incremental development while maintaining flexibility for future enhancements. The offline-first approach ensures users can access core features anytime, and the microservices architecture enables independent scaling and maintenance of different features.

The emphasis on privacy, cultural sensitivity, and community building is woven throughout the technical design, ensuring the app serves its target audience effectively while maintaining Islamic values and empowering young Muslim women in their spiritual journey.
