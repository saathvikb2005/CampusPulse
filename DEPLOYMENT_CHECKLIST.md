# 📋 Deployment Checklist

## ✅ Pre-Deployment
- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Database user has proper permissions
- [ ] IP whitelist includes 0.0.0.0/0 (or Render's IPs)
- [ ] Connection string is ready

## ✅ Backend Deployment
- [ ] Create new Web Service on Render
- [ ] Set Name: `campuspulse-backend`
- [ ] Set Environment: `Node`
- [ ] Set Root Directory: `Backend`
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Add all environment variables:
  - [ ] NODE_ENV=production
  - [ ] MONGODB_URI=your-connection-string
  - [ ] JWT_SECRET=your-jwt-secret
  - [ ] JWT_REFRESH_SECRET=your-refresh-secret
  - [ ] CORS_ORIGIN=your-frontend-url
  - [ ] CLIENT_URL=your-frontend-url
- [ ] Deploy and verify health check works

## ✅ AI Service Deployment  
- [ ] Create new Web Service on Render
- [ ] Set Name: `campuspulse-ai-recommender`
- [ ] Set Environment: `Python`
- [ ] Set Root Directory: `Ai_recommender`
- [ ] Set Build Command: `pip install -r requirements.txt`
- [ ] Set Start Command: `python app.py`
- [ ] Add environment variables:
  - [ ] FLASK_ENV=production
  - [ ] MONGO_URI=your-connection-string
  - [ ] MONGODB_URI=your-connection-string
  - [ ] CORS_ORIGINS=frontend-url,backend-url
- [ ] Deploy and verify health check works

## ✅ Post-Deployment
- [ ] Test backend health: `/health` endpoint
- [ ] Test AI service health: `/health` endpoint
- [ ] Update frontend with production API URLs
- [ ] Test full application functionality
- [ ] Monitor service logs for errors

## 🔗 URLs to Update
After deployment, update these in your frontend:
- Backend API: `https://campuspulse-backend.onrender.com`
- AI Service: `https://campuspulse-ai-recommender.onrender.com`

## 🎯 Success Criteria
- [ ] Both services show "healthy" status
- [ ] Frontend can connect to both services
- [ ] Database operations work correctly
- [ ] AI recommendations are being generated
- [ ] No CORS errors in browser console