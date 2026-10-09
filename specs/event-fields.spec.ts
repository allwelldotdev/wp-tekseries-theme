import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type EventFields = {
	event_date: string;
	time_label: string;
	venue: string;
	cta_link: { title: string; url: string; target: string } | string;
	cta_name: string;
};
type Event = { id: number; link: string; acf: EventFields };

const FIELDS: EventFields = {
	event_date: '20261126',
	time_label: '11:00 AM WAT',
	venue: 'Online (Zoom)',
	cta_link: {
		title: '',
		url: 'https://example.com/register',
		target: '_blank',
	},
	cta_name: 'Register and attend',
};

// The ACF "Events" field group is registered in the plugin (same keys as the
// group first made in the ACF admin), with REST and block bindings turned on.
test.describe( 'event fields', () => {
	const events: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of events ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event/${ id }`,
				params: { force: true },
			} );
		}
	} );

	const publish = async (
		requestUtils: RequestUtils,
		title: string,
		acf: Partial< EventFields >
	) => {
		const event = await requestUtils.rest< Event >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: { title, status: 'publish', acf: { ...FIELDS, ...acf } },
		} );
		events.push( event.id );
		return event;
	};

	test( 'are saved and read over REST', async ( { requestUtils } ) => {
		const created = await requestUtils.rest< Event >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: { title: 'E2E Event Fields', status: 'draft', acf: FIELDS },
		} );
		events.push( created.id );

		const event = await requestUtils.rest< Event >( {
			path: `/wp/v2/event/${ created.id }`,
		} );
		expect( event.acf ).toEqual( FIELDS );
	} );

	test( 'show on the listing card and the event page, with JavaScript off', async ( {
		browser,
		requestUtils,
	} ) => {
		const event = await publish( requestUtils, 'E2E Upcoming Event', {
			event_date: '20991126',
		} );
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();

		// The card shows the event date, not the publish date.
		await page.goto( '/events/' );
		const card = page
			.locator( '.ts-post-card', { hasText: 'E2E Upcoming Event' } )
			.first();
		await expect( card.locator( '.ts-card-date__day' ) ).toHaveText( '26' );
		await expect( card.locator( '.ts-card-date__month' ) ).toHaveText(
			'Nov 2099'
		);
		await expect( card.locator( 'time' ).first() ).toHaveAttribute(
			'datetime',
			/^2099-11-26T00:00:00/
		);

		await page.goto( event.link );
		const banner = page.locator( '.ts-banner' );
		const meta = banner.locator( '.ts-event-meta' );
		await expect( meta ).toContainText( 'November 26, 2099' );
		await expect( meta ).toContainText( '11:00 AM WAT' );
		await expect( meta ).toContainText( 'Online (Zoom)' );
		const register = banner.locator( '.ts-register a' );
		await expect( register ).toHaveText( 'Register and attend' );
		await expect( register ).toHaveAttribute(
			'href',
			'https://example.com/register'
		);
		await expect( register ).toHaveAttribute( 'target', '_blank' );

		const details = page.locator( '.ts-details' );
		await expect( details ).toContainText( 'example.com/register' );
		await expect( details.locator( '.ts-register a' ) ).toHaveAttribute(
			'href',
			'https://example.com/register'
		);
		await context.close();
	} );

	test( 'an ended event shows a note instead of Register', async ( {
		page,
		requestUtils,
	} ) => {
		const event = await publish( requestUtils, 'E2E Ended Event', {
			event_date: '20200110',
		} );
		await page.goto( event.link );

		const banner = page.locator( '.ts-banner' );
		await expect( banner.locator( '.ts-event-ended' ) ).toHaveText(
			'This event has ended'
		);
		const details = page.locator( '.ts-details' );
		await expect( details.locator( '.ts-event-ended' ) ).toBeVisible();
		await expect( page.locator( '.ts-register' ) ).toHaveCount( 0 );
		await expect( details ).not.toContainText( 'example.com/register' );
	} );

	test( 'events are listed by event date, newest first', async ( {
		page,
		requestUtils,
	} ) => {
		const terms = await requestUtils.rest< { id: number }[] >( {
			path: '/wp/v2/event_type',
			params: { slug: 'webinar' },
		} );
		const webinar =
			terms[ 0 ]?.id ??
			(
				await requestUtils.rest< { id: number } >( {
					method: 'POST',
					path: '/wp/v2/event_type',
					data: { name: 'Webinar', slug: 'webinar' },
				} )
			).id;

		// Published first, but its event comes later.
		for ( const [ title, date ] of [
			[ 'E2E Order Later', '20990302' ],
			[ 'E2E Order Earlier', '20990301' ],
		] ) {
			const event = await publish( requestUtils, title ?? '', {
				event_date: date,
			} );
			await requestUtils.rest( {
				method: 'POST',
				path: `/wp/v2/event/${ event.id }`,
				data: { event_type: [ webinar ] },
			} );
		}

		for ( const url of [ '/events/', '/event_type/webinar/' ] ) {
			await page.goto( url );
			const titles = await page
				.locator( '.ts-post-card .wp-block-post-title' )
				.allTextContents();
			const later = titles.indexOf( 'E2E Order Later' );
			expect( later, url ).toBeGreaterThanOrEqual( 0 );
			expect( later, url ).toBeLessThan(
				titles.indexOf( 'E2E Order Earlier' )
			);
		}
	} );

	test( 'leaves out rows whose field is empty', async ( {
		page,
		requestUtils,
	} ) => {
		const event = await publish( requestUtils, 'E2E Event Without Venue', {
			event_date: '20991127',
			time_label: '',
			venue: '',
		} );
		await page.goto( event.link );

		const rows = page.locator( '.ts-banner .ts-event-row' );
		await expect( rows.filter( { visible: true } ) ).toHaveCount( 1 );
		await expect( rows.filter( { visible: true } ) ).toContainText(
			'November 27, 2099'
		);
	} );
} );
