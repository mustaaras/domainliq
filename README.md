# Domain Listing Site

A Next.js web application for listing domain names for sale. Users can browse domains, select them, and contact the seller via X (Twitter) DM with autofilled messages. Includes an admin panel for managing domains.

## Features

- Domain listings with prices
- User domain selection
- Share on X (Twitter)
- Direct message seller with selected domains
- Admin panel to add, delete, and mark domains as sold
- Sold domains shown as less visible

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the domain listings.

Visit [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

## API

- GET /api/domains - Get all domains
- POST /api/domains - Add a new domain
- PUT /api/domains - Update domain status
- DELETE /api/domains - Delete a domain

## Deploy on Vercel

Deploy using Vercel for easy hosting.
