import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };

// ACF checks the required fields on every save, so each one sends them all.
const ACF = {
	event_date: '20230815',
	time_label: '',
	start_time: '',
	venue: 'Eziama, Ikeduru LGA',
	cta_link: { title: '', url: '/contact/#support', target: '' },
	cta_name: 'Support this workshop',
};

// An event marked "Ongoing" (ACF switch event_ongoing) started on its date
// and is still running: "Since …" dates, an Ongoing chip, no ended note or
// countdown, and the Events page's Happening now card. All of it is in the
// server's HTML, so these run with JavaScript off.
test.describe( 'ongoing events', () => {
	test.use( { javaScriptEnabled: false } );

	let event: Linked;
	let workshop: Linked;
	let madeType = false;

	test.beforeAll( async ( { requestUtils } ) => {
		const [ existing ] = await requestUtils.rest< Linked[] >( {
			path: '/wp/v2/event_type',
			params: { slug: 'workshop' },
		} );
		madeType = ! existing;
		workshop =
			existing ??
			( await requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/event_type',
				data: { name: 'Workshop', slug: 'workshop' },
			} ) );
		event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Ongoing Camp',
				status: 'publish',
				content: 'A camp that keeps going.',
				event_type: [ workshop.id ],
				acf: { ...ACF, event_ongoing: true },
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/event/${ event.id }`,
			params: { force: true },
		} );
		if ( madeType ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/event_type/${ workshop.id }`,
				params: { force: true },
			} );
		}
	} );

	const setOngoing = ( requestUtils: RequestUtils, on: boolean ) =>
		requestUtils.rest( {
			method: 'POST',
			path: `/wp/v2/event/${ event.id }`,
			data: { acf: { ...ACF, event_ongoing: on } },
		} );

	test( 'its page says since when it runs, and keeps its button', async ( {
		page,
	} ) => {
		await page.goto( event.link );
		const banner = page.locator( '.ts-banner' );
		await expect(
			banner.locator( '.wp-block-post-terms.is-style-badge' )
		).toContainText( 'Ongoing' );
		await expect( banner.locator( '.ts-event-meta' ) ).toContainText(
			'Since August 15, 2023'
		);
		await expect( banner.locator( '.ts-event-meta' ) ).toContainText(
			/Ongoing · [A-Z][a-z]+ \d{4}/
		);
		await expect( banner.locator( '.ts-banner__since' ) ).toHaveText(
			'Since'
		);
		await expect( banner.locator( '.ts-banner__still' ) ).toHaveText(
			/Still running · [A-Z][a-z]{2} \d{4}/
		);
		await expect( page.locator( '.ts-event-ended' ) ).toHaveCount( 0 );
		await expect(
			page.locator( '.wp-block-tekseries-event-countdown' )
		).toHaveCount( 0 );

		// A link to this site opens in the same tab.
		const cta = banner.getByRole( 'link', {
			name: 'Support this workshop',
		} );
		await expect( cta ).toHaveAttribute( 'href', '/contact/#support' );
		await expect( cta ).not.toHaveAttribute( 'target', /.+/ );

		const details = page.locator( '.ts-details' );
		await expect( details ).toContainText( 'Started' );
		await expect( details ).toContainText( 'August 15, 2023' );
		await expect( details ).not.toContainText( 'Since' );
		await expect(
			details.locator( '.ts-event-row', { hasText: 'Status' } )
		).toContainText( 'Ongoing' );
		await expect( details ).not.toContainText( 'Join here' );
	} );

	test( 'its card carries the chip, and the Events page shows it under Happening now', async ( {
		page,
	} ) => {
		await page.goto( workshop.link );
		const card = page.locator( '.ts-post-card', {
			hasText: 'E2E Ongoing Camp',
		} );
		await expect( card.locator( '.ts-ongoing-chip' ) ).toHaveText(
			'Ongoing'
		);
		await expect( card ).toContainText( 'Since August 15, 2023' );
		await expect( card.locator( '.ts-card-date__month' ) ).toHaveText(
			'Aug 2023 – Now'
		);
		// Happening now is on the Events page only.
		await expect( page.locator( '.ts-now' ) ).toHaveCount( 0 );

		await page.goto( '/events/' );
		const now = page.locator( '.ts-now' );
		await expect( now ).toContainText( 'Happening now' );
		await expect( now.locator( '.wp-block-post-title' ) ).toHaveText(
			'E2E Ongoing Camp'
		);
		await expect( now ).toContainText( 'Started Aug 2023' );
		await expect( now ).toContainText(
			/Running for \d+ years?(, \d+ months?)?, and still going\./
		);
		await expect( now ).toContainText( 'Eziama, Ikeduru LGA' );
		await expect(
			now.getByRole( 'link', { name: 'View workshop' } )
		).toHaveAttribute( 'href', event.link );
	} );

	test( 'switched off, it is an ended event again and Happening now goes', async ( {
		page,
		requestUtils,
	} ) => {
		await setOngoing( requestUtils, false );
		try {
			await page.goto( event.link );
			await expect( page.locator( '.ts-ongoing-chip' ) ).toHaveCount( 0 );
			await expect(
				page.locator( '.ts-banner .ts-event-meta' )
			).toContainText( 'August 15, 2023' );
			await expect(
				page.locator( '.ts-banner .ts-event-meta' )
			).not.toContainText( 'Since' );
			await expect(
				page.locator( '.ts-event-ended' ).first()
			).toContainText( 'This event has ended' );
			await expect( page.locator( '.ts-details' ) ).toContainText(
				'Date'
			);

			await page.goto( '/events/' );
			await expect( page.locator( '.ts-now' ) ).toHaveCount( 0 );
		} finally {
			await setOngoing( requestUtils, true );
		}
	} );
} );
