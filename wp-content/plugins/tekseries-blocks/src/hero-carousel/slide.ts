import { __ } from '@wordpress/i18n';

type Template = [ string, Record< string, unknown >?, Template[]? ];

// One of the three labels under a slide's buttons: an icon (its id in the
// plugin's collection) and a word.
const pillar = ( icon: string, label: string ): Template => [
	'core/group',
	{
		style: { spacing: { blockGap: 'var:preset|spacing|8' } },
		layout: {
			type: 'flex',
			flexWrap: 'nowrap',
			verticalAlignment: 'center',
		},
	},
	[
		[
			'core/icon',
			{
				icon,
				textColor: 'saffron',
				style: { dimensions: { width: '22px' } },
			},
		],
		[
			'core/paragraph',
			{
				content: label,
				textColor: 'white',
				fontSize: 'body',
				style: { typography: { fontWeight: '700' } },
			},
		],
	],
];

// A whole slide, laid out like the Home hero's: a Cover under the plum
// overlay holding a label, a heading, a line, two buttons and the three
// labels. The label, heading and line are placeholders to type over; the
// photo is the editor's to pick. Only a page's first slide should hold its
// top-level heading, so this one is an H2 that looks like it.
export const SLIDE: Template = [
	'core/cover',
	{
		dimRatio: 100,
		gradient: 'overlay-plum',
		minHeight: 600,
		minHeightUnit: 'px',
		contentPosition: 'center left',
		isDark: true,
		style: {
			spacing: {
				padding: {
					top: 'var:preset|spacing|hero-y',
					right: 'var:preset|spacing|hero-x',
					bottom: 'var:preset|spacing|hero-y',
					left: 'var:preset|spacing|hero-x',
				},
			},
			'@mobile': {
				dimensions: { minHeight: 'auto' },
				spacing: { padding: { bottom: 'var:preset|spacing|56' } },
			},
		},
		layout: {
			type: 'constrained',
			contentSize: '820px',
			justifyContent: 'left',
		},
	},
	[
		[
			'core/group',
			{
				style: { spacing: { blockGap: 'var:preset|spacing|20' } },
				layout: {
					type: 'flex',
					orientation: 'vertical',
					justifyContent: 'stretch',
					flexWrap: 'nowrap',
				},
			},
			[
				[
					'core/paragraph',
					{
						className: 'is-style-chip',
						placeholder: __( 'Short label', 'tekseries-blocks' ),
					},
				],
				[
					'core/heading',
					{
						level: 2,
						textColor: 'white',
						fontSize: 'heading-1',
						placeholder: __( 'Slide heading', 'tekseries-blocks' ),
						style: { typography: { lineHeight: '1.02' } },
					},
				],
				[
					'core/paragraph',
					{
						fontSize: 'lead',
						textColor: 'lilac-deep',
						placeholder: __(
							'A line or two about this slide.',
							'tekseries-blocks'
						),
						style: { typography: { lineHeight: '1.5' } },
					},
				],
				[
					'core/buttons',
					{
						style: {
							spacing: {
								blockGap: 'var:preset|spacing|12',
								margin: { top: 'var:preset|spacing|8' },
							},
							'@mobile': {
								layout: {
									orientation: 'vertical',
									justifyContent: 'stretch',
								},
							},
						},
					},
					[
						[
							'core/button',
							{
								text: __( 'First button', 'tekseries-blocks' ),
								url: '#',
								className: 'is-style-accent',
							},
						],
						[
							'core/button',
							{
								text: __( 'Second button', 'tekseries-blocks' ),
								url: '#',
								className: 'is-style-outline',
								textColor: 'white',
							},
						],
					],
				],
				[
					'core/group',
					{
						style: {
							spacing: {
								blockGap: 'var:preset|spacing|28',
								margin: { top: 'var:preset|spacing|12' },
							},
							'@mobile': {
								spacing: { blockGap: 'var:preset|spacing|16' },
							},
						},
						layout: { type: 'flex', flexWrap: 'wrap' },
					},
					[
						pillar(
							'tekseries/hub',
							__( 'Share', 'tekseries-blocks' )
						),
						pillar(
							'tekseries/lightbulb',
							__( 'Create', 'tekseries-blocks' )
						),
						pillar(
							'tekseries/settings_suggest',
							__( 'Solve', 'tekseries-blocks' )
						),
					],
				],
			],
		],
	],
];
