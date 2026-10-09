import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };
type Term = { id: number; slug: string };

const bound = ( key: string ) =>
	`<!-- wp:paragraph {"className":"e2e-${ key }","metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"${ key }"}}}}} -->` +
	`<p class="e2e-${ key }"></p><!-- /wp:paragraph -->`;

// A Query Loop over the test jobs, one bound Paragraph per job field.
const LIST =
	'<!-- wp:query {"queryId":7,"query":{"postType":"job_listing","perPage":10,"order":"asc","orderBy":"title","search":"E2E Bound","inherit":false}} -->' +
	'<div class="wp-block-query"><!-- wp:post-template -->' +
	'<!-- wp:post-title /-->' +
	[ 'company', 'location', 'posted', 'type' ].map( bound ).join( '' ) +
	'<!-- /wp:post-template --></div><!-- /wp:query -->';

test.describe( 'job field binding source', () => {
	const jobs: number[] = [];
	let page: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		const types = await requestUtils.rest< Term[] >( {
			path: '/wp/v2/job-types',
			params: { slug: 'full-time' },
		} );
		const create = ( title: string, data: object ) =>
			requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/job-listings',
				data: { title, status: 'publish', ...data },
			} );

		for ( const job of [
			await create( 'E2E Bound A Remote', {
				'job-types': types.map( ( type ) => type.id ),
				meta: {
					_company_name: 'Acme Robotics',
					_job_location: 'Lagos',
					_remote_position: 1,
				},
			} ),
			await create( 'E2E Bound B Plain', {} ),
		] ) {
			jobs.push( job.id );
		}

		page = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: { title: 'E2E Job Fields', status: 'publish', content: LIST },
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of jobs ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/job-listings/${ id }`,
				params: { force: true },
			} );
		}
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ page.id }`,
			params: { force: true },
		} );
	} );

	test( 'bound paragraphs show each job’s fields, with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const visitor = await context.newPage();
		await visitor.goto( page.link );

		const rows = visitor.locator( '.wp-block-post-template > li' );
		const full = rows.nth( 0 );
		const plain = rows.nth( 1 );
		await expect( full.locator( '.e2e-company' ) ).toHaveText(
			'Acme Robotics'
		);
		await expect( full.locator( '.e2e-location' ) ).toHaveText(
			'Lagos (Remote)'
		);
		await expect( full.locator( '.e2e-posted' ) ).toHaveText(
			/^Posted .+ ago$/
		);
		await expect( full.locator( '.e2e-type' ) ).toHaveText( 'Full Time' );

		// A job with no details: no company or type, location "Anywhere".
		await expect( plain.locator( '.e2e-company' ) ).toHaveText( '' );
		await expect( plain.locator( '.e2e-location' ) ).toHaveText(
			'Anywhere'
		);
		await expect( plain.locator( '.e2e-type' ) ).toHaveText( '' );
		await context.close();
	} );
} );
