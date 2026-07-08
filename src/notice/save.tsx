/**
 * Notice — save.
 *
 * Only inner content is serialized; the wrapper, role, and translated
 * label come from render.php on every request (so the label follows the
 * site language and the role can never be wrong in stored markup).
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function save() {
	return <InnerBlocks.Content />;
}
