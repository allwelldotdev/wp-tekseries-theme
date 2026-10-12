// wp-scripts builds the scripts each block.json lists. The post sidebar and the
// reveal script are not blocks, so they are added to those entries here.
const [
	scriptConfig,
	moduleConfig,
] = require( '@wordpress/scripts/config/webpack.config' );

module.exports = [
	{
		...scriptConfig,
		entry: () => ( {
			...scriptConfig.entry(),
			'post-settings/index': './src/post-settings/index.tsx',
		} ),
	},
	{
		...moduleConfig,
		entry: () => ( {
			...moduleConfig.entry(),
			'reveal/view': './src/reveal/view.ts',
		} ),
	},
];
