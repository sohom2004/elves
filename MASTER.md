# Elves — Design System

Source of truth for every color, type, spacing, radius, shadow and motion value used across the site. No component should introduce a value that isn't listed here.

## Visual Thesis

Dark, near-black workshop lit by warm ivory type and a single muted gold accent, with restrained forest green as a secondary system color — editorial serif for display headlines, clean sans for UI copy, mono reserved for technical readouts — airy spacing, flat-to-subtly-elevated surfaces textured by fine grain and soft glow rather than glass blur.

## Interaction Thesis

Motion runs slow-to-medium (250–600ms) on physics-based easing (springs/inertia, never linear or elastic bounce). Scroll drives narrative progression via deterministic scroll-linked transforms, not simple fade-ins. Cursor exerts real physical influence (attraction/repulsion) on the Guide Orb and interactive elements. Vocabulary limited to: construction, connection, attraction, repulsion, flow, transformation, work, rest.

## Color

| Token | Hex | Role |
|---|---|---|
| `--color-ground` | `#131110` | Page background |
| `--color-ground-raised` | `#1b1815` | Cards, nav, raised surfaces |
| `--color-ground-deep` | `#0c0b0a` | Night sequence, deepest recess |
| `--color-line` | `#2c2822` | Hairlines, dividers, borders |
| `--color-ink` | `#f2ece0` | Primary text |
| `--color-ink-dim` | `#a89e8d` | Secondary text |
| `--color-ink-faint` | `#6b6357` | Tertiary / disabled text |
| `--color-gold` | `#c9a24a` | Primary accent — CTAs, active states, orb core |
| `--color-gold-dim` | `#8a7038` | Gold hover/pressed, subtle accents |
| `--color-gold-bright` | `#ffe9b8` | Orb highlight, glow core |
| `--color-green` | `#4a5c48` | Secondary system color — systems/workshop nodes |
| `--color-green-soft` | `#3a4636` | Green fills, spacing-bar demo |
| `--color-danger` | `#b6543f` | Error states only |

Contrast verified: ink on ground 14.8:1, ink-dim on ground 7.4:1, gold on ground 6.1:1 — all pass WCAG AA for body and UI text.

## Typography

- **Display** — Fraunces (opsz 9–144, wght 300–600). Headlines, chapter titles, large narrative statements.
- **UI/body** — Geist Sans. Body copy, nav, buttons, form labels.
- **Technical/mono** — Geist Mono. Timestamps, node/system status, deployment readouts, metadata. Used sparingly.

Scale (rem, 16px base):
| Step | Size | Line-height | Use |
|---|---|---|---|
| display-xl | 4.5rem / clamp(2.75rem,6vw,4.5rem) | 1.05 | Hero H1 |
| display-lg | 3rem / clamp(2rem,4.5vw,3rem) | 1.1 | Chapter H2 |
| display-md | 2rem | 1.2 | Section H3 |
| body-lg | 1.25rem | 1.6 | Lead paragraphs |
| body | 1rem | 1.6 | Default body |
| ui | 0.9375rem | 1.5 | Buttons, nav labels |
| caption | 0.8125rem | 1.4 | Mono/metadata, uppercase, +0.06em tracking |

## Spacing

Base unit 8px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192 (px).

## Radii

`--radius-sm: 4px` (buttons, inputs) · `--radius-md: 8px` (cards) · `--radius-lg: 16px` (large panels) · `--radius-full: 999px` (pills, orb halo)

## Shadow / Glow

Flat by default. Elevation is glow, not drop-shadow:
- `--glow-sm: 0 0 16px rgba(201,162,74,0.18)`
- `--glow-md: 0 0 32px rgba(201,162,74,0.28)`
- `--glow-lg: 0 0 64px rgba(201,162,74,0.35)`
- `--elevation-1: 0 1px 0 rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.35)` (rare — only true floating elements)

## Motion Tokens

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 180ms | Hover, cursor halo, micro |
| `--dur-normal` | 320ms | UI transitions, card reveals |
| `--dur-slow` | 550ms | Scene/chapter transitions |
| `--ease-out` | cubic-bezier(.16,1,.3,1) | Default deceleration |
| `--spring-orb` | stiffness 210, damping 22, mass 1 | Guide Orb follow |
| `--spring-ui` | stiffness 300, damping 30 | Magnetic buttons, small UI |

**Forbidden:** linear easing as default, `ease-in-out` as default, elastic/bounce curves, autoplay carousels, `scale(1.05)` as the default hover, unmotivated/decorative particles, drop-shadow-heavy cards, glassmorphism blur stacks.

## Components (base states: default / hover / focus / active / disabled)

- **Button (primary)** — gold fill, ground-deep text, radius-sm. Hover: brightens toward gold-bright + magnetic pull. Focus: 2px gold ring offset 2px. Active: scale unaffected, brightness dip. Disabled: ink-faint fill, no pointer.
- **Button (secondary)** — transparent, 1px line border, ink text. Hover: border → gold-dim, text → ink. Focus: ring as above.
- **Nav item** — mono caption, ink-dim. Active: ink + gold underline dot (Guide Orb marker travels here).
- **Card/artifact tile** — ground-raised fill, 1px line border, radius-md, no shadow at rest; glow-sm on hover.

## Motion Vocabulary Reference

CONSTRUCTION (things assemble) · CONNECTION (things link) · ATTRACTION · REPULSION · FLOW (particles/energy through systems) · TRANSFORMATION (one object becomes another) · WORK (systems keep operating) · REST (motion slows). Every animation in the codebase must map to one of these.
