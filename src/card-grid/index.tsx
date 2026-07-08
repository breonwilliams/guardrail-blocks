/**
 * Card Grid — registration (edit + save are simple enough to co-locate).
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import metadata from './block.json';
import './style.scss';

const TEMPLATE: Array< [ string, Record< string, unknown >? ] > = [
	[ 'accessible-blocks/card' ],
	[ 'accessible-blocks/card' ],
	[ 'accessible-blocks/card' ],
];

function Edit() {
	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ 'accessible-blocks/card' ],
		template: TEMPLATE,
		orientation: 'horizontal',
	} );

	return <div { ...innerBlocksProps } />;
}

function save() {
	const blockProps = useBlockProps.save();
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );
	return <div { ...innerBlocksProps } />;
}

registerBlockType(
	metadata as unknown as BlockConfiguration< Record< string, unknown > >,
	{
		edit: Edit,
		save,
	}
);
