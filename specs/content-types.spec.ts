import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };

test.describe( 'event content types', () => {
	let term: Linked;
	let event: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		// Re-activating runs the activation hook, which must add the event rewrite rules.
		await requestUtils.deactivatePlugin( 'tekseries-blocks' );
		await requestUtils.activatePlugin( 'tekseries-blocks' );

		term = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event_type',
			data: { name: 'E2E Webinar' },
		} );
		event = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/event',
			data: {
				title: 'E2E Event',
				status: 'publish',
				event_type: [ term.id ],
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/event/${ event.id }`,
			params: { force: true },
		} );
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/event_type/${ term.id }`,
			params: { force: true },
		} );
	} );

	test( 'event keeps its archive slug and REST base', async ( {
		requestUtils,
	} ) => {
		const type = await requestUtils.rest( { path: '/wp/v2/types/event' } );
		expect( type ).toMatchObject( {
			slug: 'event',
			rest_base: 'event',
			has_archive: 'events',
			taxonomies: [ 'event_type' ],
		} );
	} );

	test( 'event_type is attached to events', async ( { requestUtils } ) => {
		const taxonomy = await requestUtils.rest( {
			path: '/wp/v2/taxonomies/event_type',
		} );
		expect( taxonomy ).toMatchObject( {
			slug: 'event_type',
			rest_base: 'event_type',
			types: [ 'event' ],
		} );
	} );

	test( 'event URLs resolve', async ( { page } ) => {
		expect( event.link ).toMatch( /\/event\/e2e-event\/$/ );
		expect( term.link ).toMatch( /\/event_type\/e2e-webinar\/$/ );

		for ( const url of [ event.link, '/events/', term.link ] ) {
			const response = await page.goto( url );
			expect( response?.status(), url ).toBe( 200 );
		}
	} );
} );
