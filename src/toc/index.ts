/**
 * Table of Contents — registration.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import './style.scss';

registerBlockType(
	metadata as unknown as BlockConfiguration< Record< string, unknown > >,
	{
		edit: Edit,
		// Dynamic block: the outline is computed server-side on every
		// request (render.php), so it can never go stale.
		save: () => null,
	}
);
