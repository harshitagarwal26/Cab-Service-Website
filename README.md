# Cab Booking Monorepo

- Next.js 14 App Router, Tailwind CSS, Prisma, NextAuth (Credentials), Razorpay-ready.
- Apps:
  - apps/web (customer)
  - apps/admin (admin dashboard)
- Packages:
  - packages/db (Prisma + seeders)
  - packages/core (pricing engine)

## Quickstart
1) pnpm install
2) Copy .env.example files to .env in apps/web, apps/admin, packages/db
3) pnpm db:migrate
4) pnpm db:seed
5) pnpm dev (web at :3000, admin at :3001)
