=== Accessible Blocks ===
Contributors: breonwilliams
Tags: accessibility, blocks, wcag, contrast, headings
Requires at least: 6.9
Tested up to: 7.0
Requires PHP: 8.0
Stable tag: 0.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Accessibility-first blocks with WCAG-safe color contrast and unbreakable heading hierarchy — enforced by design, not left to the author.

== Description ==

Accessible Blocks is a native block library where accessibility is a guarantee, not an option:

* **WCAG-safe color contrast** — text/background pairings are validated against your theme's palette at author time and at render time. Failing combinations are corrected, not published.
* **Unbreakable heading hierarchy** — heading levels are derived from where a heading sits in the document, not hand-picked. Reordering and nesting can never skip a level or scramble your outline.
* **Semantic, keyboard-ready interactive blocks** — accordions and notices ship with correct ARIA roles and keyboard support built in.
* **Performance-correct media markup** — responsive images with explicit dimensions (no layout shift), smart loading priority, and enforced alt text.

The library coexists with core blocks and reads all colors, spacing, and typography from your theme — no hardcoded brand values, no external requests, no QA cleanup pass.

**Blocks (v1):** Section, Accessible Heading, Button/CTA, Card + Card Grid, Accordion, Notice/Callout, Media/Figure, Table of Contents — plus ready-made accessible patterns including a complete starter page.

== Frequently Asked Questions ==

= Does this replace core blocks? =

No. It is a focused set that mixes freely with core blocks. An Outline Checker panel even watches headings authored with the core Heading block.

= Does it phone home? =

No. The plugin makes zero external HTTP requests.

== Changelog ==

= 0.1.0 =
* Initial scaffold.
