# 🔐 Environment Configuration Guide

This guide explains how to set up environment variables for the Medical RAG Chatbot backend.

## 🚨 Security Notice

**NEVER commit API keys, passwords, or secrets to version control!**

The `application.properties` file now uses environment variables for all sensitive configuration. This ensures:
- ✅ **Security**: No hardcoded secrets in code
- ✅ **Flexibility**: Different configs for dev/staging/prod
- ✅ **Team Safety**: Each developer uses their own credentials

## 📁 Files Overview

| File | Purpose | Commit to Git? |
|------|---------|----------------|
| `.env.example` | Template with all required variables | ✅ Yes |
| `.env` | Your actual environment variables | ❌ **NO** |
| `application.properties` | Spring Boot config using env vars | ✅ Yes |

## 🛠️ Setup Instructions

### 1. Copy Environment Template
```bash
cd chatbot-sb
cp .env.example .env
```

### 2. Fill in Your Values
Edit `.env` file with your actual credentials:

```bash
# Required: Get from https://console.groq.com/
GROQ_API_KEY=your_actual_groq_api_key_here

# Required: Get from https://app.pinecone.io/
PINECONE_API_KEY=your_actual_pinecone_api_key_here
PINECONE_PROJECT_ID=your_actual_project_id_here

# Required: Generate secure JWT secret
JWT_SECRET_KEY=your_secure_random_32_char_secret_here

# Required: Your database credentials
DB_PASSWORD=your_actual_database_password
```

### 3. Generate Secure JWT Secret
```bash
# Option 1: Using OpenSSL
openssl rand -hex 32

# Option 2: Online generator
# Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### 4. Verify Configuration
Start your application and check logs for any missing environment variables.

## 🔑 Required API Keys

### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Navigate to API Keys section
4. Create new API key
5. Copy the key starting with `gsk_...`

### Pinecone API Key
1. Visit [Pinecone Console](https://app.pinecone.io/)
2. Sign up/Login
3. Go to API Keys section
4. Create new API key
5. Copy the key starting with `pcsk_...`
6. Also copy your Project ID from the dashboard

## 🗄️ Database Setup

### Local PostgreSQL
```sql
-- Create database and user
CREATE DATABASE myapp;
CREATE USER admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE myapp TO admin;
```

### Environment Variables
```bash
DB_URL=jdbc:postgresql://localhost:5432/myapp
DB_USERNAME=admin
DB_PASSWORD=your_secure_password
```

## 🌍 Environment-Specific Configuration

### Development
```bash
# .env (local development)
JPA_DDL_AUTO=update
JPA_SHOW_SQL=true
LOG_LEVEL_APP=DEBUG
```

### Production
```bash
# Production environment variables
JPA_DDL_AUTO=validate
JPA_SHOW_SQL=false
LOG_LEVEL_APP=INFO
LOG_LEVEL_PINECONE=WARN

# Use strong, unique values
JWT_SECRET_KEY=super_secure_production_secret_64_chars_minimum
DB_PASSWORD=very_strong_production_password
```

## 🐳 Docker Configuration

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DB_URL=jdbc:postgresql://db:5432/myapp
      - DB_USERNAME=admin
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - PINECONE_PROJECT_ID=${PINECONE_PROJECT_ID}
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

## ☁️ Cloud Deployment

### Heroku
```bash
# Set environment variables
heroku config:set GROQ_API_KEY=your_key
heroku config:set PINECONE_API_KEY=your_key
heroku config:set JWT_SECRET_KEY=your_secret
```

### AWS/Azure/GCP
Use their respective secret management services:
- **AWS**: Secrets Manager / Parameter Store
- **Azure**: Key Vault
- **GCP**: Secret Manager

## 🧪 Testing Configuration

### Verify Environment Variables
```bash
# Check if variables are loaded
echo $GROQ_API_KEY
echo $PINECONE_API_KEY
```

### Test Application Startup
```bash
./mvnw spring-boot:run
```

Look for logs indicating successful configuration:
```
✅ Database connection: CONNECTED
✅ Groq API: AUTHENTICATED
✅ Pinecone: CONNECTED to index 'chatbot1'
```

## 🚫 Common Issues

### Missing Environment Variables
**Error**: `Could not resolve placeholder 'GROQ_API_KEY'`
**Solution**: Ensure `.env` file exists and variable is set

### Invalid API Keys
**Error**: `401 Unauthorized` from Groq/Pinecone
**Solution**: Verify API keys are correct and active

### Database Connection Failed
**Error**: `Connection refused` to PostgreSQL
**Solution**: 
1. Check PostgreSQL is running
2. Verify connection details in `.env`
3. Ensure database exists

### JWT Secret Too Short
**Error**: `JWT secret key must be at least 32 characters`
**Solution**: Generate longer secret using `openssl rand -hex 32`

## 📝 Environment Variables Reference

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq LLM API key | `gsk_...` |
| `PINECONE_API_KEY` | Pinecone vector DB key | `pcsk_...` |
| `PINECONE_PROJECT_ID` | Pinecone project ID | `0c6aed47-...` |
| `JWT_SECRET_KEY` | JWT signing secret | 32+ char string |
| `DB_PASSWORD` | Database password | Secure password |

### Optional Variables (with defaults)
| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/myapp` | Database URL |
| `DB_USERNAME` | `admin` | Database username |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | LLM model |
| `PINECONE_INDEX_NAME` | `chatbot1` | Vector index name |
| `MAX_FILE_SIZE` | `100MB` | Upload limit |

## 🔒 Security Best Practices

1. **Rotate Keys Regularly**: Change API keys every 90 days
2. **Use Different Keys**: Separate keys for dev/staging/prod
3. **Monitor Usage**: Track API key usage for anomalies
4. **Limit Permissions**: Use least-privilege principle
5. **Backup Safely**: Store backup keys in secure location
6. **Team Access**: Use shared secret management for teams

## 📞 Support

If you have issues with environment setup:
1. Check this guide first
2. Verify all required variables are set
3. Test each service independently
4. Create GitHub issue with error details

---

**Last Updated**: September 3, 2025
