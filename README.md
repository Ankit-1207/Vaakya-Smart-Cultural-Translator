# Vaakya-MLOps: Smart Cultural Translator

A full-stack MLOps project for intelligent translation services with user authentication, history tracking, and AI-powered translations.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| Docker | Latest |
| Docker Compose | Latest |

### Running the Project

#### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Ankit-1207/Vaakya-Smart-Cultural-Translator.git
cd Vaakya-Smart-Cultural-Translator

# Start all services
docker-compose up --build
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│         http://localhost:3000 (default port)            │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP API
┌─────────────────────────▼───────────────────────────────┐
│                   Backend (FastAPI)                      │
│         http://localhost:8000 (default port)           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   /auth     │  │ /translate │  │    /health     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   Database (SQLAlchemy)                 │
│                    (Async with SQLite)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Translation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/translate` | Translate text |
| GET | `/api/translate/history` | Get translation history |

### Supported Translation Languages

The translation API accepts either language codes or language names for `target_language`.

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `hi` | Hindi |
| `kn` | Kannada |
| `te` | Telugu |
| `de` | German |
| `ja` | Japanese |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🖥️ Frontend Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/login` | User login page |
| Register | `/register` | User registration page |
| Dashboard | `/dashboard` | Main dashboard |
| Translate | `/translate` | Translation interface |
| History | `/history` | Translation history |

---

## 🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL=sqlite+aiosqlite:///./vaakya.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=your-bucket-name
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🐳 Docker Services

The `docker-compose.yml` includes:

| Service | Port | Description |
|---------|------|-------------|
| backend | 8000 | FastAPI server |
| frontend | 3000 | Next.js application |

---

## 📁 Project Structure

```
Vaakya-Smart-Cultural-Translator/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Config & security
│   │   ├── db/           # Database
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   └── lib/          # Utilities
│   ├── package.json
│   └── Dockerfile
├── dataset/
│   └── idioms.json       # Idioms dataset
├── docker-compose.yml
├── dvc.yaml
└── idioms.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| Backend | FastAPI, Python 3.10+ |
| Frontend | Next.js 16, React 19 |
| Database | SQLAlchemy (Async) |
| Authentication | JWT |
| Data Versioning | DVC |
| Containerization | Docker |

---

## 📝 API Request Examples

### Register User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "John Doe"}'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Translate

```bash
curl -X POST http://localhost:8000/api/translate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "Hello", "target_language": "hi"}'
```

---

## 🔐 Security Notes

- ⚠️ CORS is currently set to allow all origins (`["*"]`) for development
- ⚠️ Update CORS settings before deploying to production
- ⚠️ Use strong SECRET_KEY in production
- ⚠️ Store sensitive credentials in environment variables

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ankit-1207**
- GitHub: https://github.com/Ankit-1207

---

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- Next.js for the React framework
- DVC for data version control
