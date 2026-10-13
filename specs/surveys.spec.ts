import type { BrowserContext, Page } from '@playwright/test';
import { test, expect, type Admin } from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };
// What the stand-in for Formbricks' script writes down.
type Recorded = Window & {
	e2eFormbricks?: { setup: Record< string, string >[]; tracked: string[] };
};

const SERVER = 'https://forms.example.test';
// In place of Formbricks' own script: it notes how it was set up and which
// actions were fired.
const STAND_IN = `
	window.e2eFormbricks = { setup: [], tracked: [] };
	window.formbricks = {
		setup: ( config ) => {
			window.e2eFormbricks.setup.push( config );
			return Promise.resolve();
		},
		track: ( action ) => {
			window.e2eFormbricks.tracked.push( action );
		},
	};
`;
const VISITOR = { storageState: { cookies: [], origins: [] } };

const button = ( text: string, href: string, className = '' ) =>
	`<!-- wp:button ${
		className ? `{"className":"${ className }"} ` : ''
	}--><div class="wp-block-button${
		className ? ` ${ className }` : ''
	}"><a class="wp-block-button__link wp-element-button" href="${ href }">${ text }</a></div><!-- /wp:button -->`;

// Settings, Forms (Formbricks).
const connect = async (
	admin: Admin,
	page: Page,
	url: string,
	id: string,
	idName = 'workspaceId'
) => {
	await admin.visitAdminPage( 'options-general.php', 'page=tekseries-forms' );
	await page.getByLabel( 'SDK connection URL' ).fill( url );
	await page.getByLabel( 'ID', { exact: true } ).fill( id );
	await page.getByLabel( 'Formbricks calls this ID' ).selectOption( idName );
	await page.getByRole( 'button', { name: 'Save Changes' } ).click();
	await expect(
		page.locator( '#setting-error-settings_updated' )
	).toBeVisible();
};

const recorded = ( page: Page ) =>
	page.evaluate( () => ( window as Recorded ).e2eFormbricks );

// A Button with the class "ts-survey-<key>" opens the Formbricks form whose
// action has that key, and stays a link for everyone it cannot open for.
test.describe( 'forms from Formbricks', () => {
	let made: Linked;
	let job: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		made = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Survey Buttons',
				status: 'publish',
				content:
					'<!-- wp:buttons --><div class="wp-block-buttons">' +
					button(
						'Upload your CV',
						'/?s=cv-without-the-form',
						'is-style-outline ts-survey-upload-cv'
					) +
					button( 'No link yet', '#', 'ts-survey-makers-prize' ) +
					button( 'Plain', '/?s=plain' ) +
					'</div><!-- /wp:buttons -->',
			},
		} );
		job = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/job-listings',
			data: {
				title: 'E2E Survey Job',
				status: 'publish',
				content: '<p>Build things.</p>',
				meta: {
					_company_name: 'Acme Robotics',
					_application: 'https://example.com/apply',
				},
			},
		} );
	} );

	test.afterAll( async ( { requestUtils, browser } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ made.id }`,
			params: { force: true },
		} );
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/job-listings/${ job.id }`,
			params: { force: true },
		} );
		// Leave the site as other specs expect it: not connected.
		const page = await browser.newPage();
		await page.goto( '/wp-admin/options-general.php?page=tekseries-forms' );
		await page.getByLabel( 'SDK connection URL' ).fill( '' );
		await page.getByLabel( 'ID', { exact: true } ).fill( '' );
		await page.getByRole( 'button', { name: 'Save Changes' } ).click();
		await expect(
			page.getByText(
				'Not connected yet: marked buttons are ordinary links.'
			)
		).toBeVisible();
		await page.close();
	} );

	// A visitor's browser in which Formbricks' server answers with the
	// stand-in, or cannot be reached.
	const visit = async (
		context: BrowserContext,
		reachable: boolean
	): Promise< { page: Page; asked: string[] } > => {
		const asked: string[] = [];
		await context.route( `${ SERVER }/**`, ( route ) => {
			asked.push( route.request().url() );
			return reachable
				? route.fulfill( {
						contentType: 'application/javascript',
						body: STAND_IN,
					} )
				: route.abort();
		} );
		const page = await context.newPage();
		await page.goto( made.link );
		return { page, asked };
	};

	test( 'the settings take an https address and clean what is typed', async ( {
		admin,
		page,
	} ) => {
		await admin.visitAdminPage(
			'options-general.php',
			'page=tekseries-forms'
		);
		const url = page.getByLabel( 'SDK connection URL' );
		const id = page.getByLabel( 'ID', { exact: true } );

		// Not https: a browser would refuse its script on this site.
		await url.fill( 'http://forms.example.test' );
		await id.fill( 'ws_123' );
		await page.getByRole( 'button', { name: 'Save Changes' } ).click();
		await expect(
			page.getByText(
				'The SDK connection URL was not saved: it must start with https://.'
			)
		).toBeVisible();
		await expect( url ).toHaveValue( '' );
		await expect(
			page.getByText(
				'Not connected yet: marked buttons are ordinary links.'
			)
		).toBeVisible();

		// The address is kept without its last slash or anything after "?",
		// and the ID without stray characters.
		await connect(
			admin,
			page,
			`${ SERVER }/?utm=x`,
			' ws_123 "',
			'environmentId'
		);
		await expect( url ).toHaveValue( SERVER );
		await expect( id ).toHaveValue( 'ws_123' );
		await expect(
			page.getByLabel( 'Formbricks calls this ID' )
		).toHaveValue( 'environmentId' );
		await expect(
			page.getByText( 'Connected: marked buttons open their form.' )
		).toBeVisible();
	} );

	test( 'a marked button opens its form over the page', async ( {
		admin,
		page: adminPage,
		browser,
	} ) => {
		await connect( admin, adminPage, SERVER, 'ws_123' );
		const context = await browser.newContext( VISITOR );
		const { page, asked } = await visit( context, true );
		const cv = page.getByRole( 'link', { name: 'Upload your CV' } );

		// Nothing is fetched from Formbricks until a visitor reaches for
		// the button.
		await page.waitForLoadState( 'load' );
		expect( asked ).toEqual( [] );
		await cv.hover();
		await expect
			.poll( () => asked )
			.toEqual( [ `${ SERVER }/js/formbricks.umd.cjs` ] );

		await cv.click();
		await expect
			.poll( async () => ( await recorded( page ) )?.tracked )
			.toEqual( [ 'upload-cv' ] );
		expect( ( await recorded( page ) )?.setup ).toEqual( [
			{ workspaceId: 'ws_123', appUrl: SERVER },
		] );
		// The link was not followed, and the button is ready again.
		expect( page.url() ).toBe( made.link );
		await expect( cv ).not.toHaveAttribute( 'aria-busy', 'true' );

		// Each button fires its own action; Formbricks is set up once.
		await page.getByRole( 'link', { name: 'No link yet' } ).click();
		await expect
			.poll( async () => ( await recorded( page ) )?.tracked )
			.toEqual( [ 'upload-cv', 'makers-prize' ] );
		expect( ( await recorded( page ) )?.setup ).toHaveLength( 1 );
		expect( asked ).toHaveLength( 1 );

		// A button without the class is an ordinary link.
		await expect(
			page.getByRole( 'link', { name: 'Plain' } )
		).not.toHaveAttribute( 'data-wp-on--click' );

		// "Upload your CV to Job Series" on a job opens the same form.
		await page.goto( job.link );
		await page
			.getByRole( 'link', { name: 'Upload your CV to Job Series' } )
			.click();
		await expect
			.poll( async () => ( await recorded( page ) )?.tracked )
			.toEqual( [ 'upload-cv' ] );
		await context.close();
	} );

	test( 'the link is followed when Formbricks cannot be reached, and without JavaScript', async ( {
		admin,
		page: adminPage,
		browser,
	} ) => {
		await connect( admin, adminPage, SERVER, 'ws_123' );
		const context = await browser.newContext( VISITOR );
		const { page } = await visit( context, false );

		// No link to follow: the button does nothing, and does not break.
		const errors: string[] = [];
		page.on( 'pageerror', ( error ) => errors.push( String( error ) ) );
		const empty = page.getByRole( 'link', { name: 'No link yet' } );
		await empty.click();
		await expect( empty ).not.toHaveAttribute( 'aria-busy', 'true' );
		expect( page.url() ).toBe( made.link );
		expect( errors ).toEqual( [] );

		await page.getByRole( 'link', { name: 'Upload your CV' } ).click();
		await page.waitForURL( /\?s=cv-without-the-form/ );
		await context.close();

		const plain = await browser.newContext( {
			...VISITOR,
			javaScriptEnabled: false,
		} );
		const noScript = await plain.newPage();
		await noScript.goto( made.link );
		await noScript.getByRole( 'link', { name: 'Upload your CV' } ).click();
		await noScript.waitForURL( /\?s=cv-without-the-form/ );
		await plain.close();
	} );

	test( 'until Formbricks is connected the buttons are plain links', async ( {
		admin,
		page: adminPage,
		browser,
	} ) => {
		await connect( admin, adminPage, '', '' );
		const context = await browser.newContext( VISITOR );
		const page = await context.newPage();
		const requested: string[] = [];
		page.on( 'request', ( request ) => requested.push( request.url() ) );
		await page.goto( made.link );
		await page.waitForLoadState( 'load' );
		await expect(
			page.getByRole( 'link', { name: 'Upload your CV' } )
		).not.toHaveAttribute( 'data-wp-on--click' );
		expect(
			requested.filter( ( url ) => url.includes( '/build/surveys/' ) )
		).toEqual( [] );
		await context.close();
	} );
} );
