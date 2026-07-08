/**
 * Accessible Button — registration.
 */
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import './style.scss';

registerBlockType( metadata.name, {
	edit: Edit,
	// Dynamic block: markup comes from render.php so colors are
	// re-validated against the live theme palette on every request.
	save: () => null,
} );
