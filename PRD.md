# PM Analyzer - Product Requirements Document

## Overview
A "Cursor for PMs" SaaS that analyzes customer feedback and prioritizes features using AI and vector embeddings.

## Core Features
1.  **Project Management**: Create and manage product projects.
2.  **Feedback Ingestion**: Store customer feedback from various sources.
3.  **Vector Analysis**: Use AI embeddings to cluster feedback and identify themes.
4.  **Prioritization**: Auto-score features based on feedback density and strategic weights.
5.  **Authentication**: Secure user access via Better Auth.

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions/API
- **Database**: PostgreSQL with pgvector (Prisma ORM)
- **Auth**: Better Auth
- **AI**: OpenAI (Embeddings + Completion)
- **Payments**: Stripe
