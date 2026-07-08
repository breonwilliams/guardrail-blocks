/**
 * Jest suite for the contrast engine (Guarantee A core).
 *
 * The PHP mirror (includes/class-contrast.php) implements the same cases;
 * keep the expected values in sync.
 */
import {
	contrastRatio,
	meetsWCAG,
	parseColor,
	pickAccessibleForeground,
	relativeLuminance,
	toHex,
	validatePairing,
	type PaletteColor,
} from './contrast';

describe( 'parseColor', () => {
	it( 'parses 6-digit hex', () => {
		expect( parseColor( '#1a2b3c' ) ).toEqual( { r: 26, g: 43, b: 60 } );
	} );

	it( 'parses 3-digit hex', () => {
		expect( parseColor( '#fff' ) ).toEqual( { r: 255, g: 255, b: 255 } );
		expect( parseColor( '#000' ) ).toEqual( { r: 0, g: 0, b: 0 } );
	} );

	it( 'parses 8-digit hex, ignoring alpha', () => {
		expect( parseColor( '#ff000080' ) ).toEqual( { r: 255, g: 0, b: 0 } );
	} );

	it( 'parses rgb() and rgba()', () => {
		expect( parseColor( 'rgb(255, 0, 0)' ) ).toEqual( {
			r: 255,
			g: 0,
			b: 0,
		} );
		expect( parseColor( 'rgba(0, 128, 255, 0.5)' ) ).toEqual( {
			r: 0,
			g: 128,
			b: 255,
		} );
	} );

	it( 'is case-insensitive and trims whitespace', () => {
		expect( parseColor( '  #ABCDEF ' ) ).toEqual( {
			r: 171,
			g: 205,
			b: 239,
		} );
	} );

	it( 'returns null for unparseable values instead of guessing', () => {
		expect( parseColor( 'var(--wp--preset--color--primary)' ) ).toBeNull();
		expect( parseColor( 'hsl(0, 100%, 50%)' ) ).toBeNull();
		expect( parseColor( 'tomato' ) ).toBeNull();
		expect( parseColor( '#12345' ) ).toBeNull();
		expect( parseColor( 'rgb(300, 0, 0)' ) ).toBeNull();
		expect( parseColor( '' ) ).toBeNull();
	} );
} );

describe( 'toHex', () => {
	it( 'round-trips and clamps', () => {
		expect( toHex( { r: 26, g: 43, b: 60 } ) ).toBe( '#1a2b3c' );
		expect( toHex( { r: 300, g: -5, b: 0 } ) ).toBe( '#ff0000' );
	} );
} );

describe( 'relativeLuminance', () => {
	it( 'matches WCAG reference values', () => {
		expect( relativeLuminance( { r: 0, g: 0, b: 0 } ) ).toBe( 0 );
		expect( relativeLuminance( { r: 255, g: 255, b: 255 } ) ).toBe( 1 );
		// Pure red per WCAG: 0.2126.
		expect( relativeLuminance( { r: 255, g: 0, b: 0 } ) ).toBeCloseTo(
			0.2126,
			4
		);
	} );
} );

describe( 'contrastRatio', () => {
	it( 'is 21:1 for black on white', () => {
		expect(
			contrastRatio( { r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 } )
		).toBeCloseTo( 21, 5 );
	} );

	it( 'is 1:1 for identical colors', () => {
		const c = { r: 128, g: 64, b: 32 };
		expect( contrastRatio( c, c ) ).toBeCloseTo( 1, 5 );
	} );

	it( 'is symmetric', () => {
		const a = { r: 10, g: 20, b: 30 };
		const b = { r: 200, g: 210, b: 220 };
		expect( contrastRatio( a, b ) ).toBeCloseTo(
			contrastRatio( b, a ),
			10
		);
	} );

	it( 'matches a known reference pairing', () => {
		// #767676 on #ffffff is the classic "exactly AA" gray: 4.54:1.
		expect(
			contrastRatio( parseColor( '#767676' )!, parseColor( '#ffffff' )! )
		).toBeCloseTo( 4.54, 2 );
	} );
} );

describe( 'meetsWCAG', () => {
	it( 'applies AA thresholds', () => {
		expect( meetsWCAG( 4.5 ) ).toBe( true );
		expect( meetsWCAG( 4.49 ) ).toBe( false );
		expect( meetsWCAG( 3, 'AA', true ) ).toBe( true );
		expect( meetsWCAG( 2.99, 'AA', true ) ).toBe( false );
	} );

	it( 'applies AAA thresholds', () => {
		expect( meetsWCAG( 7, 'AAA' ) ).toBe( true );
		expect( meetsWCAG( 6.99, 'AAA' ) ).toBe( false );
		expect( meetsWCAG( 4.5, 'AAA', true ) ).toBe( true );
	} );
} );

describe( 'pickAccessibleForeground', () => {
	const palette: PaletteColor[] = [
		{ slug: 'primary', color: '#1e3a8a', name: 'Primary' }, // dark blue
		{ slug: 'secondary', color: '#93c5fd', name: 'Secondary' }, // light blue
		{ slug: 'base', color: '#ffffff', name: 'Base' },
		{ slug: 'contrast', color: '#111111', name: 'Contrast' },
	];

	it( 'picks the highest-contrast passing palette color', () => {
		const result = pickAccessibleForeground( '#ffffff', palette )!;
		expect( result.fromPalette ).toBe( true );
		expect( result.foreground.slug ).toBe( 'contrast' );
		expect( result.ratio ).toBeGreaterThanOrEqual( 4.5 );
	} );

	it( 'picks a light foreground for a dark background', () => {
		const result = pickAccessibleForeground( '#1e3a8a', palette )!;
		expect( result.fromPalette ).toBe( true );
		expect( [ 'base', 'secondary' ] ).toContain( result.foreground.slug );
		expect( result.ratio ).toBeGreaterThanOrEqual( 4.5 );
	} );

	it( 'falls back to black/white when the palette has no passing color', () => {
		const cramped: PaletteColor[] = [
			{ slug: 'a', color: '#888888' },
			{ slug: 'b', color: '#999999' },
		];
		const result = pickAccessibleForeground( '#8a8a8a', cramped )!;
		expect( result.fromPalette ).toBe( false );
		expect( [ 'black', 'white' ] ).toContain( result.foreground.slug );
	} );

	it( 'falls back to black/white for an empty palette', () => {
		const onWhite = pickAccessibleForeground( '#ffffff', [] )!;
		expect( onWhite.foreground.color ).toBe( '#000000' );
		expect( onWhite.ratio ).toBeCloseTo( 21, 5 );

		const onBlack = pickAccessibleForeground( '#000000', [] )!;
		expect( onBlack.foreground.color ).toBe( '#ffffff' );
	} );

	it( 'skips unparseable palette entries rather than failing', () => {
		const messy: PaletteColor[] = [
			{ slug: 'weird', color: 'var(--brand)' },
			{ slug: 'contrast', color: '#111111' },
		];
		const result = pickAccessibleForeground( '#ffffff', messy )!;
		expect( result.foreground.slug ).toBe( 'contrast' );
	} );

	it( 'returns null for an unparseable background', () => {
		expect( pickAccessibleForeground( 'var(--bg)', palette ) ).toBeNull();
	} );

	it( 'still yields AA pairs on an all-dark palette (edge-case checklist)', () => {
		const dark: PaletteColor[] = [
			{ slug: 'ink', color: '#0b0b0f' },
			{ slug: 'charcoal', color: '#1f2933' },
			{ slug: 'slate', color: '#323f4b' },
		];
		const result = pickAccessibleForeground( '#0b0b0f', dark )!;
		// Nothing in the palette passes → white fallback with a huge ratio.
		expect( result.fromPalette ).toBe( false );
		expect( result.foreground.color ).toBe( '#ffffff' );
		expect( result.ratio ).toBeGreaterThanOrEqual( 4.5 );
	} );
} );

describe( 'validatePairing', () => {
	it( 'reports ratio and both levels', () => {
		const result = validatePairing( '#000000', '#ffffff' )!;
		expect( result.ratio ).toBeCloseTo( 21, 5 );
		expect( result.aa ).toBe( true );
		expect( result.aaa ).toBe( true );
	} );

	it( 'fails AA for known-bad pairings', () => {
		// Light gray on white — a classic real-world failure.
		const result = validatePairing( '#cccccc', '#ffffff' )!;
		expect( result.aa ).toBe( false );
	} );

	it( 'honors the large-text thresholds', () => {
		// #949494 on white ≈ 3.03:1 — passes AA large, fails AA normal.
		const result = validatePairing( '#949494', '#ffffff', true )!;
		expect( result.aa ).toBe( true );
		expect( validatePairing( '#949494', '#ffffff' )!.aa ).toBe( false );
	} );

	it( 'returns null when either color is unverifiable', () => {
		expect( validatePairing( 'var(--x)', '#ffffff' ) ).toBeNull();
		expect( validatePairing( '#ffffff', 'oklch(0.5 0.1 200)' ) ).toBeNull();
	} );
} );
