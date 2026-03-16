# ScopeForge — Build Specification

## What We're Building
AI-powered proposal generation SaaS for digital agencies.
User pastes a client brief → AI generates complete scope, timeline, cost estimate, and proposal in 2 minutes.

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- PostgreSQL 17 with Drizzle ORM
- Better Auth (email + Google OAuth)
- Stripe (checkout + webhooks + customer portal)
- Anthropic Claude (primary AI) + OpenAI (fallback)
- @react-pdf/renderer (PDF export)
- Tailwind CSS + shadcn/ui style components
- Resend (transactional email)

## Tasks

- [x] 1. Create next.config.ts
- [x] 2. Create tsconfig.json
- [x] 3. Create tailwind.config.ts
- [x] 4. Create src/styles/globals.css
- [x] 5. Create drizzle.config.ts
- [x] 6. Create drizzle/schema.ts with all tables (users, organizations, brand_profiles, subscriptions, proposals, proposal_sections, scope_items, timeline_phases, usage_events)
- [x] 7. Run drizzle-kit push to create tables in PostgreSQL
- [x] 8. Create src/lib/db.ts (Drizzle client)
- [ ] 9. Create src/lib/auth.ts (Better Auth config with email + Google)
- [ ] 10. Create src/lib/stripe.ts (Stripe client + price IDs + plan limits)
- [ ] 11. Create src/lib/utils/cn.ts (className utility)
- [ ] 12. Create src/lib/utils/format.ts (currency, date formatters)
- [ ] 13. Create src/lib/ai/client.ts (Anthropic + OpenAI clients)
- [ ] 14. Create src/lib/ai/prompts/brief-analyzer.ts (system prompt for brief parsing)
- [ ] 15. Create src/lib/ai/prompts/scope-generator.ts (system prompt for WBS generation)
- [ ] 16. Create src/lib/ai/prompts/cost-estimator.ts (system prompt for effort estimation)
- [ ] 17. Create src/lib/ai/prompts/proposal-writer.ts (system prompt for proposal prose)
- [ ] 18. Create src/lib/ai/schemas/brief.ts (Zod schema for parsed brief)
- [ ] 19. Create src/lib/ai/schemas/scope.ts (Zod schema for scope items)
- [ ] 20. Create src/lib/ai/schemas/proposal.ts (Zod schema for full proposal)
- [ ] 21. Create src/lib/ai/chains/proposal-chain.ts (orchestrates full generation pipeline)
- [ ] 22. Create src/lib/pdf/proposal-template.tsx (React-PDF branded proposal)
- [ ] 23. Create src/lib/pdf/generate.ts (PDF generation function)
- [ ] 24. Create src/lib/upload/parse-pdf.ts
- [ ] 25. Create src/lib/upload/parse-docx.ts
- [ ] 26. Create src/app/layout.tsx (root layout)
- [ ] 27. Create src/app/page.tsx (landing/marketing page with hero, features, pricing, CTA)
- [ ] 28. Create src/app/marketing/pricing/page.tsx (full pricing page)
- [ ] 29. Create src/app/auth/login/page.tsx
- [ ] 30. Create src/app/auth/signup/page.tsx
- [ ] 31. Create src/app/api/auth/[...all]/route.ts (Better Auth handler)
- [ ] 32. Create src/app/dashboard/layout.tsx (sidebar + header)
- [ ] 33. Create src/app/dashboard/page.tsx (home: recent proposals, usage meter)
- [ ] 34. Create src/app/dashboard/proposals/page.tsx (list view)
- [ ] 35. Create src/app/dashboard/proposals/new/page.tsx (brief input + generation flow)
- [ ] 36. Create src/app/dashboard/proposals/[id]/page.tsx (view/edit proposal)
- [ ] 37. Create src/app/dashboard/brand/page.tsx (logo, colors, company info, default terms)
- [ ] 38. Create src/app/dashboard/billing/page.tsx (current plan, usage, upgrade CTA)
- [ ] 39. Create src/app/api/proposals/route.ts (GET list, POST create)
- [ ] 40. Create src/app/api/proposals/[id]/route.ts (GET, PATCH, DELETE)
- [ ] 41. Create src/app/api/proposals/[id]/generate/route.ts (POST — trigger AI generation, streaming SSE)
- [ ] 42. Create src/app/api/proposals/[id]/export/route.ts (POST — generate PDF, return download)
- [ ] 43. Create src/app/api/billing/checkout/route.ts (create Stripe checkout session)
- [ ] 44. Create src/app/api/billing/portal/route.ts (create Stripe portal session)
- [ ] 45. Create src/app/api/billing/webhook/route.ts (handle subscription events)
- [ ] 46. Create src/app/api/upload/route.ts (handle PDF/DOCX upload, return extracted text)
- [ ] 47. Create src/components/ui/button.tsx
- [ ] 48. Create src/components/ui/card.tsx
- [ ] 49. Create src/components/ui/input.tsx
- [ ] 50. Create src/components/ui/textarea.tsx
- [ ] 51. Create src/components/ui/badge.tsx
- [ ] 52. Create src/components/ui/skeleton.tsx
- [ ] 53. Create src/components/ui/progress.tsx
- [ ] 54. Create src/components/layout/sidebar.tsx
- [ ] 55. Create src/components/layout/header.tsx
- [ ] 56. Create src/components/marketing/hero.tsx
- [ ] 57. Create src/components/marketing/features.tsx
- [ ] 58. Create src/components/marketing/pricing-cards.tsx
- [ ] 59. Create src/components/proposals/brief-input.tsx
- [ ] 60. Create src/components/proposals/generation-progress.tsx
- [ ] 61. Create src/components/proposals/proposal-editor.tsx (section-by-section editing)
- [ ] 62. Create src/components/proposals/scope-table.tsx
- [ ] 63. Create src/components/proposals/proposal-preview.tsx
- [ ] 64. Create src/hooks/use-proposal.ts
- [ ] 65. Create src/hooks/use-generation.ts (SSE streaming hook)
- [ ] 66. Create src/hooks/use-subscription.ts
- [ ] 67. Create Dockerfile (multi-stage Next.js build)
- [ ] 68. Create docker-compose.yml (app + postgres)
- [ ] 69. Create Caddyfile (reverse proxy with auto HTTPS for peravine.tech)
- [ ] 70. Create .github/workflows/deploy.yml (build + push + deploy)
- [ ] 71. Create README.md (setup instructions)
- [ ] 72. Run `pnpm build` — must succeed with no errors
- [ ] 73. Create scripts/deploy.sh (production deployment)

## Environment Variables Needed
All in .env.local (already created with DATABASE_URL set).
Still need: ANTHROPIC_API_KEY, STRIPE keys (from Jered), BETTER_AUTH_SECRET, RESEND_API_KEY

## Database Connection
DATABASE_URL="postgresql://node@localhost:5432/scopeforge"
PostgreSQL is already running at localhost:5432

## Key Rules
- TypeScript strict mode throughout
- All AI calls use structured output (JSON schema / Zod)
- Streaming generation via Server-Sent Events
- Stripe webhooks handle all subscription state changes (idempotent)
- Never trust client-side subscription status — always check DB
- PDF generation is server-side only
- Free users get 3 proposals lifetime (no card required to try)
- Usage limits enforced server-side on generate endpoint
