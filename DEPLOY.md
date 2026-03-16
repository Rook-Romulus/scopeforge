# ScopeForge Deployment Guide

## Current State (as of 2026-03-17)
- App: running on localhost:3000 (PID tracked at /tmp/scopeforge.log)
- Caddy: running, serving peravine.tech → localhost:3000 (PID at /tmp/caddy.log)
- PostgreSQL: running at localhost:5432, database: scopeforge
- Config: /data/.openclaw/workspace/ventures/scopeforge/.env.local

## To Go Fully Live (checklist for Jered)

### 1. DNS — Point peravine.tech to this server
In Hostinger DNS panel:
- A record: @ → 187.77.156.124
- A record: www → 187.77.156.124
- Delete the existing parked-page A record pointing to Hostinger's servers

### 2. Stripe — Add payment keys
Get from: https://dashboard.stripe.com/apikeys

Add to .env.local:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...   # from Stripe webhook dashboard
STRIPE_PRICE_STARTER=price_...   # create 3 products in Stripe first
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_AGENCY=price_...
```

Create Stripe products:
- Starter: $49/month recurring
- Growth: $149/month recurring  
- Agency: $349/month recurring

Set webhook endpoint: https://peravine.tech/api/billing/webhook
Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, checkout.session.completed

### 3. Resend — Transactional email (optional but recommended)
Sign up at resend.com, add API key:
```
RESEND_API_KEY=re_...
```

### 4. Restart app after env changes
```bash
pkill -f "server.js" || true
cd /data/.openclaw/workspace/ventures/scopeforge
PORT=3000 HOSTNAME=0.0.0.0 nohup node .next/standalone/server.js > /tmp/scopeforge.log 2>&1 &
```

### 5. Restart script (save as /data/start-scopeforge.sh)
```bash
#!/bin/bash
# Start PostgreSQL
/home/linuxbrew/.linuxbrew/opt/postgresql@17/bin/pg_ctl -D /data/pgdata -l /data/pgdata/postgresql.log start

# Start app
cd /data/.openclaw/workspace/ventures/scopeforge
source .env.local
PORT=3000 HOSTNAME=0.0.0.0 nohup node .next/standalone/server.js > /tmp/scopeforge.log 2>&1 &

# Start Caddy
nohup caddy run --config /data/Caddyfile > /tmp/caddy.log 2>&1 &
```

## App URLs
- Landing: https://peravine.tech
- Sign up: https://peravine.tech/auth/signup
- Dashboard: https://peravine.tech/dashboard

## What's built
- Landing page with pricing
- Email/password auth (Better Auth)
- AI proposal generation (Claude claude-sonnet-4-5 via streaming SSE)
- Proposals list + detail view with scope table + timeline
- Dashboard with usage tracking
- Stripe checkout + customer portal + webhook handler
- PostgreSQL with full schema (users, orgs, proposals, billing)

## What's NOT yet built (Phase 2)
- PDF export endpoint (/api/proposals/[id]/export)
- Brand profile page (UI exists, save route needed)
- Client shareable link
- Email notifications (Resend integration)
- Proposal analytics
