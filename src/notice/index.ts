/**
 * Notice — registration.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type NoticeAttributes } from './edit';
import save from './save';
import './style.scss';

registerBlockType< NoticeAttributes >(
	metadata as unknown as BlockConfiguration< NoticeAttributes >,
	{
		edit: Edit,
		save,
	}
);
