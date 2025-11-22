# TinyLink – URL Shortener 

TinyLink is a lightweight URL shortener built with **Next.js**, **Prisma**, and **SQLite (local)**.  
Users can create short links, view stats, delete links, and track click counts.  


---

## 🚀 Features

### 🔗 Core Functionality
- Create short URLs from long URLs  
- Optional custom short code (6–8 characters, alphanumeric)  
- Global uniqueness check for custom codes  
- Redirect using `/:code` (HTTP 302)  
- Increment click count  
- Update last clicked timestamp  
- Delete links  
- Stats page for each link  

### 📊 Dashboard
- Shows all links  
- Columns:
  - Short code  
  - Target URL (truncated)  
  - Total clicks  
  - Last clicked time  
  - Actions (Copy, Open, Delete)  
- Search / filter links  
- Inline validation  
- Success & error states  

### 🩺 Healthcheck
Accessible at:


Returns system status, DB status, uptime, version, timestamp.

---

## 🛠️ Tech Stack

- **Next.js 16 (App Router)**
- **TailwindCSS**
- **Prisma ORM**
- **SQLite (development)**  
- **Node.js Runtime for Prisma routes**

---

## 📁 Project Structure

app/
├─ page.tsx → Dashboard
├─ healthz/route.ts → Healthcheck
├─ [code]/route.ts → Redirect handler
├─ code/[code]/page.tsx → Stats page

api/
├─ links/route.ts → Create + list links
└─ links/[code]/route.ts → Get + delete single link

lib/
└─ prisma.ts → Prisma client (Node runtime)

prisma/
├─ schema.prisma → Database schema
└─ migrations/ → Auto-generated

public/


---

## ⚙️ API Endpoints (Required by Assignment)

| Method | Path | Description |
|--------|------|-------------|
| **POST** | `/api/links` | Create a new short URL |
| **GET** | `/api/links` | List all links |
| **GET** | `/api/links/:code` | Get a single link + stats |
| **DELETE** | `/api/links/:code` | Delete a link |

### API Notes
- `POST /api/links` returns 409 if custom code exists  
- Codes must match:  


[A-Za-z0-9]{6,8}


---

## 🧪 Redirect Rules

Visiting:



/:code


→ Performs **HTTP 302 redirect**  
→ Increments click count  
→ Updates lastClickedAt timestamp  
→ Returns 404 if deleted or non-existent  

---

## 💾 Database Schema (Prisma)

```prisma
model Link {
  id            String   @id @default(cuid())
  code          String   @unique
  targetUrl     String
  clicks        Int      @default(0)
  lastClickedAt DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

📌 Environment Variables

Create a .env file:

DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"


See .env.example in the repo.

🧩 Running the Project Locally
1. Install dependencies
npm install

2. Initialize database
npx prisma migrate dev --name init

3. Start development server
npm run dev

4. Visit:

Dashboard → http://localhost:3000

Stats page → http://localhost:3000/code/:code

Redirect → http://localhost:3000/:code

Health → http://localhost:3000/healthz

🩺 Sample Healthcheck Response
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
