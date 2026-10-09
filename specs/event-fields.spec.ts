import { test, expect } from '@wordpress/e2e-test-utils-playwright';

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
} );
