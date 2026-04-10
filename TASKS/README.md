# Task Index - Skeleton Crew Frontend Site

## Phase 1: Foundation

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 001 | Design System - CSS Variables & Reset | Frontend | High | DONE | S | none |
| 002 | Design System - Global Styles | Frontend | High | DONE | S | 001 |
| 003 | Vendor GSAP Files | Architect | High | DONE | S | none |
| 004 | Ghost CMS Content Seeding - Tags | Architect | High | DONE | S | none |
| 005 | Ghost CMS Content Seeding - Portfolio Entry | Architect | Med | DONE | S | 004 |
| 006 | Ghost CMS Content Seeding - Pricing Tiers | Architect | Med | DONE | M | 004 |
| 007 | Ghost CMS Content Seeding - Site Content Pages | Architect | Med | DONE | M | 004 |

## Phase 2: Design Assets

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 010 | Logo SVG - Three Variants | Design | High | DONE | L | none |
| 011 | Favicon Generation | Design | Med | DONE | S | 010 |

## Phase 3: Core Page Structure

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 008 | Homepage HTML Shell & Hero Section | Frontend | High | DONE | M | 001, 002, 003 |
| 009 | Toggle Demo (CSS Swap + GSAP Transition) | Frontend | High | DONE | L | 008, 003 |
| 012 | Nav Component | Frontend | High | DONE | M | 008, 010 |
| 013 | "What We Do" Section | Frontend | Med | DONE | S | 008 |
| 014 | Portfolio Teaser Section | Frontend | Med | DONE | M | 008 |
| 015 | Pricing Preview Section | Frontend | Med | DONE | M | 008 |
| 016 | CTA Strip Section | Frontend | Low | DONE | S | 008 |
| 020 | Footer Component | Frontend | Med | DONE | S | 008, 010 |

## Phase 4: Ghost API Integration

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 023 | Ghost API Integration Module | Frontend | High | DONE | L | 005, 006, 007, 008 |
| 024 | Fallback Content Regeneration Script | Architect | Med | DONE | M | 023 |

## Phase 5: Additional Pages

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 017 | Work/Portfolio Page | Frontend | Med | DONE | M | 012, 020, 023 |
| 018 | Services Page | Frontend | Med | DONE | M | 012, 020, 023 |
| 022 | Contact Page | Frontend | Med | DONE | M | 012, 020 |

## Phase 6: Animations & Polish

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 019 | GSAP Animations (Scroll + Micro-interactions) | Frontend | Med | DONE | L | 003, 008, 013-016, 020 |
| 025 | Responsive Design Pass | Frontend | High | DONE | M | all page/component tasks |
| 021 | Before-Mode Test Script | Frontend | Med | DONE | M | 009, 025 |

## Phase 7: Final Integration

| ID | Title | Agent | Priority | Status | Effort | Dependencies |
|---|---|---|---|---|---|---|
| 026 | Cross-Page Integration & Link Verification | Frontend | High | DONE | S | 017, 018, 022 |
| 027 | README Documentation | Frontend | Med | DONE | M | 026 |
| 028 | Final QA & Performance Audit | Frontend | High | DONE | M | 025, 026, 027 |
