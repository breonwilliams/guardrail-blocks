/**
 * Card — registration (edit + save co-located; the card is a semantic
 * article whose title block derives its level from section context).
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import metadata from './block.json';
import './style.scss';

const TEMPLATE: Array< [ string, Record< string, unknown >? ] > = [
	[ 'accessible-blocks/heading' ],
	[ 'core/paragraph' ],
];

function Edit() {
	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );

	return <article { ...innerBlocksProps } />;
}

function save() {
	const blockProps = useBlockProps.save();
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );
	return <article { ...innerBlocksProps } />;
}

registerBlockType(
	metadata as unknown as BlockConfiguration< Record< string, unknown > >,
	{
		edit: Edit,
		save,
	}
);
