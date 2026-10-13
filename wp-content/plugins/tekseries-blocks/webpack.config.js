// wp-scripts builds the scripts each block.json lists. The post sidebar, the
// Button block's icon panel, the reveal script and the scripts of the contact
// form and the job submission form are not blocks, so they are added to those
// entries here. So are the Event Countdown's script (render.php asks for it
// only when it prints a countdown) and the script that opens a Formbricks
// form from a button.
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
			'button-icon/index': './src/button-icon/index.tsx',
		} ),
	},
	{
		...moduleConfig,
		entry: () => ( {
			...moduleConfig.entry(),
			'reveal/view': './src/reveal/view.ts',
			'contact-form/view': './src/contact-form/view.ts',
			'job-submit/view': './src/job-submit/view.ts',
			'event-countdown/view': './src/event-countdown/view.ts',
			'surveys/view': './src/surveys/view.ts',
		} ),
	},
];
