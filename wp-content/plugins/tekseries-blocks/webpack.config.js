// wp-scripts builds the scripts each block.json lists. The post sidebar is not a
// block, so it is added to those entries here.
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
	moduleConfig,
];
