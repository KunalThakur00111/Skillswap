# SkillSwap Campus Backend API Checklist

## Health

GET /  
GET /api/health

## Auth

POST /api/auth/signup  
POST /api/auth/resend-verification-code  
POST /api/auth/verify-email  
POST /api/auth/login  
POST /api/auth/forgot-password  
POST /api/auth/reset-password  
PATCH /api/auth/change-password  
GET /api/auth/me  

## Users / Profile

GET /api/users/profile  
PUT /api/users/profile  
GET /api/users/mentors  
GET /api/users/mentors?skill=React  

## Sessions

POST /api/sessions/request  
GET /api/sessions  
PATCH /api/sessions/:id/accept  
PATCH /api/sessions/:id/reject  
PATCH /api/sessions/:id/cancel  
PATCH /api/sessions/:id/complete  

## Credits

GET /api/credits/transactions  

## Reviews

POST /api/reviews  
GET /api/reviews/my-given  
GET /api/reviews/mentor/:mentorId  

## Admin

GET /api/admin/stats  
GET /api/admin/users  
GET /api/admin/users?search=mentor  
PATCH /api/admin/users/:id/block  
PATCH /api/admin/users/:id/unblock  
PATCH /api/admin/users/:id/make-admin  
GET /api/admin/sessions  
GET /api/admin/sessions?status=completed  

## Scripts

npm run make-admin user@example.com