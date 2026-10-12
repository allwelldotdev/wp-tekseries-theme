import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { setUpJobPages, type JobPages } from './utils/wpjm';

type Linked = { id: number; link: string };
type Term = { id: number };

const DESCRIPTION =
	'<h1>About the role</h1><p>Build things.</p><ul><li>Ship often</li></ul>';

test.describe( 'single job', () => {
	const jobs: Record< string, Linked > = {};
	let pages: JobPages;

	test.beforeAll( async ( { requestUtils, browser } ) => {
		// Contexts opened here are logged in as the admin, like the test pages.
		const admin = await browser.newPage();
		pages = await setUpJobPages( requestUtils, admin );
		await admin.close();

		const types = await requestUtils.rest< Term[] >( {
			path: '/wp/v2/job-types',
			params: { slug: 'full-time' },
		} );
		const create = ( title: string, meta: object ) =>
			requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/job-listings',
				data: {
					title,
					status: 'publish',
					content: DESCRIPTION,
					'job-types': types.map( ( type ) => type.id ),
					meta,
				},
			} );

		jobs.filled = await create( 'E2E Job Filled', {
			_company_name: 'Filled Co',
			_filled: 1,
		} );
		jobs.email = await create( 'E2E Job Email', {
			_company_name: 'Mail Co',
			_job_location: 'Abuja',
			_application: 'jobs@example.com',
		} );
		jobs.remote = await create( 'E2E Job Remote', {
			_company_name: 'Acme Robotics',
			_company_tagline: 'Robots for good',
			_job_location: 'Lagos',
			_remote_position: 1,
			_application: 'https://example.com/apply',
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const job of Object.values( jobs ) ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/job-listings/${ job.id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'shows the hero, details, apply box and more jobs, with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		const scripts: string[] = [];
		page.on( 'request', ( request ) => scripts.push( request.url() ) );
		await page.goto( jobs.remote!.link );

		// Hero: Home / Job Series / title, then the type, location and date chips.
		const crumbs = page.getByRole( 'navigation', { name: 'Breadcrumbs' } );
		await expect( crumbs.getByRole( 'link' ) ).toHaveText( [
			'Home',
			'Job Series',
		] );
		await expect(
			crumbs.getByRole( 'link', { name: 'Job Series' } )
		).toHaveAttribute( 'href', pages.jobs.link );
		await expect( page.getByRole( 'heading', { level: 1 } ) ).toHaveText(
			'E2E Job Remote'
		);
		await expect( page.locator( '.ts-job-chip .ts-job-value' ) ).toHaveText(
			[ 'Full Time', 'Lagos (Remote)', /^Posted .+ ago$/ ]
		);

		// The type icon replaces the template's "work" icon.
		const drawing = ( selector: string ) =>
			page
				.locator( `${ selector } svg path` )
				.first()
				.getAttribute( 'd' );
		expect( await drawing( '.ts-job-type-icon' ) ).not.toBe(
			await drawing( '.ts-hero-watermark' )
		);
		expect( await drawing( '.ts-job-type-icon' ) ).toBe(
			await drawing( '.ts-job-meta .job-type' )
		);

		// Side card: company, details, and a closed apply box that opens natively.
		const card = page.locator( '.ts-job__card' );
		await expect( card.locator( '.ts-job-company' ) ).toContainText(
			'Acme Robotics'
		);
		await expect( card.locator( '.ts-job-tile' ) ).toHaveText( 'AR' );
		await expect( card.locator( '.ts-job-meta li' ) ).toHaveText( [
			'Job type: Full Time',
			'Location: Lagos (Remote)',
			/Posted: .+ ago/,
		] );
		const details = card.locator( '.application_details' );
		await expect( details ).toBeHidden();
		await card.getByText( 'Apply for job' ).click();
		await expect( details ).toHaveText(
			'To apply for this job, visit example.com.'
		);
		await expect( details.getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'https://example.com/apply'
		);
		// Under the apply box, the way to leave a CV with Job Series. The site
		// has no page for it yet, so the link is "#" until one is filtered in.
		await expect(
			card.getByRole( 'link', { name: 'Upload your CV to Job Series' } )
		).toHaveAttribute( 'href', '#' );

		// Under the description: straight to the application, and back to the list.
		const actions = page.locator( '.ts-job__actions' );
		await expect(
			actions.getByRole( 'link', { name: 'Apply for job' } )
		).toHaveAttribute( 'href', 'https://example.com/apply' );
		await expect(
			actions.getByRole( 'link', { name: 'All jobs' } )
		).toHaveAttribute( 'href', pages.jobs.link );
		await expect( page.getByRole( 'note' ) ).toContainText(
			'third-party sources'
		);

		// More jobs: other open jobs only.
		const more = page.locator( '.ts-job-card' );
		await expect( more.getByRole( 'heading' ) ).toHaveText( [
			'E2E Job Email',
		] );
		await expect( more.locator( '.ts-job-value' ) ).toHaveText( [
			'Mail Co',
			'Full Time',
			'Abuja',
			/^Posted .+ ago$/,
		] );

		// No jQuery and no WP Job Manager styles on this page.
		expect(
			scripts.filter( ( url ) =>
				/jquery|job-application|wp-job-manager\/assets\/dist\/css/.test(
					url
				)
			)
		).toEqual( [] );
		await context.close();
	} );

	test( 'an email application opens a new email', async ( { page } ) => {
		await page.goto( jobs.email!.link );
		await expect(
			page
				.locator( '.ts-job__actions' )
				.getByRole( 'link', { name: 'Apply for job' } )
		).toHaveAttribute( 'href', /^mailto:.+\?subject=/ );
		await page.locator( '.ts-job-apply summary' ).click();
		await expect( page.locator( '.application_details' ) ).toContainText(
			'email your details to'
		);
	} );
} );
