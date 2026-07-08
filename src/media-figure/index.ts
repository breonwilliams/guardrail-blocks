/**
 * Media Figure — registration.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type MediaFigureAttributes } from './edit';
import './style.scss';

registerBlockType< MediaFigureAttributes >(
	metadata as unknown as BlockConfiguration< MediaFigureAttributes >,
	{
		edit: Edit,
		// Dynamic: wp_get_attachment_image() builds the markup per request
		// from current attachment metadata (render.php).
		save: () => null,
	}
);
