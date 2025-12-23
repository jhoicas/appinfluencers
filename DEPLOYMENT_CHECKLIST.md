# Pre-Deployment Checklist ✅

Use this checklist before deploying to Digital Ocean:

## 🔒 Security

- [ ] Generate new SECRET_KEY using `python app/scripts/generate_secret.py`
- [ ] Update SECRET_KEY in Digital Ocean environment variables
- [ ] Verify DEBUG=false in production
- [ ] Change default admin password after first login
- [ ] Store all secrets as SECRET type in Digital Ocean

## 🗄️ Database

- [ ] Create PostgreSQL database cluster on Digital Ocean
- [ ] Database name: `dfkj68lnvi5nki`
- [ ] Enable automatic backups
- [ ] Note connection string

## 🌐 Domain & SSL

- [ ] Register domain (optional)
- [ ] Add CNAME record pointing to Digital Ocean app
- [ ] Wait for SSL certificate provisioning (automatic)
- [ ] Update CORS settings if using custom domain

## 🔌 Third-Party APIs

### Payment Provider
- [ ] Choose and configure your payment provider
- [ ] Get production API keys if applicable
- [ ] Configure webhook endpoints if needed
- [ ] Document the implementation

### Facebook/Instagram
- [ ] Update app domains in Facebook Developer Console
- [ ] Add production redirect URIs
- [ ] Request permissions if needed
- [ ] Generate long-lived access token for Instagram

### TikTok (if using)
- [ ] Create production TikTok app
- [ ] Add production callback URL
- [ ] Update credentials

## 📧 Email (Optional)

- [ ] Configure SMTP settings
- [ ] Test email sending
- [ ] Set up email templates

## 🚀 Deployment

- [ ] Push code to GitHub main branch
- [ ] Create app on Digital Ocean from `.do/app.yaml`
- [ ] Verify all environment variables
- [ ] Wait for build completion
- [ ] Check deployment logs

## ✅ Post-Deployment

- [ ] Run database migrations (automatic with run_command)
- [ ] Create admin user via console
- [ ] Test login functionality
- [ ] Test profile creation (Influencer & Empresa)
- [ ] Test social media insights fetching
- [ ] Verify all API endpoints
- [ ] Set up monitoring and alerts
- [ ] Test from different devices/browsers

## 📊 Monitoring

- [ ] Enable runtime logs
- [ ] Set up error alerts
- [ ] Configure uptime monitoring
- [ ] Set up database performance monitoring

## 💰 Cost Management

Current estimate: ~$25/month
- API Service: $5/month
- Frontend Service: $5/month
- PostgreSQL Database: $15/month

- [ ] Review pricing
- [ ] Set up billing alerts
- [ ] Plan for scaling if needed

## 🔄 CI/CD

- [ ] Enable auto-deploy from GitHub
- [ ] Test deployment pipeline
- [ ] Document rollback process

## 📝 Documentation

- [ ] Update README with production URLs
- [ ] Document environment variables
- [ ] Create user guide
- [ ] Document API endpoints

---

## Quick Commands

Generate SECRET_KEY:
```bash
python app/scripts/generate_secret.py
```

Test API health:
```bash
curl https://your-api-url.ondigitalocean.app/health
```

View logs:
```bash
doctl apps logs <app-id> --type run
```

Force redeploy:
```bash
doctl apps create-deployment <app-id>
```

---

## Support Resources

- [Digital Ocean Docs](https://docs.digitalocean.com/products/app-platform/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Next.js Production](https://nextjs.org/docs/deployment)

---

🎉 **Ready to deploy!** Follow the detailed guide in `DEPLOY_DIGITALOCEAN.md`
