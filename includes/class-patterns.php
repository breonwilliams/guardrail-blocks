<?php
/**
 * Block pattern registration.
 *
 * Patterns compose the block set into ready-made, guarantee-preserving
 * structures. Note that heading levels never appear in pattern markup —
 * they derive from Section nesting wherever the pattern is inserted.
 *
 * @package AccessibleBlocks
 */

declare( strict_types=1 );

namespace AccessibleBlocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the pattern category and all patterns.
 */
class Patterns {

	/**
	 * Attach WordPress hooks.
	 */
	public function register_hooks(): void {
		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register category + patterns.
	 */
	public function register(): void {
		if ( ! function_exists( 'register_block_pattern' ) ) {
			return;
		}

		register_block_pattern_category(
			'accessible-blocks',
			array( 'label' => __( 'Accessible Blocks', 'accessible-blocks' ) )
		);

		foreach ( $this->get_patterns() as $name => $pattern ) {
			register_block_pattern( 'accessible-blocks/' . $name, $pattern );
		}
	}

	/**
	 * Pattern definitions.
	 *
	 * @return array<string, array{title: string, description: string, categories: array, content: string}>
	 */
	private function get_patterns(): array {
		$hero = '<!-- wp:accessible-blocks/section {"headingLevel":2} -->
<section class="wp-block-accessible-blocks-section"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'A headline that welcomes everyone', 'accessible-blocks' ) . '"} /-->

<!-- wp:paragraph -->
<p>' . esc_html__( 'Introduce what you do in a sentence or two. This hero is a proper section with a derived H2 — reorder it anywhere and the outline stays valid.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph -->

<!-- wp:accessible-blocks/button {"text":"' . esc_attr__( 'Get started', 'accessible-blocks' ) . '","url":"#"} /--></section>
<!-- /wp:accessible-blocks/section -->';

		$feature_grid = '<!-- wp:accessible-blocks/section {"headingLevel":2} -->
<section class="wp-block-accessible-blocks-section"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'What you get', 'accessible-blocks' ) . '"} /-->

<!-- wp:accessible-blocks/card-grid -->
<div class="wp-block-accessible-blocks-card-grid"><!-- wp:accessible-blocks/card -->
<article class="wp-block-accessible-blocks-card"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'First feature', 'accessible-blocks' ) . '"} /-->

<!-- wp:paragraph -->
<p>' . esc_html__( 'Card titles are Accessible Headings, so they join the page outline at the correct level automatically.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph --></article>
<!-- /wp:accessible-blocks/card -->

<!-- wp:accessible-blocks/card -->
<article class="wp-block-accessible-blocks-card"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'Second feature', 'accessible-blocks' ) . '"} /-->

<!-- wp:paragraph -->
<p>' . esc_html__( 'The grid adapts to available space — no breakpoint settings to get wrong.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph --></article>
<!-- /wp:accessible-blocks/card -->

<!-- wp:accessible-blocks/card -->
<article class="wp-block-accessible-blocks-card"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'Third feature', 'accessible-blocks' ) . '"} /-->

<!-- wp:paragraph -->
<p>' . esc_html__( 'Everything inherits your theme’s colors and type, so nothing fights your design.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph --></article>
<!-- /wp:accessible-blocks/card --></div>
<!-- /wp:accessible-blocks/card-grid --></section>
<!-- /wp:accessible-blocks/section -->';

		$faq = '<!-- wp:accessible-blocks/section {"headingLevel":2} -->
<section class="wp-block-accessible-blocks-section"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'Frequently asked questions', 'accessible-blocks' ) . '"} /-->

<!-- wp:accessible-blocks/accordion -->
<div class="wp-block-accessible-blocks-accordion" data-wp-interactive="accessible-blocks/accordion"><!-- wp:accessible-blocks/accordion-item {"title":"' . esc_attr__( 'How does this work?', 'accessible-blocks' ) . '"} -->
<!-- wp:paragraph -->
<p>' . esc_html__( 'Each item is a real button inside a correctly-leveled heading, with keyboard support and screen-reader announcements built in.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph -->
<!-- /wp:accessible-blocks/accordion-item -->

<!-- wp:accessible-blocks/accordion-item {"title":"' . esc_attr__( 'Can I add more questions?', 'accessible-blocks' ) . '"} -->
<!-- wp:paragraph -->
<p>' . esc_html__( 'Yes — duplicate an item or add a new one; the semantics come along automatically.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph -->
<!-- /wp:accessible-blocks/accordion-item --></div>
<!-- /wp:accessible-blocks/accordion --></section>
<!-- /wp:accessible-blocks/section -->';

		$cta = '<!-- wp:accessible-blocks/section {"headingLevel":2} -->
<section class="wp-block-accessible-blocks-section"><!-- wp:accessible-blocks/heading {"content":"' . esc_attr__( 'Ready when you are', 'accessible-blocks' ) . '"} /-->

<!-- wp:paragraph -->
<p>' . esc_html__( 'One clear call to action, contrast-checked on every page view.', 'accessible-blocks' ) . '</p>
<!-- /wp:paragraph -->

<!-- wp:accessible-blocks/button {"text":"' . esc_attr__( 'Contact us', 'accessible-blocks' ) . '","url":"#"} /--></section>
<!-- /wp:accessible-blocks/section -->';

		return array(
			'hero'         => array(
				'title'       => __( 'Accessible hero', 'accessible-blocks' ),
				'description' => __( 'Headline, intro, and a contrast-safe call-to-action button.', 'accessible-blocks' ),
				'categories'  => array( 'accessible-blocks' ),
				'content'     => $hero,
			),
			'feature-grid' => array(
				'title'       => __( 'Feature card grid', 'accessible-blocks' ),
				'description' => __( 'Three cards whose titles join the heading outline automatically.', 'accessible-blocks' ),
				'categories'  => array( 'accessible-blocks' ),
				'content'     => $feature_grid,
			),
			'faq'          => array(
				'title'       => __( 'FAQ accordion', 'accessible-blocks' ),
				'description' => __( 'Questions and answers with correct disclosure semantics and keyboard support.', 'accessible-blocks' ),
				'categories'  => array( 'accessible-blocks' ),
				'content'     => $faq,
			),
			'cta-band'     => array(
				'title'       => __( 'Call-to-action band', 'accessible-blocks' ),
				'description' => __( 'A short pitch with a contrast-safe button.', 'accessible-blocks' ),
				'categories'  => array( 'accessible-blocks' ),
				'content'     => $cta,
			),
			'starter-page' => array(
				'title'       => __( 'Starter Brochure Page', 'accessible-blocks' ),
				'description' => __( 'A complete accessible page skeleton: hero, features, FAQ, and call to action — valid heading outline guaranteed.', 'accessible-blocks' ),
				'categories'  => array( 'accessible-blocks' ),
				'content'     => $hero . "\n\n" . $feature_grid . "\n\n" . $faq . "\n\n" . $cta,
			),
		);
	}
}
