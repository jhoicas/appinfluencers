# 🔧 Troubleshooting Guide

Common issues and solutions for AppInfluencers platform.

## 🚨 Deployment Issues

### Build Fails on Digital Ocean

**Symptom:** Build fails with dependency errors

**Solution:**
```bash
# Check requirements.txt versions
pip list --outdated

# Update specific package
pip install package-name==version

# Regenerate requirements.txt
pip freeze > requirements.txt
```

### Database Connection Failed

**Symptom:** `Can't connect to MySQL server`

**Solution:**
1. Verify DATABASE_URL format:
   ```
   mysql://username:password@host:port/database
   ```
2. Check database cluster is running
3. Verify IP allowlist includes App Platform
4. Test connection:
   ```bash
   mysql -h host -u username -p database
   ```

### Migrations Fail

**Symptom:** `alembic upgrade head` fails

**Solution:**
```bash
# Check current version
alembic current

# Show migration history
alembic history

# Rollback one version
alembic downgrade -1

# Force to specific version
alembic stamp head

# Then upgrade
alembic upgrade head
```

---

## 🔐 Authentication Issues

### 401 Unauthorized on Every Request

**Symptom:** User logged in but gets 401 errors

**Solutions:**

1. **Check cookie configuration:**
   ```python
   # In auth.py - ensure secure flag matches environment
   secure=settings.ENVIRONMENT == "production"
   ```

2. **Verify CORS settings:**
   ```python
   # In main.py
   allow_credentials=True  # Must be True
   ```

3. **Check token expiration:**
   ```python
   # In config.py
   ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours
   ```

4. **Browser cookies:**
   - Open DevTools → Application → Cookies
   - Check `access_token` exists
   - Verify domain matches

### Token Refresh Loop

**Symptom:** Constant redirect to login

**Solution:**
- Check `AuthContext.tsx` - should catch 401 and redirect once
- Verify interceptor in `api.ts` has `_retry` flag
- Clear browser cookies and localStorage

### CORS Errors

**Symptom:** `Access-Control-Allow-Origin` error

**Solution:**
```python
# Add frontend domain to CORS origins
allow_origins=[
    "https://your-frontend-domain.com",
    "https://*.ondigitalocean.app",
]
```

---

## 💳 Payment Processing

**Note:** Payment processing is not yet implemented. Choose and integrate your preferred payment provider (Stripe, Square, PayPal, etc.) based on your business requirements.

---

## 📱 Social Media Integration Issues

### Instagram Insights Not Loading

**Symptom:** `Failed to fetch insights` error

**Solutions:**

1. **Check access token:**
   ```bash
   curl "https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN"
   ```

2. **Token expired:**
   - Instagram tokens expire every 60 days
   - Generate new long-lived token
   - Update in environment variables

3. **Permissions missing:**
   - instagram_basic
   - instagram_manage_insights
   - pages_read_engagement

4. **Business account required:**
   - Personal accounts don't have insights API
   - Convert to Professional/Business account

### Facebook Login Not Working

**Symptom:** Redirect fails or shows error

**Solutions:**

1. **Check App Domains:**
   ```
   Facebook Developer Console → Settings → Basic
   App Domains: your-domain.com
   ```

2. **Valid OAuth Redirect URIs:**
   ```
   https://your-domain.com/api/auth/facebook/callback
   ```

3. **App in Development Mode:**
   - Add test users in Roles section
   - Or submit for App Review

---

## 🗄️ Database Issues

### Slow Queries

**Symptom:** API responses take >1 second

**Solutions:**

1. **Check indexes:**
   ```sql
   SHOW INDEX FROM users;
   SHOW INDEX FROM influencer_profiles;
   ```

2. **Add missing indexes:**
   ```sql
   CREATE INDEX idx_user_email ON users(email);
   CREATE INDEX idx_profile_user ON influencer_profiles(user_id);
   ```

3. **Optimize queries:**
   ```python
   # Use select_related/joinedload
   result = await db.execute(
       select(User).options(joinedload(User.profile))
   )
   ```

### Connection Pool Exhausted

**Symptom:** `Too many connections`

**Solution:**
```python
# In database.py
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)
```

---

## 🐳 Docker Issues

### Container Won't Start

**Symptom:** `docker-compose up` fails

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs api
   docker-compose logs frontend
   ```

2. **Port already in use:**
   ```bash
   # Find process using port 8000
   netstat -ano | findstr :8000  # Windows
   lsof -i :8000                  # Mac/Linux
   
   # Kill process or change port in docker-compose.yml
   ```

3. **Rebuild images:**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

### Volume Permission Issues

**Symptom:** `Permission denied` in container

**Solution:**
```dockerfile
# In Dockerfile
RUN chown -R node:node /app  # For Node
RUN chown -R www-data:www-data /app  # For Python
```

---

## 🌐 Frontend Issues

### Page Not Found (404)

**Symptom:** Routes return 404 in production

**Solution:**
```javascript
// Verify next.config.js
output: 'standalone',  // Required for Docker

// Check file structure
app/
  (plataforma)/
    influencer/
      dashboard/
        page.tsx  // Not page.ts or index.tsx
```

### Environment Variables Not Working

**Symptom:** `NEXT_PUBLIC_API_URL is undefined`

**Solutions:**

1. **Rebuild after changing .env:**
   ```bash
   npm run build
   ```

2. **Use NEXT_PUBLIC_ prefix for client-side:**
   ```bash
   # ✅ Correct
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # ❌ Wrong (only available server-side)
   API_URL=http://localhost:8000
   ```

3. **Pass as build args in Dockerfile:**
   ```dockerfile
   ARG NEXT_PUBLIC_API_URL
   ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
   ```

---

## 📊 Performance Issues

### High Memory Usage

**Symptom:** App crashes with OOM errors

**Solutions:**

1. **Increase instance size on Digital Ocean**
2. **Optimize queries (use pagination)**
3. **Add caching:**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def get_insights(profile_id: int):
       # ...
   ```

### Slow API Responses

**Solutions:**

1. **Enable gzip compression:**
   ```python
   from fastapi.middleware.gzip import GZipMiddleware
   app.add_middleware(GZipMiddleware, minimum_size=1000)
   ```

2. **Add database indexes**
3. **Use async/await properly**
4. **Implement caching**

---

## 🔍 Debugging Tips

### Enable Debug Logging

```python
# In main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check API Health

```bash
curl https://your-api.com/health
```

### View Container Logs

```bash
# Digital Ocean
doctl apps logs <app-id> --type run

# Docker
docker-compose logs -f api
```

### Database Inspection

```bash
# Connect to database
mysql -h host -u user -p database

# Show tables
SHOW TABLES;

# Check user data
SELECT * FROM users LIMIT 10;

# Check migrations
SELECT * FROM alembic_version;
```

---

## 🆘 Getting Help

If you're still stuck:

1. **Check logs first**
   - Backend: `docker logs influencers_api`
   - Frontend: Browser console (F12)
   - Database: Check query logs

2. **Search existing issues**
   - GitHub Issues
   - Stack Overflow

3. **Create detailed bug report:**
   - Error message
   - Steps to reproduce
   - Environment (OS, versions)
   - Logs

4. **Contact support:**
   - GitHub Issues: https://github.com/dcastill92/appinfluencers/issues
   - Email: [your-email]

---

## 📚 Useful Commands

```bash
# Generate SECRET_KEY
python app/scripts/generate_secret.py

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Test API endpoint
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Check Docker status
docker-compose ps

# Restart services
docker-compose restart api
docker-compose restart frontend

# Clean Docker
docker-compose down -v
docker system prune -a
```

---

💡 **Pro Tip:** Always check the logs first! Most issues can be diagnosed from error messages.
