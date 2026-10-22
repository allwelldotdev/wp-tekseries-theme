import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type EventFields = {
	event_date: string;
	time_label: string;
	start_time: string;
	venue: string;
	cta_link: { title: string; url: string; target: string } | string;
	cta_name: string;
	event_ongoing: boolean;
};
type Event = { id: number; link: string; acf: EventFields };

const FIELDS: EventFields = {
	event_date: '20261126',
	time_label: '11:00 AM WAT',
	start_time: '11:00:00',
	venue: 'Online (Zoom)',
	cta_link: {
		title: '',
		url: 'https://example.com/register',
		target: '_blank',
	},
	cta_name: 'Register and attend',
	event_ongoing: false,
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

	test( 'the order switch lists the oldest first, and undated events come last either way', async ( {
		browser,
		requestUtils,
	} ) => {
		const type = await requestUtils.rest< { id: number; link: string } >( {
			method: 'POST',
			path: '/wp/v2/event_type',
			data: { name: 'E2E Sorted', slug: 'e2e-sorted' },
		} );
		// Newer than any other test's event, older than any, and one with no
		// date: published last, so its publish date would put it first.
		for ( const [ title, date ] of [
			[ 'E2E Sort 2103', '21030101' ],
			[ 'E2E Sort 1991', '19910101' ],
			[ 'E2E Sort 1990', '19900101' ],
			[ 'E2E Sort Undated', '' ],
		] ) {
			const event = await publish( requestUtils, title ?? '', {
				event_date: date,
			} );
			await requestUtils.rest( {
				method: 'POST',
				path: `/wp/v2/event/${ event.id }`,
				data: { event_type: [ type.id ] },
			} );
		}

		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const titles = page.locator( '.ts-post-card .wp-block-post-title' );
		const path = ( url: string ) => {
			const { pathname, search } = new URL( url );
			return pathname + search;
		};

		try {
			// An event type page lists only these four.
			await page.goto( type.link );
			await expect( titles ).toHaveText( [
				'E2E Sort 2103',
				'E2E Sort 1991',
				'E2E Sort 1990',
				'E2E Sort Undated',
			] );
			const newest = page.getByRole( 'link', {
				name: 'Newest first. Show oldest first',
			} );
			await expect( newest ).toHaveText( 'Newest first' );
			expect(
				path( ( await newest.getAttribute( 'href' ) ) ?? '' )
			).toBe( `${ path( type.link ) }?order=asc` );

			await newest.click();
			await expect( titles ).toHaveText( [
				'E2E Sort 1990',
				'E2E Sort 1991',
				'E2E Sort 2103',
				'E2E Sort Undated',
			] );
			const oldest = page.getByRole( 'link', {
				name: 'Oldest first. Show newest first',
			} );
			await expect( oldest ).toHaveText( 'Oldest first' );
			expect(
				path( ( await oldest.getAttribute( 'href' ) ) ?? '' )
			).toBe( path( type.link ) );
			// The filter chips keep the order.
			await expect(
				page
					.getByRole( 'navigation', { name: 'Filter events' } )
					.getByRole( 'link', { name: 'All events' } )
			).toHaveAttribute( 'href', /\/events\/\?order=asc$/ );

			// The Events page: the Latest card stays the newest event, and
			// the grid under it lists the rest from the oldest.
			await page.goto( '/events/?order=asc' );
			await expect( titles.nth( 0 ) ).toHaveText( 'E2E Sort 2103' );
			await expect( titles.nth( 1 ) ).toHaveText( 'E2E Sort 1990' );
			await expect( titles.nth( 2 ) ).toHaveText( 'E2E Sort 1991' );
			await expect(
				page.getByRole( 'link', {
					name: 'Oldest first. Show newest first',
				} )
			).toHaveAttribute( 'href', /\/events\/$/ );

			// Page links keep the order, and no later page lists the Latest
			// card's event again.
			const last = page
				.locator( '.wp-block-query-pagination-numbers a' )
				.last();
			await expect( last ).toHaveAttribute( 'href', /order=asc/ );
			await last.click();
			await expect( page ).toHaveURL( /query-2-page=\d+/ );
			await expect(
				titles.filter( { hasText: 'E2E Sort 2103' } )
			).toHaveCount( 1 );
			await expect( titles.last() ).toHaveText( 'E2E Sort Undated' );
		} finally {
			await context.close();
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event_type/${ type.id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'an event type page lists six events a page, and keeps its chip current on later pages', async ( {
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
		// Seven, newer than any other test's event: they fill page 1 and start page 2.
		for ( let day = 1; day <= 7; day++ ) {
			const event = await publish( requestUtils, `E2E Paged ${ day }`, {
				event_date: `2199010${ day }`,
			} );
			await requestUtils.rest( {
				method: 'POST',
				path: `/wp/v2/event/${ event.id }`,
				data: { event_type: [ webinar ] },
			} );
		}

		const cards = page.locator( '.ts-post-card' );
		const chip = page
			.getByRole( 'navigation', { name: 'Filter events' } )
			.getByRole( 'link', { name: 'Webinars' } );

		await page.goto( '/event_type/webinar/' );
		await expect( cards ).toHaveCount( 6 );
		await expect( chip ).toHaveAttribute( 'aria-current', 'page' );

		await page
			.locator( '.wp-block-query-pagination-numbers a', { hasText: '2' } )
			.first()
			.click();
		await expect( page ).toHaveURL( /\/event_type\/webinar\/page\/2\/?$/ );
		await expect(
			page.locator( '.ts-post-card .wp-block-post-title' ).first()
		).toHaveText( 'E2E Paged 1' );
		await expect( chip ).toHaveAttribute( 'aria-current', 'page' );
		await expect(
			page.locator( '.ts-nav-chips .current-menu-item' )
		).toHaveText( 'Webinars' );
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
