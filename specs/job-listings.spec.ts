import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';
import { setUpJobPages } from './utils/wpjm';

type Linked = { id: number; link: string };
type Term = { id: number; slug: string };

test.describe( 'Job Listings block', () => {
	const jobs: number[] = [];
	let category: Term;
	let listing: Linked;

	test.beforeAll( async ( { requestUtils, browser } ) => {
		// Contexts opened here are logged in as the admin, like the test pages.
		const admin = await browser.newPage();
		await setUpJobPages( requestUtils, admin );
		await admin.close();

		const types = await requestUtils.rest< Term[] >( {
			path: '/wp/v2/job-types',
			params: { slug: 'full-time,internship' },
		} );
		const type = ( slug: string ) =>
			types.filter( ( term ) => term.slug === slug ).map( ( t ) => t.id );
		category = await requestUtils.rest< Term >( {
			method: 'POST',
			path: '/wp/v2/job-categories',
			data: { name: 'E2E Engineering' },
		} );

		// Oldest first, so the list (newest first) reads C, B, A.
		for ( const [ title, date, data ] of [
			[
				'E2E Listing A Welder',
				'2026-01-01T10:00:00',
				{
					'job-types': type( 'full-time' ),
					meta: {
						_company_name: 'Forge Works',
						_job_location: 'Kano',
					},
				},
			],
			[
				'E2E Listing B Intern',
				'2026-01-02T10:00:00',
				{
					'job-types': type( 'internship' ),
					'job-categories': [ category.id ],
					meta: {
						_company_name: 'Acme Labs',
						_job_location: 'Lagos',
					},
				},
			],
			[
				'E2E Listing C Remote',
				'2026-01-03T10:00:00',
				{
					'job-types': type( 'full-time' ),
					meta: {
						_company_name: 'Cloud Co',
						_job_location: 'Lagos',
						_remote_position: 1,
					},
				},
			],
		] as const ) {
			const job = await requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/job-listings',
				data: { title, date, status: 'publish', ...data },
			} );
			jobs.push( job.id );
		}

		listing = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Job Listings',
				status: 'publish',
				content: '<!-- wp:tekseries/job-listings {"perPage":2} /-->',
			},
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
			path: `/wp/v2/job-categories/${ category.id }`,
			params: { force: true },
		} );
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ listing.id }`,
			params: { force: true },
		} );
	} );

	test( 'lists jobs newest first, searches and pages with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( listing.link );

		const rows = page.locator( 'ul.job_listings > li.job_listing' );
		const titles = rows.getByRole( 'heading' );
		await expect( page.locator( '.showing_jobs' ) ).toHaveText(
			'3 open jobs'
		);
		// The job titles (h3) sit under a heading of the list, read out only.
		await expect(
			page.getByRole( 'heading', { level: 2, name: 'Job listings' } )
		).toBeAttached();
		await expect(
			page.getByRole( 'region', { name: 'Job listings' } )
		).toBeVisible();
		await expect( titles ).toHaveText( [
			'E2E Listing C Remote',
			'E2E Listing B Intern',
		] );
		await expect( rows.first() ).toHaveClass( /\bpost-\d+\b/ );
		await expect( rows.first().locator( '.location' ) ).toHaveText(
			'Lagos (Remote)'
		);
		await expect( rows.nth( 1 ).locator( '.job-type' ) ).toHaveText(
			'Internship'
		);

		// Real page links.
		const pages = page.getByRole( 'navigation', { name: 'Job pages' } );
		await pages.getByRole( 'link', { name: 'Next page' } ).click();
		await expect( page ).toHaveURL( /[?&]pg=2/ );
		await expect( titles ).toHaveText( [ 'E2E Listing A Welder' ] );

		// The search form submits as a plain GET form.
		const search = page.getByRole( 'search', { name: 'Search jobs' } );
		await search.getByLabel( 'Location' ).fill( 'Lagos' );
		await search.getByRole( 'button', { name: 'Search jobs' } ).click();
		await expect( page ).toHaveURL( /search_location=Lagos/ );
		await expect( page.locator( '.showing_jobs' ) ).toHaveText(
			'2 jobs match your search'
		);
		await expect( search.getByLabel( 'Location' ) ).toHaveValue( 'Lagos' );

		// Unticking a type leaves it out; the remote switch keeps remote jobs.
		// The chips and the switch are labels over hidden checkboxes.
		await search.getByText( 'Internship', { exact: true } ).click();
		await expect( search.getByLabel( 'Internship' ) ).not.toBeChecked();
		await search.getByText( 'Remote positions only' ).click();
		await expect(
			search.getByRole( 'switch', { name: 'Remote positions only' } )
		).toBeChecked();
		await search.getByRole( 'button', { name: 'Search jobs' } ).click();
		await expect( titles ).toHaveText( [ 'E2E Listing C Remote' ] );

		// Category select.
		await page.goto(
			`${ listing.link }?search_category=${ category.slug }`
		);
		await expect( titles ).toHaveText( [ 'E2E Listing B Intern' ] );
		await expect(
			page.getByRole( 'combobox', { name: 'Category' } )
		).toHaveValue( category.slug );

		// Nothing found: a way back to every job.
		await page.goto(
			`${ listing.link }?search_keywords=nothing-like-this`
		);
		await expect(
			page.getByText( 'No jobs match these filters' )
		).toBeVisible();
		await page.getByRole( 'link', { name: 'Clear filters' } ).click();
		await expect( page.locator( '.showing_jobs' ) ).toHaveText(
			'3 open jobs'
		);
		await context.close();
	} );

	test( 'keeps the filters on page links', async ( { page } ) => {
		await page.goto(
			`${ listing.link }?filter_job_type[]=full-time&filter_job_type[]=internship`
		);
		const next = page
			.getByRole( 'navigation', { name: 'Job pages' } )
			.getByRole( 'link', { name: '2' } );
		await expect( next ).toHaveAttribute( 'href', /filter_job_type/ );
		await expect( next ).toHaveAttribute( 'href', /pg=2/ );
	} );

	test( 'records search impressions and loads no React or jQuery', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( listing.link );

		const stats = await page.evaluate(
			() =>
				(
					window as unknown as {
						job_manager_stats?: { stats: { name: string }[] };
					}
				 ).job_manager_stats?.stats.map( ( stat ) => stat.name ) ?? []
		);
		expect( stats ).toContain( 'job_search_impression' );
		expect(
			scripts.filter( ( url ) => /react|jquery/i.test( url ) )
		).toEqual( [] );
		await context.close();
	} );

	// With JavaScript, the same form and links update the results in place.
	test( 'searches and pages in place, and still counts impressions', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		// What WP Job Manager's statistics script sends.
		const counted: string[] = [];
		page.on( 'request', ( request ) => {
			scripts.push( request.url() );
			if ( request.url().includes( 'admin-ajax.php' ) ) {
				counted.push( decodeURIComponent( request.postData() ?? '' ) );
			}
		} );
		await page.goto( listing.link );
		// Lost if the browser loads a new page.
		await page.evaluate( () => {
			( window as unknown as { stays?: boolean } ).stays = true;
		} );

		const search = page.getByRole( 'search', { name: 'Search jobs' } );
		const results = page.getByRole( 'region', { name: 'Job listings' } );
		const titles = results
			.locator( 'ul.job_listings > li.job_listing' )
			.getByRole( 'heading' );
		// A status, so the new count is read out.
		const count = results.getByRole( 'status' );
		await expect( count ).toHaveText( '3 open jobs' );

		// Typing is enough: the list follows, and the field keeps focus.
		await search.getByLabel( 'Location' ).pressSequentially( 'Lagos' );
		await expect( count ).toHaveText( '2 jobs match your search' );
		await expect( page ).toHaveURL( /\?search_location=Lagos$/ );
		await expect( search.getByLabel( 'Location' ) ).toBeFocused();
		await expect( search.getByLabel( 'Location' ) ).toHaveValue( 'Lagos' );

		// So is a chip.
		await search.getByText( 'Internship', { exact: true } ).click();
		await expect( titles ).toHaveText( [ 'E2E Listing C Remote' ] );
		await expect( page ).toHaveURL( /filter_job_type/ );

		// Nothing found: "Clear filters" empties the form too.
		await search.getByLabel( 'Keywords' ).fill( 'nothing-like-this' );
		await page.keyboard.press( 'Enter' );
		await expect(
			results.getByText( 'No jobs match these filters' )
		).toBeVisible();
		await results.getByRole( 'link', { name: 'Clear filters' } ).click();
		await expect( count ).toHaveText( '3 open jobs' );
		await expect( search.getByLabel( 'Keywords' ) ).toHaveValue( '' );
		await expect( search.getByLabel( 'Location' ) ).toHaveValue( '' );
		await expect( search.getByLabel( 'Internship' ) ).toBeChecked();
		await expect( search.getByLabel( 'Keywords' ) ).toBeFocused();

		// The next page replaces the list, takes focus to the results, and
		// its job is counted as seen.
		await results
			.getByRole( 'navigation', { name: 'Job pages' } )
			.getByRole( 'link', { name: 'Next page' } )
			.click();
		await expect( titles ).toHaveText( [ 'E2E Listing A Welder' ] );
		await expect( page ).toHaveURL( /[?&]pg=2/ );
		await expect( results ).toBeFocused();
		await expect
			.poll(
				() =>
					counted.some(
						( sent ) =>
							sent.includes( 'job_search_impression' ) &&
							sent.includes( `"post_id":${ jobs[ 0 ] }` )
					),
				{ timeout: 15000 }
			)
			.toBe( true );

		// Back undoes it, and none of this loaded a new page.
		await page.goBack();
		await expect( titles ).toHaveText( [
			'E2E Listing C Remote',
			'E2E Listing B Intern',
		] );
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

	test( 'is insertable and valid in the page editor', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { postType: 'page' } );
		const patterns = page.getByRole( 'dialog', {
			name: 'Choose a pattern',
		} );
		if ( await patterns.isVisible() ) {
			await patterns.getByRole( 'button', { name: 'Close' } ).click();
		}
		await editor.insertBlock( { name: 'tekseries/job-listings' } );
		await expect(
			editor.canvas.getByRole( 'button', { name: 'Search jobs' } )
		).toBeVisible();
		expect( await invalidBlocks( page ) ).toEqual( [] );
	} );
} );
