import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };

// Events are found by their title, from ?q= in the address: on the Events page
// across all events, on an event type page within that type. Without
// JavaScript the form submits; with it, the results follow the typing in place.
test.describe( 'event search', () => {
	const made: number[] = [];
	let webinar: Linked;
	let workshop: Linked;

	const publish = async (
		requestUtils: RequestUtils,
		title: string,
		date: string,
		type: Linked,
		venue = ''
	) => {
		const event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title,
				status: 'publish',
				content: 'An event.',
				event_type: [ type.id ],
				acf: {
					event_date: date,
					time_label: '',
					start_time: '',
					venue,
					cta_link: { title: '', url: '', target: '' },
					cta_name: '',
				},
			},
		} );
		made.push( event.id );
		return event;
	};

	const term = async ( requestUtils: RequestUtils, name: string ) => {
		const slug = name.toLowerCase();
		const [ existing ] = await requestUtils.rest< Linked[] >( {
			path: '/wp/v2/event_type',
			params: { slug },
		} );
		return (
			existing ??
			requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/event_type',
				data: { name, slug },
			} )
		);
	};

	test.beforeAll( async ( { requestUtils } ) => {
		webinar = await term( requestUtils, 'Webinar' );
		workshop = await term( requestUtils, 'Workshop' );
		await publish(
			requestUtils,
			'E2E Zebra Coding Camp',
			'20990301',
			workshop,
			'Quokka Hall'
		);
		await publish( requestUtils, 'E2E Zebra Talk', '20990302', webinar );
		// Thirteen more: a search that finds them all takes two pages.
		for ( let n = 1; n <= 13; n++ ) {
			await publish(
				requestUtils,
				`E2E Heron ${ n }`,
				`2098${ String( n ).padStart( 2, '0' ) }01`,
				webinar
			);
		}
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of made ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event/${ id }`,
				params: { force: true },
			} );
		}
	} );

	const titles =
		'.ts-event-region--results .ts-post-card .wp-block-post-title';

	test.describe( 'without JavaScript', () => {
		test.use( { javaScriptEnabled: false } );

		test( 'the form finds events by title, and the chips keep the search', async ( {
			page,
		} ) => {
			await page.goto( '/events/' );
			const field = page.getByRole( 'searchbox', {
				name: 'Search events',
			} );
			await field.fill( 'zebra' );
			await field.press( 'Enter' );
			await expect( page ).toHaveURL( /\/events\/\?q=zebra$/ );

			await expect( page.getByRole( 'status' ) ).toHaveText(
				'2 events for “zebra” across all events'
			);
			await expect( page.locator( titles ) ).toHaveText( [
				'E2E Zebra Talk',
				'E2E Zebra Coding Camp',
			] );
			// The Latest card and Happening now give way to the matches.
			await expect( page.getByText( 'Latest event' ) ).toHaveCount( 0 );
			await expect( page.locator( '.ts-now' ) ).toHaveCount( 0 );
			await expect(
				page
					.getByRole( 'navigation', { name: 'Filter events' } )
					.getByRole( 'link', { name: 'Webinars' } )
			).toHaveAttribute( 'href', /\/event_type\/webinar\/\?q=zebra$/ );

			// Within a type, only its events.
			await page
				.getByRole( 'navigation', { name: 'Filter events' } )
				.getByRole( 'link', { name: 'Workshops' } )
				.click();
			await expect( page.getByRole( 'status' ) ).toHaveText(
				'1 event for “zebra” among Workshop events'
			);
			await expect( page.locator( titles ) ).toHaveText( [
				'E2E Zebra Coding Camp',
			] );

			// Clear search: every event of the type again.
			await page
				.getByRole( 'link', { name: 'Clear search' } )
				.first()
				.click();
			await expect( page ).toHaveURL( /\/event_type\/workshop\/$/ );
			await expect( field ).toHaveValue( '' );
		} );

		test( 'only the title is searched, and nothing found offers a way on', async ( {
			page,
		} ) => {
			// The venue of a match is not searched.
			await page.goto( '/event_type/webinar/?q=quokka' );
			const empty = page.locator(
				'.wp-block-tekseries-event-search.is-empty'
			);
			await expect( empty.getByRole( 'heading' ) ).toHaveText(
				'No events match “quokka”'
			);
			await expect(
				page.locator( '.ts-hide-searching, .wp-block-query-no-results' )
			).toHaveCount( 0 );
			await expect(
				empty.getByRole( 'link', { name: 'Search all event types' } )
			).toHaveAttribute( 'href', /\/events\/\?q=quokka$/ );
			await expect(
				empty.getByRole( 'link', { name: 'Coding' } )
			).toHaveAttribute( 'href', /\/event_type\/webinar\/\?q=Coding$/ );
		} );

		test( 'more than twelve matches take two pages', async ( { page } ) => {
			await page.goto( '/events/?q=heron' );
			await expect( page.getByRole( 'status' ) ).toHaveText(
				'13 events for “heron” across all events'
			);
			await expect( page.locator( titles ) ).toHaveCount( 12 );
			await page
				.locator( '.wp-block-query-pagination-numbers a', {
					hasText: '2',
				} )
				.click();
			await expect( page ).toHaveURL( /q=heron/ );
			await expect( page.locator( titles ) ).toHaveText( [
				'E2E Heron 1',
			] );

			await page.goto( '/event_type/webinar/?q=heron' );
			await expect( page.locator( titles ) ).toHaveCount( 12 );
			await expect(
				page.locator( '.wp-block-query-pagination-numbers' )
			).toBeVisible();
		} );
	} );

	test( 'the results follow the typing in place', async ( { browser } ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( '/events/' );
		// Lost if the browser loads a new page.
		await page.evaluate( () => {
			( window as unknown as { stays?: boolean } ).stays = true;
		} );
		const footer = page.locator( '.ts-footer__panel' );
		const plum = await footer.evaluate(
			( panel ) => getComputedStyle( panel ).backgroundColor
		);

		const field = page.getByRole( 'searchbox', { name: 'Search events' } );
		const clear = page.getByRole( 'link', { name: 'Clear search' } );
		await expect( clear ).toBeHidden();
		await field.pressSequentially( 'zebra' );
		await expect( page.getByRole( 'status' ) ).toHaveText(
			'2 events for “zebra” across all events'
		);
		await expect( page ).toHaveURL( /\/events\/\?q=zebra$/ );
		await expect( field ).toBeFocused();
		await expect( clear.first() ).toBeVisible();
		await expect(
			page
				.getByRole( 'navigation', { name: 'Filter events' } )
				.getByRole( 'link', { name: 'Webinars' } )
		).toHaveAttribute( 'href', /\?q=zebra$/ );
		// The page outside the results keeps its look.
		await expect
			.poll( () =>
				footer.evaluate(
					( panel ) => getComputedStyle( panel ).backgroundColor
				)
			)
			.toBe( plum );

		// A suggested word under an empty result fills the field.
		await field.fill( 'nothing-like-this' );
		await field.press( 'Enter' );
		await expect(
			page.getByRole( 'heading', {
				name: 'No events match “nothing-like-this”',
			} )
		).toBeVisible();
		await page.getByRole( 'link', { name: 'Coding' } ).click();
		await expect( page ).toHaveURL( /q=Coding/ );
		await expect( field ).toHaveValue( 'Coding' );

		// The cross empties the field and lists every event.
		await page.locator( '.ts-event-search__clear' ).click();
		await expect( page ).toHaveURL( /\/events\/$/ );
		await expect( field ).toHaveValue( '' );
		await expect( field ).toBeFocused();
		await expect( page.getByText( 'Latest event' ) ).toBeVisible();

		// Back brings the last search and its word back.
		await page.goBack();
		await expect( page ).toHaveURL( /q=Coding/ );
		await expect( field ).toHaveValue( 'Coding' );

		expect(
			await page.evaluate(
				() => ( window as unknown as { stays?: boolean } ).stays
			)
		).toBe( true );
		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		await context.close();
	} );
} );
