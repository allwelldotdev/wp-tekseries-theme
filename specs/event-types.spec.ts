import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };

// The SVG path of a registered icon, to compare with what the page printed.
const iconPath = async ( requestUtils: RequestUtils, name: string ) =>
	(
		await requestUtils.rest< { content: string } >( {
			path: `/wp/v2/icons/tekseries/${ name }`,
		} )
	).content.match( / d="([^"]+)"/ )?.[ 1 ] ?? '';

const REQUIRED = {
	cta_link: { title: '', url: 'https://example.com/', target: '' },
	cta_name: 'Register',
};

// Event types show an icon: the type's own (term meta) or the default for its slug.
test.describe( 'event type icons', () => {
	const events: number[] = [];
	let webinar: number;
	let custom: number;

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
		custom = (
			await requestUtils.rest< { id: number } >( {
				method: 'POST',
				path: '/wp/v2/event_type',
				data: {
					name: 'E2E Type',
					slug: 'e2e-type',
					meta: { tekseries_icon: 'rocket_launch' },
				},
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
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/event_type/${ custom }`,
			params: { force: true },
		} );
	} );

	const publish = async ( requestUtils: RequestUtils, type: number ) => {
		const event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Typed Event',
				status: 'publish',
				event_type: [ type ],
				acf: { event_date: '20991201', ...REQUIRED },
			},
		} );
		events.push( event.id );
		return event;
	};

	test( 'the badge and the details card show the default type icon', async ( {
		page,
		requestUtils,
	} ) => {
		const event = await publish( requestUtils, webinar );
		const videocam = await iconPath( requestUtils, 'videocam' );

		await page.goto( event.link );
		await expect(
			page.locator( '.ts-banner .is-style-badge a svg path' )
		).toHaveAttribute( 'd', videocam );
		await expect(
			page.locator( '.ts-details .ts-event-type-icon svg path' )
		).toHaveAttribute( 'd', videocam );
	} );

	test( "a type's own icon replaces the default, on the badge and as the topic icon", async ( {
		page,
		requestUtils,
	} ) => {
		const event = await publish( requestUtils, custom );
		const rocket = await iconPath( requestUtils, 'rocket_launch' );

		await page.goto( event.link );
		await expect(
			page.locator( '.ts-banner .is-style-badge a svg path' )
		).toHaveAttribute( 'd', rocket );
		await expect(
			page.locator( '.ts-banner > .ts-tone__icon path' )
		).toHaveAttribute( 'd', rocket );
	} );

	test( 'the filter chips show type icons', async ( {
		page,
		requestUtils,
	} ) => {
		await page.goto( '/events/' );
		const chips = page.locator( '.ts-nav-chips' );
		await expect(
			chips.getByRole( 'link', { name: 'Webinars' } ).locator( 'path' )
		).toHaveAttribute( 'd', await iconPath( requestUtils, 'videocam' ) );
		await expect(
			chips.getByRole( 'link', { name: 'All events' } ).locator( 'path' )
		).toHaveAttribute( 'd', await iconPath( requestUtils, 'apps' ) );
	} );
} );
