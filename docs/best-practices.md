# Engineering Best Practices

## Code Style
- Use TypeScript for all new code.
- Prefer functional components with Hooks.
- Use `shadcn/ui` components for UI consistency.
- Follow the "colocation" principle: keep tests and components close (or in `tests/` for integration).

## Database (Prisma)
- Always run `npx prisma migrate dev` for schema changes.
- Use `pgvector` for embedding columns; ensure dimensions match model (1536 for OpenAI).
- Do not commit `.env` files.

## Testing (Vitest)
- Write TDD tests before implementation.
- Run `npm test` locally before pushing.
- Mock external services (OpenAI, Stripe) in tests.

## Git Workflow
- Feature branches: `feat/feature-name`.
- Commit messages: Conventional Commits (`feat:`, `fix:`, `chore:`).
