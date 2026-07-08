/**
 * WCAG 2.1 contrast engine — the shared core of Guarantee A.
 *
 * Every block that touches color consumes this module; none reimplement the
 * math. A PHP mirror (`includes/class-contrast.php`) applies the same rules
 * at render time, so the two implementations must stay in lockstep. If you
 * change a formula or threshold here, change it there.
 *
 * Math follows WCAG 2.1 (relative luminance + contrast ratio):
 * https://www.w3.org/WAI/WCAG21/Techniques/general/G17
 */

export interface RGB {
	r: number;
	g: number;
	b: number;
}

/**
 * A color entry as it appears in a theme.json palette.
 */
export interface PaletteColor {
	slug: string;
	color: string;
	name?: string;
}

export type WCAGLevel = 'AA' | 'AAA';

/**
 * WCAG 2.1 minimum contrast ratios.
 */
export const WCAG_THRESHOLDS: Record<
	WCAGLevel,
	{ normal: number; large: number }
> = {
	AA: { normal: 4.5, large: 3 },
	AAA: { normal: 7, large: 4.5 },
};

/**
 * Parse a CSS color string into RGB.
 *
 * Supports #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), and rgba() with numeric
 * components. Alpha is ignored: WCAG contrast is defined for opaque colors,
 * and palette colors are treated as rendered on an opaque surface. Returns
 * `null` for anything unparseable (hsl(), var(), named colors) so callers
 * can treat the color as "cannot verify" rather than guessing.
 * @param input
 */
export function parseColor( input: string ): RGB | null {
	const value = input.trim().toLowerCase();

	// CSS variable with a fallback — the format popular themes (Blocksy,
	// Astra, Kadence) use for their entire theme.json palette, e.g.
	// var(--theme-palette-color-1, #2872fa). The fallback is the theme's
	// canonical value, so parse it (recursively, for nested vars). A var()
	// without a fallback stays unverifiable → null.
	const varMatch = /^var\(\s*--[\w-]+\s*(?:,\s*(.+))?\)$/.exec( value );
	if ( varMatch ) {
		return varMatch[ 1 ] ? parseColor( varMatch[ 1 ] ) : null;
	}

	const hexMatch = /^#([0-9a-f]{3,8})$/.exec( value );
	if ( hexMatch && hexMatch[ 1 ] ) {
		const hex = hexMatch[ 1 ];
		if ( hex.length === 3 || hex.length === 4 ) {
			return {
				r: parseInt( hex[ 0 ]! + hex[ 0 ]!, 16 ),
				g: parseInt( hex[ 1 ]! + hex[ 1 ]!, 16 ),
				b: parseInt( hex[ 2 ]! + hex[ 2 ]!, 16 ),
			};
		}
		if ( hex.length === 6 || hex.length === 8 ) {
			return {
				r: parseInt( hex.slice( 0, 2 ), 16 ),
				g: parseInt( hex.slice( 2, 4 ), 16 ),
				b: parseInt( hex.slice( 4, 6 ), 16 ),
			};
		}
		return null;
	}

	const rgbMatch =
		/^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/][^)]*)?\)$/.exec(
			value
		);
	if ( rgbMatch ) {
		const [ , r, g, b ] = rgbMatch;
		const channels = [ Number( r ), Number( g ), Number( b ) ];
		if ( channels.some( ( c ) => c > 255 ) ) {
			return null;
		}
		return { r: channels[ 0 ]!, g: channels[ 1 ]!, b: channels[ 2 ]! };
	}

	return null;
}

/**
 * Serialize RGB to a #rrggbb hex string.
 * @param root0
 * @param root0.r
 * @param root0.g
 * @param root0.b
 */
export function toHex( { r, g, b }: RGB ): string {
	return (
		'#' +
		[ r, g, b ]
			.map( ( c ) =>
				Math.round( Math.min( 255, Math.max( 0, c ) ) )
					.toString( 16 )
					.padStart( 2, '0' )
			)
			.join( '' )
	);
}

/**
 * Relative luminance per WCAG 2.1.
 * @param root0
 * @param root0.r
 * @param root0.g
 * @param root0.b
 */
export function relativeLuminance( { r, g, b }: RGB ): number {
	const [ rs, gs, bs ] = [ r, g, b ].map( ( channel ) => {
		const c = channel / 255;
		return c <= 0.03928
			? c / 12.92
			: Math.pow( ( c + 0.055 ) / 1.055, 2.4 );
	} );
	return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

/**
 * Contrast ratio between two colors, 1–21.
 * @param a
 * @param b
 */
export function contrastRatio( a: RGB, b: RGB ): number {
	const la = relativeLuminance( a );
	const lb = relativeLuminance( b );
	const lighter = Math.max( la, lb );
	const darker = Math.min( la, lb );
	return ( lighter + 0.05 ) / ( darker + 0.05 );
}

/**
 * Does a ratio meet a WCAG level?
 *
 * @param ratio     Contrast ratio (1–21).
 * @param level     'AA' (default) or 'AAA'.
 * @param largeText Text ≥24px, or ≥18.66px bold (WCAG "large scale").
 */
export function meetsWCAG(
	ratio: number,
	level: WCAGLevel = 'AA',
	largeText = false
): boolean {
	const threshold =
		WCAG_THRESHOLDS[ level ][ largeText ? 'large' : 'normal' ];
	return ratio >= threshold;
}

export interface PairingResult {
	/** The chosen foreground. */
	foreground: PaletteColor;
	/** Contrast ratio of the chosen pairing. */
	ratio: number;
	/** True when the foreground came from the theme palette (vs. the black/white fallback). */
	fromPalette: boolean;
}

const FALLBACK_BLACK: PaletteColor = { slug: 'black', color: '#000000' };
const FALLBACK_WHITE: PaletteColor = { slug: 'white', color: '#ffffff' };

/**
 * Pick the best accessible foreground for a background.
 *
 * Strategy — "constrain, don't configure":
 * 1. Consider only palette colors that meet the minimum ratio against the
 *    background (unparseable palette entries are skipped, never guessed).
 * 2. Of those, return the highest-contrast option.
 * 3. If the palette offers nothing, fall back to black or white, whichever
 *    contrasts more. Black/white always yields ≥4.5:1 against any opaque
 *    color for at least one of the two… except mid-tone grays, where the
 *    better of the two is still returned along with its true ratio so the
 *    caller can surface a warning.
 *
 * @param background CSS color of the background.
 * @param palette    Theme palette to choose from.
 * @param minRatio   Minimum acceptable ratio (default WCAG AA normal text).
 */
export function pickAccessibleForeground(
	background: string,
	palette: PaletteColor[],
	minRatio: number = WCAG_THRESHOLDS.AA.normal
): PairingResult | null {
	const bg = parseColor( background );
	if ( ! bg ) {
		return null;
	}

	let best: PairingResult | null = null;

	for ( const candidate of palette ) {
		const fg = parseColor( candidate.color );
		if ( ! fg ) {
			continue;
		}
		const ratio = contrastRatio( fg, bg );
		if ( ratio >= minRatio && ( ! best || ratio > best.ratio ) ) {
			best = { foreground: candidate, ratio, fromPalette: true };
		}
	}

	if ( best ) {
		return best;
	}

	const blackRatio = contrastRatio( parseColor( '#000000' )!, bg );
	const whiteRatio = contrastRatio( parseColor( '#ffffff' )!, bg );

	return blackRatio >= whiteRatio
		? { foreground: FALLBACK_BLACK, ratio: blackRatio, fromPalette: false }
		: { foreground: FALLBACK_WHITE, ratio: whiteRatio, fromPalette: false };
}

/**
 * Validate an explicit foreground/background pairing.
 *
 * Returns the ratio and pass/fail per level, or `null` when either color
 * cannot be parsed (callers should treat that as "unverifiable", surface a
 * warning, and fall back to `pickAccessibleForeground`).
 * @param foreground
 * @param background
 * @param largeText
 */
export function validatePairing(
	foreground: string,
	background: string,
	largeText = false
): { ratio: number; aa: boolean; aaa: boolean } | null {
	const fg = parseColor( foreground );
	const bg = parseColor( background );
	if ( ! fg || ! bg ) {
		return null;
	}
	const ratio = contrastRatio( fg, bg );
	return {
		ratio,
		aa: meetsWCAG( ratio, 'AA', largeText ),
		aaa: meetsWCAG( ratio, 'AAA', largeText ),
	};
}
