# Deployment Guide for Digital Ocean

## Prerequisites

1. **Digital Ocean Account**
   - Create account at https://www.digitalocean.com/
   - Add payment method

2. **GitHub Repository**
   - Your code must be in a GitHub repository
   - Repository: `dcastill92/appinfluencers`

3. **Required Configurations**
   - Stripe API keys (production)
   - Facebook App credentials
   - SMTP credentials (optional)

---

## Step 1: Create MySQL Database

1. Go to Digital Ocean Console → Databases
2. Click **Create Database Cluster**
3. Select:
   - **Engine**: MySQL 8
   - **Datacenter**: New York (or closest to your users)
   - **Plan**: Basic ($15/month for starter)
4. Name it: `appinfluencers-db`
5. Click **Create Database Cluster**
6. Wait for provisioning (~5 minutes)

### Configure Database Access

1. Once ready, go to **Users & Databases** tab
2. Create database: `db_appinfluencers`
3. Note the connection string (will be used automatically by App Platform)

---

## Step 2: Deploy via App Platform

### Option A: Using the Web Console

1. Go to Digital Ocean Console → Apps
2. Click **Create App**
3. Select **GitHub** as source
4. Authorize Digital Ocean to access your GitHub
5. Select repository: `dcastill92/appinfluencers`
6. Select branch: `main`
7. Click **Next**

Digital Ocean will auto-detect the `.do/app.yaml` file.

8. Review the configuration:
   - **API Service**: Running on port 8000
   - **Frontend Service**: Running on port 3000
   - **Database**: MySQL managed database

9. **IMPORTANT: Update Environment Variables**
   
   Go to **api** service → **Environment Variables**:
   
   ```bash
   # CRITICAL: Generate a new SECRET_KEY
   SECRET_KEY=<your-strong-random-secret-key>
   
   # Payment Provider Configuration
   # Configure your chosen payment provider credentials here
   
   # Instagram Access Token
   INSTAGRAM_ACCESS_TOKEN=<your-long-lived-token>
   
   # Email (if using Gmail)
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-gmail-app-password
   ```

10. Click **Next** → **Create Resources**

11. Wait for deployment (~10-15 minutes)

### Option B: Using doctl CLI

```bash
# Install doctl
brew install doctl  # macOS
# or download from https://docs.digitalocean.com/reference/doctl/

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml

# Get app ID
doctl apps list

# Update environment variables
doctl apps update <APP_ID> --spec .do/app.yaml
```

---

## Step 3: Configure Custom Domain (Optional)

1. Go to your app → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `appinfluencers.com`)
4. Digital Ocean will provide DNS records
5. Add these records to your domain registrar:
   ```
   Type: CNAME
   Name: @
   Value: <provided-by-digitalocean>.ondigitalocean.app
   ```
6. Wait for DNS propagation (~1 hour)
7. SSL certificate will be automatically provisioned

---

## Step 4: Run Database Migrations

After first deployment, you need to run migrations:

1. Go to your app → **api** service → **Console**
2. Click **Launch Console**
3. Run:
   ```bash
   alembic upgrade head
   ```

Or migrations should run automatically with the `run_command` in app.yaml.

---

## Step 5: Create Admin User

SSH into the API console and run:

```bash
python -c "
from app.core.database import async_session_maker
from app.models.user import User, UserRole
from app.core.security import get_password_hash
import asyncio

async def create_admin():
    async with async_session_maker() as db:
        admin = User(
            email='admin@appinfluencers.com',
            hashed_password=get_password_hash('AdminPassword123!'),
            full_name='Admin User',
            role=UserRole.ADMIN,
            is_active=True,
            is_approved=True
        )
        db.add(admin)
        await db.commit()
        print('Admin created!')

asyncio.run(create_admin())
"
```

Or use the Digital Ocean console to run this script.

---

## Step 6: Configure Social Media APIs for Production

### Facebook/Instagram

1. Go to https://developers.facebook.com/
2. Navigate to your app settings
3. Add production domains:
   - **App Domains**: `your-domain.com`
   - **Redirect URIs**: `https://your-domain.com/api/auth/facebook/callback`
4. Submit for App Review if needed
5. Update `.do/app.yaml` with production App ID and Secret

### TikTok (if using)

1. Go to https://developers.tiktok.com/
2. Create production app
3. Add production callback URL
4. Update credentials in `.do/app.yaml`

---

## Step 7: Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

---

## Cost Estimation

| Resource | Plan | Monthly Cost |
|----------|------|--------------|
| API Service | Basic ($5) | $5 |
| Frontend Service | Basic ($5) | $5 |
| MySQL Database | Basic ($15) | $15 |
| **Total** | | **$25/month** |

You can scale up later as needed.

---

## Monitoring & Logs

### View Logs
1. Go to your app → Select service (api/frontend)
2. Click **Runtime Logs** tab
3. Filter by log level

### Health Checks
- API: `https://your-api-url.ondigitalocean.app/health`
- Frontend: `https://your-frontend-url.ondigitalocean.app/`

### Alerts
1. Go to app → **Settings** → **Alerts**
2. Configure alerts for:
   - High error rate
   - Response time
   - Resource usage

---

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL is correctly set
echo $DATABASE_URL

# Test connection
python -c "from sqlalchemy import create_engine; engine = create_engine('$DATABASE_URL'); print(engine.connect())"
```

### Migration Issues
```bash
# Check current revision
alembic current

# Show migration history
alembic history

# Upgrade to head
alembic upgrade head
```

### CORS Issues
- Ensure `NEXT_PUBLIC_API_URL` points to correct API URL
- Check CORS settings in `app/main.py`

---

## Security Checklist

- [ ] Changed `SECRET_KEY` to strong random value
- [ ] Using production Stripe keys (not test keys)
- [ ] HTTPS enabled (automatic with Digital Ocean)
- [ ] Database backups enabled
- [ ] Environment variables stored as secrets
- [ ] Debug mode disabled (`DEBUG=false`)
- [ ] Social media APIs use production credentials
- [ ] Strong admin password set

---

## Updating the App

### Via Git Push
```bash
git add .
git commit -m "Update app"
git push origin main
```

Digital Ocean will automatically detect the push and redeploy.

### Manual Redeploy
1. Go to app → Click **Actions** → **Force Rebuild and Deploy**

---

## Backup Strategy

### Database Backups
- Digital Ocean automatically backs up MySQL daily
- Retention: 7 days (free tier)
- Access: Database → Settings → Backups

### Manual Backup
```bash
# Export database
doctl databases backup-export <database-id>
```

---

## Support

- Digital Ocean Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community/
- Ticket Support: Available with paid plans

---

## Next Steps

1. ✅ Deploy to Digital Ocean
2. ✅ Run migrations
3. ✅ Create admin user
4. ✅ Configure custom domain
5. ✅ Set up Stripe webhooks
6. ✅ Test all features in production
7. 📊 Set up monitoring and alerts
8. 🚀 Launch!
