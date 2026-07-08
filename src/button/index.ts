/**
 * Accessible Button — registration.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type ButtonAttributes } from './edit';
import './style.scss';

// The JSON import widens literals (e.g. "type": "string" becomes plain
// string), so the metadata needs an assertion to match BlockConfiguration.
// Safe: block.json is validated against the schema referenced in the file.
registerBlockType< ButtonAttributes >(
	metadata as unknown as BlockConfiguration< ButtonAttributes >,
	{
		edit: Edit,
		// Dynamic block: markup comes from render.php so colors are
		// re-validated against the live theme palette on every request.
		save: () => null,
	}
);
