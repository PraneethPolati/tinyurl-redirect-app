**TinyLink – URL Shortener**

TinyLink is a lightweight URL shortener built with Next.js, Prisma, and Neon Postgres (production).
Users can create short links, view stats, delete links, and track click counts.

**🚀 Features
🔗 Core Functionality**

Create short URLs from long URLs
Optional custom shortcode (6–8 alphanumeric characters)
Check uniqueness of custom codes (returns 409 if exists)
Redirect using /:code (HTTP 302)
Increment click count on every visit
Update lastClickedAt timestamp
Delete links
View stats for each link


**📊 Dashboard**
Displays all links
Columns:
Short code
Target URL (truncated)
Clicks
Last clicked time
Actions (Copy, Open, Delete)
Search / filter
Inline form validation
Success + error states
Responsive UI


**🩺 Healthcheck**
Route:/healthz
Returns:
System status
Database connectivity status
Uptime
Timestamp
Version

**🛠️ Tech Stack
Next.js 16 (App Router)
TailwindCSS
Prisma ORM
SQLite (local development)
Neon Postgres (production)
Node.js runtime for Prisma**

**📁 Project Structure**
app/
 ├─ page.tsx                 → Dashboard
 ├─ healthz/route.ts         → Healthcheck
 ├─ [code]/route.ts          → Redirect handler
 └─ code/[code]/page.tsx     → Stats page

app/api/
 ├─ links/route.ts           → Create + list links
 └─ links/[code]/route.ts    → Get + delete link

lib/
 └─ prisma.ts                → Prisma client

prisma/
 ├─ schema.prisma            → Database schema
 └─ migrations/              → Auto-generated

public/


**⚙️ API Endpoints**

| Method     | Path               | Description                                           |
| ---------- | ------------------ | ----------------------------------------------------- |
| **POST**   | `/api/links`       | Create new short URL (returns **409** if code exists) |
| **GET**    | `/api/links`       | List all links                                        |
| **GET**    | `/api/links/:code` | Get link details + stats                              |
| **DELETE** | `/api/links/:code` | Delete link                                           |


**Shortcode Rule**
[A-Za-z0-9]{6,8}

**🧪 Redirect Behavior**
Route:
/:code

Performs:
HTTP 302 redirect
Increment click count
Update lastClickedAt
Return 404 if deleted or not found


**💾 Database Schema (Prisma)**
model Link {
  id            String   @id @default(cuid())
  code          String   @unique
  targetUrl     String
  clicks        Int      @default(0)
  lastClickedAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}


**📌 Environment Variables
Local development:**
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"


**Production (Vercel):**
DATABASE_URL="postgresql://<Your Neon URL>?sslmode=require"
NEXT_PUBLIC_BASE_URL="https://your-vercel-url.vercel.app"


**▶️ Running Locally**
Install dependencies:
npm install

Initialize database:
npx prisma migrate dev --name init

Start server:
npm run dev

Open in browser:
Dashboard → http://localhost:3000
Stats → http://localhost:3000/code/:code
Redirect → http://localhost:3000/:code
Health → http://localhost:3000/healthz


**🩺 Sample Healthcheck Response**
{
  "ok": true,
  "version": "1.0",
  "system": {
    "status": "healthy",
    "environment": "development",
    "uptime_seconds": 125,
    "timestamp": "2025-11-21T14:45:55.123Z"
  },
  "database": {
    "status": "connected"
  }
}
