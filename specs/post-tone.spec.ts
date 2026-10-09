import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };
type Icon = { content: string };

const toneBlock = ( variant: string, text: string ) =>
	`<!-- wp:tekseries/post-tone {"variant":"${ variant }"} -->` +
	`<!-- wp:paragraph --><p>${ text }</p><!-- /wp:paragraph -->` +
	'<!-- /wp:tekseries/post-tone -->';

// The SVG path of a registered icon, to compare with what the block printed.
const iconPath = ( svg: string ) => svg.match( / d="([^"]+)"/ )?.[ 1 ];

test.describe( 'Post Tone block', () => {
	const events: number[] = [];
	let webinar: number;

	test.beforeAll( async ( { requestUtils } ) => {
		const terms = await requestUtils.rest< { id: number }[] >( {
			path: '/wp/v2/event_type',
			params: { slug: 'webinar' },
		} );
		webinar =
			terms[ 0 ]?.id ??
			(
				await requestUtils.rest< { id: number } >( {
					method: 'POST',
					path: '/wp/v2/event_type',
					data: { name: 'Webinar', slug: 'webinar' },
				} )
			).id;
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of events ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'renders the stored tone and icon on the server, with JavaScript off', async ( {
		browser,
		requestUtils,
	} ) => {
		const event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Tone Banner',
				status: 'publish',
				content: toneBlock( 'banner', 'Inside the tone' ),
				meta: {
					tekseries_tone: 'ink',
					tekseries_icon: 'rocket_launch',
				},
			},
		} );
		events.push( event.id );
		const { content } = await requestUtils.rest< Icon >( {
			path: '/wp/v2/icons/tekseries/rocket_launch',
		} );

		const context = await browser.newContext( {
			javaScriptEnabled: false,
		} );
		const page = await context.newPage();
		await page.goto( event.link );

		const block = page.locator(
			'.wp-block-post-content .wp-block-tekseries-post-tone'
		);
		await expect( block ).toHaveClass( /\bts-tone--ink\b/ );
		await expect( block ).toHaveClass( /\bts-tone--banner\b/ );
		await expect( block ).toContainText( 'Inside the tone' );
		await expect(
			block.locator( '.ts-tone__icon[aria-hidden="true"] path' )
		).toHaveAttribute( 'd', iconPath( content ) ?? '' );
		await context.close();
	} );

	test( 'shows the event type icon until an editor picks one', async ( {
		page,
		requestUtils,
	} ) => {
		const event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Tone Default Icon',
				status: 'publish',
				content: toneBlock( 'card', 'Default icon' ),
				event_type: [ webinar ],
			},
		} );
		events.push( event.id );
		const { content } = await requestUtils.rest< Icon >( {
			path: '/wp/v2/icons/tekseries/videocam',
		} );

		await page.goto( event.link );
		const block = page.locator(
			'.wp-block-post-content .wp-block-tekseries-post-tone'
		);
		await expect( block ).toHaveClass( /\bts-tone--card\b/ );
		await expect( block.locator( '.ts-tone__icon path' ) ).toHaveAttribute(
			'd',
			iconPath( content ) ?? ''
		);
	} );

	test( 'colours the listing card and banner with the stored tone, with JavaScript off', async ( {
		browser,
		requestUtils,
	} ) => {
		const event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Tone Listing',
				status: 'publish',
				meta: { tekseries_tone: 'saffron', tekseries_icon: 'school' },
			},
		} );
		events.push( event.id );
		const { content } = await requestUtils.rest< Icon >( {
			path: '/wp/v2/icons/tekseries/school',
		} );

		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( '/events/' );
		const media = page
			.locator( '.ts-post-card', { hasText: 'E2E Tone Listing' } )
			.first()
			.locator( '.ts-card-media' );
		await expect( media ).toHaveClass( /\bts-tone--saffron\b/ );
		await expect( media.locator( '.ts-tone__icon path' ) ).toHaveAttribute(
			'd',
			iconPath( content ) ?? ''
		);

		await page.goto( event.link );
		const banner = page.locator( '.ts-banner' );
		await expect( banner ).toHaveClass( /\bts-tone--saffron\b/ );
		await expect( banner ).toHaveClass( /\bts-tone--banner\b/ );
		await context.close();
	} );

	test( 'the events page loads no React for visitors', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => {
			if ( request.resourceType() === 'script' ) {
				scripts.push( request.url() );
			}
		} );
		await page.goto( '/events/' );
		await expect( page.locator( '.ts-card-media' ).first() ).toBeVisible();
		expect( scripts.filter( ( url ) => /react/i.test( url ) ) ).toEqual(
			[]
		);
		await context.close();
	} );

	test( 'is insertable and valid in the post editor', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { postType: 'event' } );
		expect(
			await page.evaluate( () => {
				const { wp } = window as unknown as {
					wp: {
						data: {
							select: ( store: string ) => {
								canInsertBlockType: ( name: string ) => boolean;
							};
						};
					};
				};
				return wp.data
					.select( 'core/block-editor' )
					.canInsertBlockType( 'tekseries/post-tone' );
			} )
		).toBe( true );

		await editor.insertBlock( {
			name: 'tekseries/post-tone',
			innerBlocks: [
				{ name: 'core/paragraph', attributes: { content: 'Toned' } },
			],
		} );
		const block = editor.canvas.locator( '.wp-block-tekseries-post-tone' );
		// A draft has no tone yet, so the preview is plum.
		await expect( block ).toHaveClass( /\bts-tone--plum\b/ );
		await expect( block ).toContainText( 'Toned' );
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
