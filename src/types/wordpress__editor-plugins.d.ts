/**
 * Local type declarations for `@wordpress/plugins` and the subset of
 * `@wordpress/editor` this plugin uses.
 *
 * Both packages resolve to WordPress globals at build time (dependency
 * extraction), so they don't need to be installed for the bundle — only
 * their types are declared here, narrowly, like the block-editor ones.
 */
declare module '@wordpress/plugins' {
	import type { ComponentType } from 'react';

	export function registerPlugin(
		name: string,
		settings: {
			render: ComponentType;
			icon?: string;
		}
	): unknown;
}

declare module '@wordpress/editor' {
	import type { ReactNode } from 'react';

	export const PluginDocumentSettingPanel: (
		props: {
			name?: string;
			title?: string;
			className?: string;
			children?: ReactNode;
		}
	) => JSX.Element | null;
}
