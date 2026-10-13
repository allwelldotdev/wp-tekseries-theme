import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Event = { id: number; link: string };
type Linked = { id: number; link: string };
// The page's clock as the test sets it (see "follows the clock").
type Clocked = Window & { e2eClock: { time: number } };

const DAY = 24 * 60 * 60 * 1000;

// Event dates and start times are given in Nigerian time (UTC+1 all year).
// The day in Nigeria, some days from now: "20261107" and "2026-11-07".
const day = ( fromNow: number ) => {
	const iso = new Intl.DateTimeFormat( 'en-CA', {
		timeZone: 'Africa/Lagos',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	} ).format( new Date( Date.now() + fromNow * DAY ) );
	return { ymd: iso.replaceAll( '-', '' ), iso };
};
// How many whole days are left now until a moment.
const wholeDays = ( until: number ) =>
	Math.floor( ( until - Date.now() ) / DAY );

const NO_JS = {
	javaScriptEnabled: false,
	storageState: { cookies: [], origins: [] },
};
const VISITOR = { storageState: { cookies: [], origins: [] } };

// The Event Countdown block: on the event's page (full) and on its cards
// (compact), for an event that has not happened yet.
test.describe( 'event countdown', () => {
	const events: number[] = [];
	const pages: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const [ path, ids ] of [
			[ '/wp/v2/event', events ],
			[ '/wp/v2/pages', pages ],
		] as const ) {
			for ( const id of ids ) {
				await requestUtils.rest( {
					method: 'DELETE',
					path: `${ path }/${ id }`,
					params: { force: true },
				} );
			}
		}
	} );

	const publish = async (
		requestUtils: RequestUtils,
		title: string,
		acf: Record< string, string >
	) => {
		const event = await requestUtils.rest< Event >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title,
				status: 'publish',
				acf: {
					time_label: '11:00 AM WAT',
					venue: 'Online (Zoom)',
					cta_link: {
						title: '',
						url: 'https://example.com/register',
						target: '_blank',
					},
					cta_name: 'Register',
					...acf,
				},
			},
		} );
		events.push( event.id );
		return event;
	};

	test( 'counts down to the start time on the event page and on its card', async ( {
		browser,
		requestUtils,
	} ) => {
		const { ymd, iso } = day( 10 );
		const start = Date.parse( `${ iso }T11:00:00+01:00` );
		const event = await publish( requestUtils, 'E2E Countdown Timed', {
			event_date: ymd,
			start_time: '11:00:00',
		} );
		const context = await browser.newContext( VISITOR );
		const page = await context.newPage();
		const requested: string[] = [];
		page.on( 'request', ( request ) => requested.push( request.url() ) );

		await page.goto( event.link );
		const countdown = page.locator(
			'.ts-banner .wp-block-tekseries-event-countdown.is-full'
		);
		const figure = ( part: string ) =>
			countdown.locator( `[data-part="${ part }"]` );
		await expect( countdown ).toHaveClass( /is-live/ );
		await expect( countdown.locator( '.ts-countdown__label' ) ).toHaveText(
			'Starts in'
		);
		// Nine days and some hours, or ten: read on both sides of the look.
		const before = wholeDays( start );
		const shown = Number( await figure( 'days' ).textContent() );
		expect( [ before, wholeDays( start ) ] ).toContain( shown );
		await expect( figure( 'days-name' ) ).toHaveText( 'days' );
		for ( const part of [ 'hours', 'minutes', 'seconds' ] ) {
			await expect( figure( part ) ).toBeVisible();
			await expect( figure( part ) ).toHaveText( /^\d\d$/ );
		}
		// It ticks.
		const second = await figure( 'seconds' ).textContent();
		await expect( figure( 'seconds' ) ).not.toHaveText( second ?? '' );
		// Screen readers get one sentence, not a ticking clock.
		await expect(
			countdown.locator( '.ts-countdown__show' )
		).toHaveAttribute( 'aria-hidden', 'true' );
		await expect( countdown.locator( '.screen-reader-text' ) ).toHaveText(
			new RegExp( `^In ${ shown } days: .+, 11:00 AM WAT$` )
		);
		expect(
			requested.filter( ( url ) =>
				url.includes( '/build/event-countdown/view.js' )
			)
		).toHaveLength( 1 );

		// Its card on the Events page says it in a line.
		await page.goto( '/events/' );
		const card = page
			.locator( '.ts-post-card', { hasText: 'E2E Countdown Timed' } )
			.first();
		await expect(
			card.locator( '.wp-block-tekseries-event-countdown' ).first()
		).toContainText(
			new RegExp( `In (${ before }|${ before + 1 }) days` )
		);
		await context.close();
	} );

	test( 'follows the clock: the last minute, the start, the end of the day', async ( {
		browser,
		requestUtils,
	} ) => {
		const { ymd, iso } = day( 5 );
		const start = Date.parse( `${ iso }T11:00:00+01:00` );
		const event = await publish( requestUtils, 'E2E Countdown Clock', {
			event_date: ymd,
			start_time: '11:00:00',
		} );
		const context = await browser.newContext( VISITOR );
		const page = await context.newPage();
		// The visitor's clock says half a minute before the start, and runs
		// on from there. Only Date.now() is replaced: Playwright's own clock
		// also replaces `performance`, which WordPress reads as a page loads.
		await page.addInitScript( ( time ) => {
			const real = Date.now.bind( Date );
			const opened = real();
			const clock = { time };
			Date.now = () => clock.time + real() - opened;
			( window as unknown as Clocked ).e2eClock = clock;
		}, start - 30_000 );
		const setTime = ( time: number ) =>
			page.evaluate( ( to ) => {
				( window as unknown as Clocked ).e2eClock.time = to;
			}, time );
		await page.goto( event.link );
		const countdown = page.locator(
			'.ts-banner .wp-block-tekseries-event-countdown.is-full'
		);
		await expect( countdown ).toHaveClass( /is-live/ );
		await expect( countdown.locator( '[data-part="days"]' ) ).toHaveText(
			'0'
		);
		await expect( countdown.locator( '[data-part="minutes"]' ) ).toHaveText(
			'00'
		);
		await expect( countdown.locator( '[data-part="seconds"]' ) ).toHaveText(
			/^(30|2\d)$/
		);
		await expect( countdown.locator( '.screen-reader-text' ) ).toHaveText(
			/^In 1 min: /
		);

		// The start passes: one line instead of the tiles.
		await setTime( start );
		await expect( countdown ).toHaveClass( /is-started/ );
		await expect( countdown.locator( '.ts-countdown__status' ) ).toHaveText(
			'Happening now'
		);
		await expect(
			countdown.locator( '.ts-countdown__status' )
		).toBeVisible();
		await expect( countdown.locator( '.ts-countdown__show' ) ).toBeHidden();

		// The day ends in Nigeria: nothing is left to show.
		await setTime( start + 13 * 60 * 60 * 1000 );
		await expect( countdown ).toBeHidden();
		await context.close();
	} );

	test( 'without JavaScript shows the days and no clock; past events show nothing', async ( {
		browser,
		requestUtils,
	} ) => {
		const soon = day( 3 );
		const start = Date.parse( `${ soon.iso }T11:00:00+01:00` );
		const timed = await publish( requestUtils, 'E2E Countdown No Script', {
			event_date: soon.ymd,
			start_time: '11:00:00',
		} );
		// Without a start time only days count: the days on a calendar.
		const dayOnly = await publish( requestUtils, 'E2E Countdown Day Only', {
			event_date: day( 2 ).ymd,
		} );
		const today = await publish( requestUtils, 'E2E Countdown Today', {
			event_date: day( 0 ).ymd,
		} );
		const past = await publish( requestUtils, 'E2E Countdown Past', {
			event_date: '20200110',
			start_time: '11:00:00',
		} );
		const context = await browser.newContext( NO_JS );
		const page = await context.newPage();
		const full = page.locator(
			'.ts-banner .wp-block-tekseries-event-countdown'
		);

		await page.goto( timed.link );
		const left = wholeDays( start );
		expect( [ left, left + 1 ] ).toContain(
			Number( await full.locator( '[data-part="days"]' ).textContent() )
		);
		// A clock that cannot tick is not shown, and keeps its room.
		for ( const part of [ 'hours', 'minutes', 'seconds' ] ) {
			await expect(
				full.locator(
					`.ts-countdown__unit:has([data-part="${ part }"])`
				)
			).toHaveCSS( 'visibility', 'hidden' );
		}

		await page.goto( dayOnly.link );
		await expect( full.locator( '[data-part="days"]' ) ).toHaveText( '2' );
		await expect( full.locator( '.ts-countdown__unit' ) ).toHaveCount( 1 );
		await expect( full.locator( '.screen-reader-text' ) ).toHaveText(
			/^In 2 days: /
		);

		await page.goto( today.link );
		await expect( full ).toHaveClass( /is-started/ );
		await expect( full.locator( '.ts-countdown__status' ) ).toHaveText(
			'Today'
		);
		// Register is still offered on the day.
		await expect(
			page.locator( '.ts-banner .ts-register a' )
		).toBeVisible();

		// A past event has none (its "More events" cards may: they are other events).
		await page.goto( past.link );
		await expect( full ).toHaveCount( 0 );
		await expect(
			page.locator( '.ts-banner .ts-event-ended' )
		).toBeVisible();

		// On the list: a line on the cards of the events to come, none on
		// the past one's.
		const line = ( title: string ) =>
			page
				.locator( '.ts-post-card', { hasText: title } )
				.first()
				.locator( '.wp-block-tekseries-event-countdown' );
		await page.goto( '/events/' );
		await expect( line( 'E2E Countdown Day Only' ) ).toHaveText(
			'In 2 days'
		);
		await expect( line( 'E2E Countdown Today' ) ).toHaveText( 'Today' );
		// Oldest first, so the past event's card is on the first page.
		await page.goto( '/events/?order=asc' );
		await expect(
			page.locator( '.ts-post-card', { hasText: 'E2E Countdown Past' } )
		).toHaveCount( 1 );
		await expect( line( 'E2E Countdown Past' ) ).toHaveCount( 0 );
		await context.close();
	} );

	test( 'loads its script only where a countdown shows, and opens cleanly in the editor', async ( {
		admin,
		editor,
		page,
		browser,
		requestUtils,
	} ) => {
		// A page that lists one past event, with the block on its card.
		await publish( requestUtils, 'E2E Countdown Old', {
			event_date: '20200111',
		} );
		const listing = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Countdown Listing',
				status: 'publish',
				content:
					'<!-- wp:query {"queryId":9,"query":{"perPage":3,"postType":"event","search":"E2E Countdown Old","inherit":false}} --><div class="wp-block-query">' +
					'<!-- wp:post-template --><!-- wp:post-title /--><!-- wp:tekseries/event-countdown /--><!-- /wp:post-template -->' +
					'</div><!-- /wp:query -->',
			},
		} );
		pages.push( listing.id );
		const context = await browser.newContext( VISITOR );
		const visitor = await context.newPage();
		const requested: string[] = [];
		visitor.on( 'request', ( request ) => requested.push( request.url() ) );
		await visitor.goto( listing.link );
		await visitor.waitForLoadState( 'load' );
		await expect(
			visitor.getByRole( 'heading', { name: 'E2E Countdown Old' } )
		).toBeVisible();
		await expect(
			visitor.locator( '.wp-block-tekseries-event-countdown' )
		).toHaveCount( 0 );
		expect(
			requested.filter( ( url ) => url.includes( 'event-countdown' ) )
		).toEqual( [] );
		await context.close();

		// In the editor the block shows a sample and offers its two sizes.
		await admin.createNewPost();
		await editor.insertBlock( { name: 'tekseries/event-countdown' } );
		const block = editor.canvas.locator(
			'[data-type="tekseries/event-countdown"]'
		);
		await expect( block ).toContainText( 'Starts in' );
		await editor.openDocumentSettingsSidebar();
		await page
			.getByRole( 'combobox', { name: 'Size' } )
			.selectOption( 'compact' );
		await expect( block ).toHaveText( 'In 12 days' );
		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'tekseries/event-countdown',
				attributes: { size: 'compact' },
			},
		] );
	} );
} );
