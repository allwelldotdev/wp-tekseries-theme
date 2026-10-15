import type { Page } from '@playwright/test';
import {
	test,
	expect,
	type Admin,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };
// What the stand-in for Formbricks' script writes down.
type Recorded = Window & {
	e2eFormbricks?: { tracked: string[]; hidden: unknown[] };
};

const DAY = 24 * 60 * 60 * 1000;
const SERVER = 'https://forms.example.test';
const VISITOR = { storageState: { cookies: [], origins: [] } };
const NO_JS = { ...VISITOR, javaScriptEnabled: false };

// In place of Formbricks' own script: notes the actions fired and their
// hidden fields.
const STAND_IN = `
	window.e2eFormbricks = { tracked: [], hidden: [] };
	window.formbricks = {
		setup: () => Promise.resolve(),
		track: ( action, options ) => {
			window.e2eFormbricks.tracked.push( action );
			window.e2eFormbricks.hidden.push( options ? options.hiddenFields : null );
			return Promise.resolve();
		},
	};
`;

// A deadline is written in Nigerian time, which is UTC+1 all year.
const lagos = ( time: number ) =>
	new Date( time + 60 * 60 * 1000 ).toISOString().slice( 0, 19 );

// Settings, Forms (Formbricks): empty strings disconnect.
const connect = async ( admin: Admin, page: Page, url: string, id: string ) => {
	await admin.visitAdminPage( 'options-general.php', 'page=tekseries-forms' );
	await page.getByLabel( 'SDK connection URL' ).fill( url );
	await page.getByLabel( 'ID', { exact: true } ).fill( id );
	await page.getByRole( 'button', { name: 'Save Changes' } ).click();
	await expect(
		page.locator( '#setting-error-settings_updated' )
	).toBeVisible();
};

// The Maker Prize page from the theme's pattern (boards MakerPrize*), at the
// address the site gives it, before and after its deadline.
test.describe( 'Maker Prize page', () => {
	let page: Linked;

	const publish = ( requestUtils: RequestUtils, deadline: number ) =>
		requestUtils.rest< Linked >( {
			method: 'POST',
			path: `/wp/v2/pages${ page ? `/${ page.id }` : '' }`,
			data: {
				title: 'Maker Prize',
				slug: 'maker-prize',
				status: 'publish',
				template: 'page-no-title',
				content:
					'<!-- wp:pattern {"slug":"tekseries/page-maker-prize"} /-->',
				meta: { tekseries_deadline: lagos( deadline ) },
			},
		} );

	test.beforeAll( async ( { requestUtils } ) => {
		page = await publish( requestUtils, Date.now() + 30 * DAY );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ page.id }`,
			params: { force: true },
		} );
	} );

	test( 'sits under What We Do in its breadcrumbs', async ( { browser } ) => {
		const context = await browser.newContext( VISITOR );
		const visitor = await context.newPage();
		await visitor.goto( page.link );
		const crumbs = visitor.getByRole( 'navigation', {
			name: 'Breadcrumbs',
		} );
		await expect( crumbs.getByRole( 'listitem' ) ).toHaveText( [
			'Home',
			'What We Do',
			'Maker Prize',
		] );
		await expect(
			crumbs.getByRole( 'link', { name: 'What We Do' } )
		).toHaveAttribute( 'href', /\/#services$/ );
		await context.close();
	} );

	test( 'open: both Apply links open the Maker’s Prize form and name themselves', async ( {
		admin,
		page: adminPage,
		browser,
	} ) => {
		await connect( admin, adminPage, SERVER, 'ws_123' );
		try {
			const context = await browser.newContext( VISITOR );
			await context.route( `${ SERVER }/**`, ( route ) =>
				route.fulfill( {
					contentType: 'application/javascript',
					body: STAND_IN,
				} )
			);
			const visitor = await context.newPage();
			await visitor.goto( page.link );
			await expect(
				visitor.getByRole( 'heading', {
					level: 1,
					name: 'Annual Maker Prize Application',
				} )
			).toBeVisible();
			await expect(
				visitor.getByText( 'Applications close in', { exact: true } )
			).toBeVisible();
			await expect( visitor.locator( '.is-days' ) ).toHaveText(
				/^\d+ days left to apply$/
			);

			const apply = visitor.getByRole( 'link', { name: 'Apply now' } );
			await expect( apply ).toHaveCount( 2 );
			const contexts = await apply.evaluateAll( ( links ) =>
				links.map( ( link ) =>
					JSON.parse( link.getAttribute( 'data-wp-context' ) ?? '{}' )
				)
			);
			expect( contexts ).toEqual( [
				{
					action: 'makers-prize',
					fields: { entry_point: 'maker_prize_hero' },
				},
				{
					action: 'makers-prize',
					fields: { entry_point: 'maker_prize_cta' },
				},
			] );
			// No id hook: the board's id="maker-prize-apply" was on both.
			await expect( visitor.locator( '#maker-prize-apply' ) ).toHaveCount(
				0
			);
			await expect(
				visitor.getByRole( 'button', { name: 'Applications closed' } )
			).toHaveCount( 0 );

			await apply.last().click();
			await expect
				.poll( () =>
					visitor.evaluate(
						() => ( window as Recorded ).e2eFormbricks?.tracked
					)
				)
				.toEqual( [ 'makers-prize' ] );
			expect(
				await visitor.evaluate(
					() => ( window as Recorded ).e2eFormbricks?.hidden
				)
			).toEqual( [ { entry_point: 'maker_prize_cta' } ] );
			await context.close();
		} finally {
			// Leave the site as other specs expect it: not connected.
			await connect( admin, adminPage, '', '' );
		}
	} );

	test( 'open, without JavaScript: the days, the open text and the links', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( NO_JS );
		const visitor = await context.newPage();
		await visitor.goto( page.link );
		await expect(
			visitor.getByText( /^TekSeries is accepting applications/ )
		).toBeVisible();
		await expect(
			visitor.getByText( /^Applications are now closed/ )
		).toBeHidden();
		await expect(
			visitor.locator( '.is-tiles [data-part="days"]' )
		).toHaveText( /^(29|30)$/ );
		await expect(
			visitor.locator( '.is-tiles [data-part="seconds"]' )
		).toBeHidden();
		await expect(
			visitor.getByRole( 'link', { name: 'Apply now' } )
		).toHaveCount( 2 );
		await context.close();
	} );

	test( 'on a phone the tiles say Mins and Secs', async ( { browser } ) => {
		const context = await browser.newContext( {
			...VISITOR,
			viewport: { width: 390, height: 844 },
		} );
		const visitor = await context.newPage();
		await visitor.goto( page.link );
		const tiles = visitor.locator( '.is-tiles' );
		await expect( tiles ).toHaveClass( /is-live/ );
		await expect(
			tiles.locator( '.ts-deadline__name > span:visible' )
		).toHaveText( [ 'Days', 'Hours', 'Mins', 'Secs' ] );
		// Nothing runs off the side of the screen.
		expect(
			await visitor.evaluate( () => document.documentElement.scrollWidth )
		).toBeLessThanOrEqual( 390 );
		await context.close();
	} );

	test( 'closed: two disabled buttons, the winners line, no Apply', async ( {
		browser,
		requestUtils,
	} ) => {
		await publish( requestUtils, Date.now() - DAY );
		try {
			const context = await browser.newContext( VISITOR );
			const visitor = await context.newPage();
			await visitor.goto( page.link );
			await expect(
				visitor.getByText( /^Applications are now closed/ )
			).toBeVisible();
			await expect(
				visitor.getByText( 'Applications are closed', { exact: true } )
			).toHaveCount( 2 );
			const closed = visitor.getByRole( 'button', {
				name: 'Applications closed',
			} );
			await expect( closed ).toHaveCount( 2 );
			for ( const button of await closed.all() ) {
				await expect( button ).toBeVisible();
				await expect( button ).toBeDisabled();
			}
			await expect(
				visitor.getByText(
					'Winners are announced beginning the first quarter of the new year.'
				)
			).toBeVisible();
			await expect(
				visitor.getByRole( 'link', { name: 'Apply now' } )
			).toHaveCount( 0 );
			await expect( visitor.locator( '.is-days' ) ).toHaveCount( 0 );
			await expect(
				visitor.locator( '.is-tiles [data-part="days"]' )
			).toHaveText( '00' );
			await context.close();
		} finally {
			await publish( requestUtils, Date.now() + 30 * DAY );
		}
	} );
} );
