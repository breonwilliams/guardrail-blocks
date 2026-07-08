/**
 * E2E — Guarantee A: the Button's background picker only offers the
 * theme palette, and picking any background surfaces a passing contrast
 * ratio with an auto-selected text color.
 */
import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'Accessible Button contrast enforcement', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost( { postType: 'page' } );
	} );

	test( 'picking a palette background shows a passing AA ratio', async ( {
		editor,
		page,
	} ) => {
		await editor.insertBlock( {
			name: 'accessible-blocks/button',
			attributes: { text: 'Get started' },
		} );

		// Open the block inspector via the store — robust across WP
		// versions (top-bar toggle labels change between releases).
		await page.evaluate( () => {
			const w = window as any;
			w.wp.data
				.dispatch( 'core/interface' )
				.enableComplementaryArea( 'core', 'edit-post/block' );
			// Older editors use the scoped store name.
			w.wp.data
				.dispatch( 'core/interface' )
				.enableComplementaryArea( 'core/edit-post', 'edit-post/block' );
		} );

		// The color options are palette swatches — no custom color input.
		const swatches = page.locator(
			'.components-circular-option-picker__option'
		);
		await expect( swatches.first() ).toBeVisible();
		// Let the sidebar's slide-in animation finish; the swatch click's
		// actionability check otherwise reports "not stable" forever.
		await page.waitForTimeout( 750 );

		// Pick every swatch in turn: each must produce an AA-passing badge.
		// The badge Notice re-renders the panel on each pick, so clicks
		// bypass the stability check — the assertions are outcome-based.
		const count = await swatches.count();
		expect( count ).toBeGreaterThan( 0 );

		for ( let i = 0; i < count; i++ ) {
			await swatches.nth( i ).click( { force: true } );
			await expect(
				page.getByText( /Contrast [\d.]+:1 — AA ✓/ )
			).toBeVisible();
		}

		// No unconstrained color input exists anywhere in the panel.
		await expect(
			page.locator( 'input[type="text"][aria-label*="Hex" i]' )
		).toHaveCount( 0 );
	} );
} );
