# SaaS AI Email Generator

## Features

✅ AI Email generation using OpenAI  
✅ Credit system per user  
✅ Google login (NextAuth)  
✅ Prisma (PostgreSQL)  

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev


## Additional Setup

- Run: `npx prisma migrate dev --name add-credits` to update your database.
- Ensure your database URL in `.env` is set.
