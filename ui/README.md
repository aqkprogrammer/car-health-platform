# Car Health Platform

AI-Powered Used Car Health Report & Marketplace Platform

A modern Next.js application for generating comprehensive AI-powered health reports for used cars and providing a marketplace for verified vehicles.

## Features

- 🤖 **AI-Powered Analysis** - Advanced AI algorithms analyze vehicle history, condition, and market value
- ✅ **Verified Marketplace** - Browse verified vehicles with complete health reports
- 📊 **Detailed Reports** - Get insights on mechanical condition, accident history, maintenance records, and more

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint with Next.js config

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
car-health-platform/
├── src/
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── login/          # Authentication pages
│   │   ├── layout.tsx      # Root layout with AuthProvider
│   │   ├── page.tsx        # Homepage/landing page
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable React components
│   │   └── auth/          # Authentication components
│   │       ├── PhoneInput.tsx
│   │       ├── OTPInput.tsx
│   │       ├── EmailLogin.tsx
│   │       └── RoleSelection.tsx
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   └── hooks/              # Custom React hooks (for future use)
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── next.config.ts          # Next.js configuration
```

### Key Directories

- **`src/app/`** - Next.js App Router directory containing pages, layouts, and route handlers
- **`src/components/`** - Reusable UI components organized by feature
- **`src/contexts/`** - React Context providers for global state management
- **`src/lib/`** - Utility functions and helpers
- **`src/types/`** - Shared TypeScript type definitions
- **`src/hooks/`** - Custom React hooks (ready for future use)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
