import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { setUpJobPages, type JobPages } from './utils/wpjm';

type Job = { id: number };

const TITLE = 'E2E Submitted Job';

test.describe( 'job submission', () => {
	let pages: JobPages;

	test.beforeAll( async ( { requestUtils, browser } ) => {
		// Contexts opened here are logged in as the admin, like the test pages.
		const admin = await browser.newPage();
		pages = await setUpJobPages( requestUtils, admin );
		await admin.close();
	} );

	test.afterAll( async ( { requestUtils } ) => {
		const jobs = await requestUtils.rest< Job[] >( {
			path: '/wp/v2/job-listings',
			params: { search: TITLE, status: 'any' },
		} );
		for ( const job of jobs ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/job-listings/${ job.id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'visitors get the sign-in card and how posting works', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( pages.submit.link );

		await expect(
			page
				.getByRole( 'navigation', { name: 'Breadcrumbs' } )
				.getByRole( 'link' )
		).toHaveText( [ 'Home', 'Job Series' ] );
		const steps = page.getByRole( 'list', { name: 'Submission steps' } );
		await expect( steps.locator( '[aria-current="step"]' ) ).toHaveText(
			/Job details/
		);
		await expect(
			page.getByRole( 'heading', { name: 'Have an account?' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'link', { name: 'Sign in' } )
		).toHaveAttribute( 'href', /wp-login\.php\?redirect_to=/ );
		await expect( page.getByText( 'How posting works' ) ).toBeVisible();
		await expect( page.locator( '#submit-job-form input' ) ).toHaveCount(
			0
		);
		await context.close();
	} );

	test( 'an employer fills in the form, previews and submits, with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
		} );
		const page = await context.newPage();
		await page.goto( pages.submit.link );
		const steps = page.getByRole( 'list', { name: 'Submission steps' } );

		// Step 1: the form, in a "Job details" and a "Company details" card.
		await expect(
			page.getByText( /You are currently signed in as/ )
		).toBeVisible();
		const job = page.getByRole( 'region', { name: 'Job details' } );
		const company = page.getByRole( 'region', { name: 'Company details' } );
		await job.getByLabel( 'Job title' ).fill( TITLE );
		await job.getByLabel( 'Location' ).fill( 'Lagos' );
		await job
			.getByLabel( 'Description' )
			.fill( 'Build things that matter.' );
		await job
			.getByLabel( 'Application email/URL' )
			.fill( 'https://example.com/apply' );
		await company.getByLabel( 'Company name' ).fill( 'Acme Robotics' );

		// A single select draws the design's arrow, with room for it, and
		// keeps it while focused.
		const select = page
			.locator( '.ts-submit-fields select:not([multiple])' )
			.first();
		const arrow = /^url\("data:image\/svg\+xml/;
		await expect( select ).toHaveCSS( 'appearance', 'none' );
		await expect( select ).toHaveCSS( 'padding-right', '44px' );
		await expect( select ).toHaveCSS( 'background-image', arrow );
		await expect( select ).toHaveCSS( 'background-size', '22px auto' );
		await select.focus();
		await expect( select ).toHaveCSS( 'background-image', arrow );
		await expect( select ).toHaveCSS(
			'background-color',
			'rgb(255, 255, 255)'
		);
		await page.getByRole( 'button', { name: 'Preview' } ).click();

		// Step 2: the listing as it will appear, under the preview bar.
		await expect( steps.locator( '[aria-current="step"]' ) ).toHaveText(
			/Preview/
		);
		await expect( page.locator( '.ts-preview__title' ) ).toHaveText(
			TITLE
		);
		await expect( page.locator( '.ts-job-company' ) ).toContainText(
			'Acme Robotics'
		);
		await expect( page.locator( '.ts-job-meta .location' ) ).toContainText(
			'Lagos'
		);
		// A preview is the employer's own listing: no CV link in it.
		await expect(
			page.getByRole( 'link', { name: 'Upload your CV to Job Series' } )
		).toHaveCount( 0 );
		await page.getByRole( 'button', { name: 'Submit listing' } ).click();

		// Done: submitted for approval, with the way to the dashboard.
		await expect( steps.locator( '[aria-current="step"]' ) ).toHaveText(
			/Submitted/
		);
		await expect( page.getByRole( 'status' ) ).toContainText(
			`${ TITLE } submitted`
		);
		await expect(
			page.getByRole( 'link', { name: 'Go to job dashboard' } )
		).toHaveAttribute( 'href', pages.dashboard.link );
		await context.close();
	} );
} );
