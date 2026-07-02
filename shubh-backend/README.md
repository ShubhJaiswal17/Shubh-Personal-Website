# Shubh Jaiswal — Portfolio Backend

Production-ready Express.js + MongoDB backend.

---

## Quick Start

```bash
cp .env.example .env       # Fill in your values
npm install
npm run dev                # Development with nodemon
npm start                  # Production
```

---

## Folder Structure

```
shubh-backend/
├── config/
│   ├── db.js              # MongoDB connection with retry logic
│   └── jwt.js             # JWT config (secrets, expiry, cookie options)
├── controllers/
│   ├── auth.controller.js       # Register, login, refresh, logout, me
│   ├── blog.controller.js       # Full CRUD + search + tags + featured
│   ├── category.controller.js   # Category CRUD
│   ├── newsletter.controller.js # Subscribe, confirm, unsubscribe, admin list
│   ├── project.controller.js    # Project CRUD + reorder
│   ├── contact.controller.js    # Contact form + admin message management
│   └── analytics.controller.js  # Dashboard stats
├── middleware/
│   ├── auth.js            # protect (JWT verify) + restrictTo (RBAC)
│   ├── errorHandler.js    # Global error handler (classifies Mongoose/JWT errors)
│   ├── rateLimiter.js     # Auth / contact / newsletter specific limiters
│   └── validate.js        # Joi schema validation factory
├── models/
│   ├── User.js            # bcrypt, refresh tokens, password reset
│   ├── Post.js            # Full-text index, slug, readTime auto-calc
│   ├── Category.js        # Slug auto-generation
│   ├── Project.js         # Portfolio projects
│   ├── Newsletter.js      # Double opt-in + unsubscribe tokens
│   ├── Contact.js         # Contact messages
│   └── Analytics.js       # Daily view tracking per post
├── routes/
│   ├── auth.routes.js
│   ├── blog.routes.js
│   ├── category.routes.js
│   ├── newsletter.routes.js
│   ├── project.routes.js
│   ├── contact.routes.js
│   └── analytics.routes.js
├── services/
│   └── emailService.js    # Nodemailer (contact notify + newsletter confirm)
├── utils/
│   ├── AppError.js        # Operational error class
│   ├── catchAsync.js      # Async controller wrapper
│   ├── apiResponse.js     # Standardised response helpers
│   └── jwtUtils.js        # Sign/verify access+refresh tokens, cookie helpers
├── validators/
│   └── schemas.js         # All Joi validation schemas
├── .env.example
├── .gitignore
├── railway.toml           # Railway.app deploy config
├── package.json
└── server.js              # Entry point
```

---

## API Reference

All routes prefixed with `/api`

### Auth — `/api/auth`

| Method | Route               | Auth     | Description          |
|--------|---------------------|----------|----------------------|
| POST   | /register           | Public   | Create user account  |
| POST   | /login              | Public   | Login, get tokens    |
| POST   | /refresh            | Cookie   | Refresh access token |
| POST   | /logout             | Bearer   | Logout, clear cookie |
| GET    | /me                 | Bearer   | Get current user     |
| PATCH  | /me                 | Bearer   | Update profile       |
| PATCH  | /change-password    | Bearer   | Change password      |
| POST   | /create-admin       | Secret   | Create admin user    |

### Blog — `/api/blog`

| Method | Route              | Auth       | Description          |
|--------|--------------------|------------|----------------------|
| GET    | /                  | Public     | List posts           |
| GET    | /search?q=         | Public     | Full-text search     |
| GET    | /tags              | Public     | All tags with counts |
| GET    | /featured          | Public     | Featured posts       |
| GET    | /:slug             | Public     | Single post          |
| GET    | /:id/related       | Public     | Related posts        |
| PATCH  | /:id/view          | Public     | Increment view       |
| POST   | /                  | Admin      | Create post          |
| PUT    | /:id               | Admin      | Update post          |
| DELETE | /:id               | Admin      | Delete post          |

### Categories — `/api/categories`

| Method | Route   | Auth   | Description       |
|--------|---------|--------|-------------------|
| GET    | /       | Public | All categories    |
| GET    | /:slug  | Public | Single category   |
| POST   | /       | Admin  | Create            |
| PUT    | /:id    | Admin  | Update            |
| DELETE | /:id    | Admin  | Delete            |

### Newsletter — `/api/newsletter`

| Method | Route                      | Auth   | Description           |
|--------|----------------------------|--------|-----------------------|
| POST   | /subscribe                 | Public | Subscribe (rate-ltd)  |
| GET    | /confirm/:token            | Public | Confirm subscription  |
| DELETE | /unsubscribe/:token        | Public | Unsubscribe           |
| GET    | /                          | Admin  | List subscribers      |
| GET    | /stats                     | Admin  | Subscriber stats      |

### Projects — `/api/projects`

| Method | Route      | Auth   | Description    |
|--------|------------|--------|----------------|
| GET    | /          | Public | All projects   |
| GET    | /:id       | Public | Single project |
| POST   | /          | Admin  | Create         |
| PUT    | /:id       | Admin  | Update         |
| DELETE | /:id       | Admin  | Delete         |
| PATCH  | /reorder   | Admin  | Reorder        |

### Contact — `/api/contact`

| Method | Route       | Auth   | Description      |
|--------|-------------|--------|------------------|
| POST   | /           | Public | Send message     |
| GET    | /           | Admin  | All messages     |
| PATCH  | /:id/read   | Admin  | Mark as read     |
| DELETE | /:id        | Admin  | Delete message   |

### Analytics — `/api/analytics`

| Method | Route      | Auth  | Description         |
|--------|------------|-------|---------------------|
| GET    | /overview  | Admin | Dashboard stats     |
| GET    | /posts     | Admin | Top posts by views  |
| GET    | /visitors  | Admin | Daily visitor graph |

---

## Authentication Flow

```
1. POST /api/auth/login
   → Returns: { accessToken } + sets httpOnly refreshToken cookie

2. Use accessToken in: Authorization: Bearer <accessToken>

3. When 401 received:
   → POST /api/auth/refresh (cookie sent automatically)
   → Returns: new { accessToken }

4. POST /api/auth/logout
   → Clears cookie, invalidates refresh token
```

---

## Security Features

- Helmet.js (security headers)
- CORS with explicit origin whitelist
- MongoDB injection prevention (express-mongo-sanitize)
- Rate limiting (global + per-endpoint)
- JWT access tokens (15m) + httpOnly refresh cookies (7d)
- Refresh token rotation + reuse detection
- bcrypt (12 salt rounds)
- Joi validation on all inputs
- Operational vs programming error separation
- No stack traces in production

---

## Deployment (Railway)

1. Push to GitHub
2. Connect repo on [railway.app](https://railway.app)
3. Add environment variables from `.env.example`
4. Railway auto-deploys on push to `main`
