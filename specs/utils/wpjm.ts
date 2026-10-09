import { expect, type Page } from '@playwright/test';
import type { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

type WpPage = { id: number; link: string };
type Name = 'jobs' | 'submit' | 'dashboard';
export type JobPages = Record< Name, WpPage >;

// The pages WP Job Manager's setup wizard would create, and the setting each
// one is chosen in. They stay between runs, like a site's real pages.
const PAGES: Record< Name, [ string, string, string, string ] > = {
	jobs: [ 'job-series', 'Job Series', '', 'job_manager_jobs_page_id' ],
	submit: [
		'submit-a-job',
		'Submit a job',
		'<!-- wp:shortcode -->[submit_job_form]<!-- /wp:shortcode -->',
		'job_manager_submit_job_form_page_id',
	],
	dashboard: [
		'job-dashboard',
		'Job dashboard',
		'<!-- wp:shortcode -->[job_dashboard]<!-- /wp:shortcode -->',
		'job_manager_job_dashboard_page_id',
	],
};

// Checkbox settings as the live site has them.
const LIVE_SETTINGS: Record< string, boolean > = {
	job_manager_hide_filled_positions: true,
};

/**
 * Creates (or updates) the Job Series, submit and dashboard pages, selects
 * them in WP Job Manager's settings (which have no REST API) and matches the
 * live site's other settings.
 *
 * @param requestUtils REST helpers.
 * @param page         A page logged in as an admin.
 */
export async function setUpJobPages(
	requestUtils: RequestUtils,
	page: Page
): Promise< JobPages > {
	const pages = {} as JobPages;
	for ( const [ name, [ slug, title, content ] ] of Object.entries(
		PAGES
	) as [ Name, ( typeof PAGES )[ Name ] ][] ) {
		const [ existing ] = await requestUtils.rest< WpPage[] >( {
			path: '/wp/v2/pages',
			params: { slug, status: 'publish' },
		} );
		pages[ name ] = await requestUtils.rest< WpPage >( {
			method: 'POST',
			path: existing ? `/wp/v2/pages/${ existing.id }` : '/wp/v2/pages',
			data: { slug, title, content, status: 'publish' },
		} );
	}

	await page.goto(
		'/wp-admin/edit.php?post_type=job_listing&page=job-manager-settings'
	);
	for ( const [ name, [ , , , option ] ] of Object.entries( PAGES ) as [
		Name,
		( typeof PAGES )[ Name ],
	][] ) {
		// The select sits in a hidden settings tab.
		await page
			.locator( `select[name="${ option }"]` )
			.selectOption( String( pages[ name ].id ), { force: true } );
	}
	// Hidden tabs: set the checkboxes directly rather than clicking them.
	for ( const [ option, on ] of Object.entries( LIVE_SETTINGS ) ) {
		await page
			.locator( `input[type="checkbox"][name="${ option }"]` )
			.evaluate( ( box: HTMLInputElement, checked ) => {
				box.checked = checked;
			}, on );
	}
	await page.locator( '.job-manager-settings-submit' ).first().click();
	await expect(
		page.getByText( 'Settings successfully saved' )
	).toBeVisible();
	return pages;
}
