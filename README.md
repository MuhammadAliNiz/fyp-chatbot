# 🩺 Medical RAG Chatbot - Final Year Project

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)](https://www.postgresql.org/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-purple.svg)](https://www.pinecone.io/)
[![Spring AI](https://img.shields.io/badge/Spring%20AI-Latest-brightgreen.svg)](https://spring.io/projects/spring-ai)

An intelligent medical chatbot system that uses **Retrieval-Augmented Generation (RAG)** to provide accurate medical information based on uploaded PDF documents. The system combines the power of **Spring AI**, **Pinecone Vector Database**, and **Large Language Models** to create a reliable medical knowledge assistant.

## 🌟 Features

### 🤖 **Intelligent Medical Chatbot**
- **RAG-powered responses** using uploaded medical documents
- **Context-aware conversations** with chat history
- **Real-time streaming responses** for better user experience
- **Medical document understanding** through advanced embeddings

### 📄 **Document Management**
- **PDF upload and processing** with automatic text extraction
- **Vector embeddings generation** using state-of-the-art models
- **Chunking strategy** for optimal retrieval performance
- **Multiple document support** for comprehensive knowledge base

### 🔐 **Advanced Authentication & Authorization**
- **JWT-based authentication** with refresh token mechanism
- **Role-based access control** (USER, ADMIN)
- **Secure password management** with encryption
- **Session management** with automatic token refresh

### 👨‍💼 **Admin Dashboard**
- **User management** with role assignments
- **System monitoring** and health checks
- **Vector database management** and testing
- **Upload statistics** and system metrics

### 🎨 **Modern Frontend**
- **React 19** with modern hooks and context API
- **Tailwind CSS** for responsive design
- **Real-time UI updates** with seamless user experience
- **Dark/Light theme support**

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Spring Boot API │────│   PostgreSQL    │
│   (Port 5173)    │    │   (Port 8080)    │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
         │              ┌─────────────────┐              
         │              │   Pinecone      │              
         └──────────────│  Vector Store   │              
                        │   (Cloud)       │              
                        └─────────────────┘              
                                 │                       
                        ┌─────────────────┐              
                        │   Groq/OpenAI   │              
                        │      LLM        │              
                        └─────────────────┘              
```

## 🚀 Quick Start

### Prerequisites
- **Java 21** or higher
- **Node.js 18** or higher
- **PostgreSQL 12** or higher
- **Maven 3.6** or higher
- **Pinecone account** (for vector storage)
- **Groq API key** (for LLM access)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/medical-rag-chatbot.git
cd medical-rag-chatbot
```

### 2. Database Setup
```sql
-- Create PostgreSQL database
CREATE DATABASE myapp;
CREATE USER admin WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE myapp TO admin;
```

### 3. Backend Configuration

#### Environment Setup
1. Copy the environment template:
```bash
cd chatbot-sb
cp .env.example .env
```

2. Fill in your actual API keys and credentials in `.env`:
```bash
# Required API Keys
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_PROJECT_ID=your_pinecone_project_id_here

# Database Configuration
DB_PASSWORD=your_secure_database_password

# Security
JWT_SECRET_KEY=your_secure_jwt_secret_32_chars_minimum
```

3. Get your API keys:
   - **Groq API**: [console.groq.com](https://console.groq.com/)
   - **Pinecone**: [app.pinecone.io](https://app.pinecone.io/)

> 📋 **See [ENVIRONMENT_SETUP.md](chatbot-sb/ENVIRONMENT_SETUP.md) for detailed configuration guide**

### 4. Start Backend
```bash
cd chatbot-sb
./mvnw spring-boot:run
```

### 5. Start Frontend
```bash
cd chatbot-react
npm install
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 📚 API Documentation

### 🔐 Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/authenticate
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
```

### 🤖 Chat Endpoints

#### Send Chat Message
```http
POST /api/chat
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "message": "What are the symptoms of diabetes?",
  "sessionId": "uuid-session-id"
}
```

#### Get Chat History
```http
GET /api/chat/history/{sessionId}
Authorization: Bearer <access_token>
```

#### List Chat Sessions
```http
GET /api/chat/sessions
Authorization: Bearer <access_token>
```

### 📄 PDF Management Endpoints

#### Upload Single PDF
```http
POST /api/admin/upload-pdf
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

file: <pdf_file>
```

#### Upload Multiple PDFs
```http
POST /api/admin/upload-multiple-pdfs
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

files: <pdf_files[]>
```

### 👨‍💼 Admin Endpoints

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

#### Test Vector Store
```http
GET /api/admin/test-vectorstore
Authorization: Bearer <admin_token>
```

#### User Management
```http
GET /api/admin/users
POST /api/admin/users/{userId}/role
DELETE /api/admin/users/{userId}
Authorization: Bearer <admin_token>
```

## 🛠️ Technology Stack

### Backend
- **Spring Boot 3.5.5** - Main framework
- **Spring AI** - AI integration and RAG implementation
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database operations
- **PostgreSQL** - Primary database
- **Pinecone** - Vector database for embeddings
- **Apache Tika** - PDF text extraction
- **Lombok** - Code generation
- **Jakarta Validation** - Input validation

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router Dom 7** - Client-side routing
- **Tailwind CSS 4** - Styling framework
- **Axios** - HTTP client
- **Heroicons** - Icon library
- **JS Cookie** - Cookie management

### AI & ML
- **Groq API** - Large Language Model (Llama 3.1)
- **OpenAI API** - Alternative LLM support
- **Pinecone Vector Database** - Similarity search
- **Spring AI Embeddings** - Document vectorization
- **RAG Pipeline** - Retrieval-augmented generation

## 🏗️ Project Structure

```
medical-rag-chatbot/
├── chatbot-sb/                 # Spring Boot Backend
│   ├── src/main/java/com/ali/chatbotsb/
│   │   ├── config/            # Configuration classes
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Data repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # Security configuration
│   │   └── utils/             # Utility classes
│   └── src/main/resources/
│       └── application.properties
├── chatbot-react/             # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React contexts
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── config/            # Configuration
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend root:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/myapp
DB_USERNAME=admin
DB_PASSWORD=password123

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=900000

# Pinecone
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east-1-aws
PINECONE_INDEX=chatbot1

# AI Model
GROQ_API_KEY=your-groq-api-key
```

### Default Admin User

A default admin user is created on startup:
- **Email**: `admin@admin.com`
- **Password**: `admin123`

> ⚠️ **Security Note**: Change the default admin credentials in production!

## 🧪 Testing

### Backend Tests
```bash
cd chatbot-sb
./mvnw test
```

### Frontend Tests
```bash
cd chatbot-react
npm test
```

## 📈 Performance & Monitoring

### Logging
- **Application logs** with different levels (DEBUG, INFO, WARN, ERROR)
- **Request/Response logging** for API monitoring
- **Vector store operation logs** for debugging

### Health Checks
- **Database connectivity** monitoring
- **Vector store health** checks
- **AI model availability** verification

### Metrics
- **Upload statistics** tracking
- **User activity** monitoring
- **Response time** measurements

## 🔒 Security Features

### Authentication
- **JWT tokens** with configurable expiration
- **Refresh token** mechanism for seamless user experience
- **Password encryption** using BCrypt
- **Role-based authorization** (USER, ADMIN)

### API Security
- **CORS configuration** for cross-origin requests
- **Request validation** using Jakarta Bean Validation
- **SQL injection protection** through JPA
- **XSS protection** with proper data sanitization

## 🚧 Development Guide

### Adding New Features

1. **Backend**: Create DTOs, update services, add controller endpoints
2. **Frontend**: Create components, update services, add routing
3. **Database**: Update entities, create migrations if needed
4. **Testing**: Add unit and integration tests

### Code Standards

- **Java**: Follow Spring Boot best practices
- **React**: Use functional components with hooks
- **API**: RESTful design with proper HTTP status codes
- **Documentation**: Keep README and API docs updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Muhammad Ali Nizamani** - *Initial work* - [Your GitHub Profile](https://github.com/muhammadaliniz)

## 🙏 Acknowledgments

- **Spring AI Team** for the excellent AI integration framework
- **Pinecone** for providing reliable vector database services
- **Groq** for fast and efficient LLM API
- **OpenAI** for advancing the field of AI
- **React Team** for the fantastic frontend framework

## 📞 Support

If you have any questions or need help with the project:

1. Check the [Issues](https://github.com/muhammadaliniz/fyp-chatbot/issues) page
2. Create a new issue with detailed description
3. Join our [Discussions](https://github.com/muhammadaliniz/fypchatbot/discussions)

---

**⚡ Built with ❤️ for the medical community**

> This project aims to make medical information more accessible through AI-powered assistance while maintaining accuracy and reliability through document-based retrieval.
