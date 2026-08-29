# Deployment Guide

This guide details how to deploy the College Token Management System to production.

---

## Architecture Overview

- **Frontend:** Next.js deployed on **Vercel**
- **Backend:** Express.js API deployed on **Render** (or Railway / AWS / DigitalOcean)
- **Database:** **Google Sheets** via Google Cloud Service Account
- **Messaging:** **WhatsApp Business Cloud API** by Meta

---

## 1. Backend Deployment (Render.com)

1. Push your repository to GitHub / GitLab.
2. Log in to [Render](https://render.com/) and click **New > Web Service**.
3. Connect your repository.
4. Set the following options:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
5. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   JWT_SECRET=generate_a_64_char_random_string
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_admin_password
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   WHATSAPP_ACCESS_TOKEN=your_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_id
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
   WHATSAPP_API_VERSION=v19.0
   ```
6. Click **Deploy Web Service**.
7. Note your backend URL: `https://your-backend.onrender.com`.

---

## 2. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Import your Git repository.
3. In **Project Settings**:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend`
4. In **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
5. Click **Deploy**.

---

## 3. Seed the Initial Admin Account

Once both frontend and backend are live:

1. Make a single POST request to initialize the admin user:
   ```bash
   curl -X POST https://your-backend.onrender.com/api/admin/seed
   ```
2. You can now log in at `https://your-frontend.vercel.app/admin` using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` you configured.

---

## 4. Production Checklist

- [ ] `NODE_ENV=production` set on backend
- [ ] `JWT_SECRET` is strong and kept secret
- [ ] Google Sheets shared with Editor role to the Service Account
- [ ] CORS `FRONTEND_URL` points to the exact production Vercel domain
- [ ] WhatsApp webhook (optional) or outbound messaging token is verified
- [ ] Admin seed endpoint executed and admin credentials verified
- [ ] Test registration flow, PDF download, and QR verification on mobile
