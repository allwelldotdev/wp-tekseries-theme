import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { setUpJobPages, type JobPages } from './utils/wpjm';

type Linked = { id: number; link: string };

const EMPLOYER = { username: 'e2e-employer', password: 'e2e-Employer-Pass-1' };

test.describe( 'job dashboard', () => {
	let pages: JobPages;
	let employer: { id: number };
	const jobs: number[] = [];

	test.beforeAll( async ( { requestUtils, browser } ) => {
		// Contexts opened here are logged in as the admin, like the test pages.
		const admin = await browser.newPage();
		pages = await setUpJobPages( requestUtils, admin );
		await admin.close();

		employer = await requestUtils.rest( {
			method: 'POST',
			path: '/wp/v2/users',
			data: {
				...EMPLOYER,
				email: 'e2e-employer@example.com',
				roles: [ 'employer' ],
			},
		} );
		for ( const [ title, status ] of [
			[ 'E2E Dashboard Draft', 'draft' ],
			[ 'E2E Dashboard Pending', 'pending' ],
			[ 'E2E Dashboard Live', 'publish' ],
		] ) {
			const job = await requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/job-listings',
				data: {
					title,
					status,
					author: employer.id,
					meta: { _company_name: 'Acme Robotics', _filled: 0 },
				},
			} );
			jobs.push( job.id );
		}
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
			path: `/wp/v2/users/${ employer.id }`,
			params: { force: true, reassign: 1 },
		} );
	} );

	test( 'visitors are asked to sign in', async ( { browser } ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( pages.dashboard.link );
		await expect(
			page.getByRole( 'heading', { name: 'Sign in to manage your jobs' } )
		).toBeVisible();
		await expect(
			page.getByRole( 'link', { name: 'Sign in', exact: true } )
		).toHaveAttribute( 'href', /wp-login\.php\?redirect_to=/ );
		await context.close();
	} );

	test( 'an employer manages their jobs, with JavaScript off', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( '/wp-login.php' );
		await page.locator( '#user_login' ).fill( EMPLOYER.username );
		await page.locator( '#user_pass' ).fill( EMPLOYER.password );
		await page.locator( '#wp-submit' ).click();
		await page.goto( pages.dashboard.link );

		const table = page.getByRole( 'table', { name: 'Your job listings' } );
		const row = ( title: string ) =>
			table.getByRole( 'row' ).filter( { hasText: title } );
		await expect( table.getByRole( 'columnheader' ) ).toHaveText( [
			'Title',
			'Date',
			'Views',
			'Actions',
		] );
		await expect(
			row( 'E2E Dashboard Live' ).locator( '.job-status' )
		).toHaveText( 'Published' );
		await expect(
			row( 'E2E Dashboard Pending' ).locator( '.job-status' )
		).toHaveText( 'Pending approval' );

		// The main action: Continue for a draft, Edit for a published job,
		// never Delete (a pending job can't be edited here).
		await expect(
			row( 'E2E Dashboard Pending' ).locator(
				'.jm-dashboard-action--primary'
			)
		).toHaveText( 'Duplicate' );
		await expect(
			row( 'E2E Dashboard Draft' ).locator(
				'.jm-dashboard-action--primary'
			)
		).toHaveText( 'Continue Submission' );
		const live = row( 'E2E Dashboard Live' );
		await expect(
			live.locator( '.jm-dashboard-action--primary' )
		).toHaveText( 'Edit' );

		// The others sit in a native disclosure menu.
		await live.getByLabel( 'More actions' ).click();
		const menu = live.locator( '.jm-ui-action-menu__content' );
		await expect( menu.getByRole( 'link' ) ).toContainText( [
			'Mark filled',
			'Duplicate',
			'Delete',
		] );
		await menu.getByRole( 'link', { name: 'Mark filled' } ).click();
		await expect(
			row( 'E2E Dashboard Live' ).locator( '.job-status' )
		).toContainText( 'Filled' );

		// Search narrows the list; the signed-in line names the employer.
		await page.getByLabel( 'Search your jobs' ).fill( 'Pending' );
		await page.getByLabel( 'Search your jobs' ).press( 'Enter' );
		await expect( table.locator( '.job-title' ) ).toHaveText( [
			'E2E Dashboard Pending',
		] );
		await expect(
			page.getByText( 'Signed in as e2e-employer' )
		).toBeVisible();
		await context.close();
	} );
} );
