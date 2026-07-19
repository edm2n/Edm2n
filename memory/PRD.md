# PRD - دليل مطر الإلكتروني

## Original Problem Statement
Comprehensive Arabic RTL toolkit website "دليل مطر الإلكتروني" with 80+ calculators and tools. Footer says "برمجة وتصميم مطر الموايقي" and clicking that name opens a contact modal. Contact: twitter @edm2n, email edm2n@msn.com.

## Architecture
- **Frontend**: React 19 + React Router v7 + Tailwind + Shadcn UI + Framer Motion
- **Backend**: FastAPI + Motor (MongoDB async) + httpx for proxying external APIs
- **DB**: MongoDB (contacts collection)
- **External APIs (proxied via backend)**: Aladhan (prayer times), fawazahmed0/currency-api (currency + XAU gold)

## User Personas
- Arabic-speaking users in KSA/GCC region looking for quick daily calculators
- Muslim users needing Islamic tools (prayer, hijri, tasbih, adhkar, qibla)
- Students needing GPA / weighted percentage / final grade calc
- Employees needing salary/finance calculators (loan, end-of-service, zakat)
- Developers needing dev tools (JSON, Base64, UUID, QR)

## Core Requirements (Static)
- RTL Arabic-first UI with Alexandria font
- Emerald green + gold accent theme with light/dark toggle
- 80+ tools organized by 12 categories (Finance, Islamic, Health, Education, Converters, Dev, Fun, Cars, Comm, Files, Text, Misc)
- Contact modal triggered by clicking "مطر الموايقي" in footer — saves to MongoDB
- PWA-ready with manifest.json + "add to home screen" prompt
- data-testid on all interactive elements
- Share buttons on results (WhatsApp, Twitter, native share, copy)

## What's Been Implemented (2026-02)
- 83 tools registered and functional across all 12 categories
- Home page with hero, category filters, search modal
- Individual tool pages via /tool/:slug routing
- Contact form saves to MongoDB contacts collection
- Static pages: /about, /faq, /privacy, /terms, /links
- Dark mode toggle with localStorage persistence
- Currency/Gold/Prayer times via backend proxy endpoints
- Full RTL Arabic layout with Alexandria + Amiri fonts
- Share bar on calculator results (WhatsApp, Twitter, copy, native)
- Bug fixes: gold-price formula (removed erroneous inversion), a11y DialogTitle on search modal

## P0 Backlog (High Priority)
- QR code reader (needs camera permission)
- Real prayer times notifications/alarms
- Google Analytics + Search Console integration
- Screenshot/image export of calculator results
- Full Islamic inheritance calculator (currently simplified for common cases)

## P1 Backlog
- More file format converters (PDF↔Word natively, currently links to external services)
- Comparison tools (phones, cars, offers)
- Health tools: pediatric dosage, blood pressure classifier, HbA1c
- More entertainment: Wheel of Fortune spinner UI improvements
- URL shortener (needs API key)
- Google Translate integration

## P2 Backlog
- AI-powered bio generator, hashtag generator (needs Emergent LLM key)
- Advanced sound alerts for pomodoro/prayer times
- Multi-language: also English mode

## Next Tasks (post first-finish)
- Add share-as-image (html2canvas) for tool results
- Add more categories: SEO tools, Comparison tools
- Enable Emergent LLM integration for AI-powered tools if requested
