import type { BrowserContext, Page } from '@playwright/test';
import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };
type Saved = { meta: { tekseries_deadline: string } };
// The page's clock as the test sets it (see "swaps the blocks at zero").
type Clocked = Window & { e2eClock: { time: number } };
// What the stand-in for Formbricks' script writes down.
type Recorded = Window & {
	e2eFormbricks?: { tracked: string[]; hidden: unknown[] };
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const SERVER = 'https://forms.example.test';
const NO_JS = {
	javaScriptEnabled: false,
	storageState: { cookies: [], origins: [] },
};
const VISITOR = { storageState: { cookies: [], origins: [] } };

// A deadline is written in Nigerian time, which is UTC+1 all year.
const lagos = ( time: number ) =>
	new Date( Math.floor( time / 1000 ) * 1000 + HOUR )
		.toISOString()
		.slice( 0, 19 );
// How many whole days are left now until a moment.
const wholeDays = ( until: number ) =>
	Math.floor( ( until - Date.now() ) / DAY );

// Both countdowns, and blocks that switch at the deadline: two paragraphs,
// an Apply link that opens a Formbricks form, and the disabled button that
// takes its place.
const CONTENT =
	'<!-- wp:tekseries/deadline-countdown /-->' +
	'<!-- wp:tekseries/deadline-countdown {"view":"days"} /-->' +
	'<!-- wp:paragraph {"className":"ts-when-open"} --><p class="ts-when-open">Applications are open.</p><!-- /wp:paragraph -->' +
	'<!-- wp:paragraph {"className":"ts-when-closed"} --><p class="ts-when-closed">Winners are announced soon.</p><!-- /wp:paragraph -->' +
	'<!-- wp:buttons --><div class="wp-block-buttons">' +
	'<!-- wp:button {"className":"ts-survey-makers-prize ts-entry-e2e_deadline ts-when-open"} --><div class="wp-block-button ts-survey-makers-prize ts-entry-e2e_deadline ts-when-open"><a class="wp-block-button__link wp-element-button" href="#">Apply now</a></div><!-- /wp:button -->' +
	'<!-- wp:button {"tagName":"button","className":"ts-icon-lock ts-disabled ts-when-closed"} --><div class="wp-block-button ts-icon-lock ts-disabled ts-when-closed"><button type="button" class="wp-block-button__link wp-element-button">Applications closed</button></div><!-- /wp:button -->' +
	'</div><!-- /wp:buttons -->';

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

// The Deadline Countdown block and the blocks marked ts-when-open and
// ts-when-closed, on a page with a deadline (page meta tekseries_deadline).
test.describe( 'deadline countdown', () => {
	const pages: number[] = [];

	test.afterAll( async ( { requestUtils } ) => {
		for ( const id of pages ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	const publish = async (
		requestUtils: RequestUtils,
		title: string,
		deadline: number
	) => {
		const made = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title,
				status: 'publish',
				content: CONTENT,
				meta: { tekseries_deadline: lagos( deadline ) },
			},
		} );
		pages.push( made.id );
		return made;
	};

	const open = async ( context: BrowserContext, link: string ) => {
		const page = await context.newPage();
		const requested: string[] = [];
		page.on( 'request', ( request ) => requested.push( request.url() ) );
		await page.goto( link );
		return { page, requested };
	};

	const parts = ( page: Page ) => {
		const tiles = page.locator(
			'.wp-block-tekseries-deadline-countdown.is-tiles'
		);
		return {
			tiles,
			figure: ( part: string ) =>
				tiles.locator( `[data-part="${ part }"]` ),
			daysLine: page.locator(
				'.wp-block-tekseries-deadline-countdown.is-days'
			),
			opened: page.getByText( 'Applications are open.' ),
			closedText: page.getByText( 'Winners are announced soon.' ),
			apply: page.getByRole( 'link', { name: 'Apply now' } ),
			closed: page.getByRole( 'button', {
				name: 'Applications closed',
			} ),
		};
	};

	test( 'without JavaScript shows the days, no clock, and the open blocks', async ( {
		browser,
		requestUtils,
	} ) => {
		const deadline = Date.now() + 10 * DAY + 5 * HOUR;
		const made = await publish(
			requestUtils,
			'E2E Deadline No Script',
			deadline
		);
		const context = await browser.newContext( NO_JS );
		const { page } = await open( context, made.link );
		const { tiles, figure, daysLine, opened, closedText, apply, closed } =
			parts( page );

		await expect( figure( 'days' ) ).toHaveText( '10' );
		await expect( figure( 'days' ) ).toBeVisible();
		// The clock keeps its room but shows nothing: it could not tick.
		for ( const part of [ 'hours', 'minutes', 'seconds' ] ) {
			await expect( figure( part ) ).toBeHidden();
		}
		await expect( tiles.locator( '.ts-deadline__tiles' ) ).toHaveAttribute(
			'aria-hidden',
			'true'
		);
		await expect( tiles.locator( '.screen-reader-text' ) ).toHaveText(
			'Applications close in 10 days.'
		);
		await expect( daysLine ).toHaveText( '10 days left to apply' );
		await expect( opened ).toBeVisible();
		await expect( apply ).toBeVisible();
		// The closed blocks are in the page for the script, and hidden.
		await expect( closedText ).toBeHidden();
		await expect( closed ).toBeHidden();
		await context.close();
	} );

	test( 'ticks, and the script says what the server said', async ( {
		browser,
		requestUtils,
	} ) => {
		const deadline = Date.now() + 3 * DAY + 2 * HOUR;
		const made = await publish(
			requestUtils,
			'E2E Deadline Live',
			deadline
		);

		// The server's figures, read without the script.
		const plain = await browser.newContext( NO_JS );
		const served = parts( ( await open( plain, made.link ) ).page );
		const serverDays = await served.figure( 'days' ).textContent();
		const serverLine = await served.daysLine.textContent();
		await plain.close();

		const context = await browser.newContext( VISITOR );
		const { page, requested } = await open( context, made.link );
		const { tiles, figure, daysLine } = parts( page );
		await expect( tiles ).toHaveClass( /is-live/ );
		expect( [ '03', `0${ wholeDays( deadline ) }` ] ).toContain(
			serverDays
		);
		await expect( figure( 'days' ) ).toHaveText( serverDays ?? '' );
		await expect( daysLine ).toHaveText( serverLine ?? '' );
		await expect( daysLine ).toHaveText( '3 days left to apply' );
		for ( const part of [ 'hours', 'minutes', 'seconds' ] ) {
			await expect( figure( part ) ).toBeVisible();
			await expect( figure( part ) ).toHaveText( /^\d\d$/ );
		}
		await expect( figure( 'hours' ) ).toHaveText( /^0[12]$/ );
		const second = await figure( 'seconds' ).textContent();
		await expect( figure( 'seconds' ) ).not.toHaveText( second ?? '' );
		// Screen readers get the hours and minutes too, in words.
		await expect( tiles.locator( '.screen-reader-text' ) ).toHaveText(
			/^Applications close in 3 days, [12] hours? and \d+ minutes?\.$/
		);
		expect(
			requested.filter( ( url ) =>
				url.includes( '/build/deadline-countdown/view.js' )
			)
		).toHaveLength( 1 );
		await context.close();
	} );

	test( 'swaps the blocks at zero on a page made before the deadline', async ( {
		browser,
		requestUtils,
	} ) => {
		const deadline = Date.now() + 2 * DAY;
		const made = await publish(
			requestUtils,
			'E2E Deadline Flip',
			deadline
		);
		const context = await browser.newContext( VISITOR );
		const page = await context.newPage();
		// The visitor's clock says five seconds before the deadline, and runs
		// on from there. Only Date.now() is replaced: Playwright's own clock
		// also replaces `performance`, which WordPress reads as a page loads.
		await page.addInitScript( ( time ) => {
			const real = Date.now.bind( Date );
			const opened = real();
			const clock = { time };
			Date.now = () => clock.time + real() - opened;
			( window as unknown as Clocked ).e2eClock = clock;
		}, deadline - 5_000 );
		await page.goto( made.link );
		const { tiles, figure, daysLine, opened, closedText, apply, closed } =
			parts( page );

		await expect( tiles ).toHaveClass( /is-live/ );
		await expect( figure( 'days' ) ).toHaveText( '00' );
		await expect( daysLine ).toHaveText( 'Last day to apply' );
		await expect( tiles.locator( '.screen-reader-text' ) ).toHaveText(
			'Applications close in 1 minute.'
		);
		await expect( apply ).toBeVisible();
		await expect( closed ).toBeHidden();

		// Zero: the closed blocks show, the open ones go.
		await page.evaluate( ( to ) => {
			( window as unknown as Clocked ).e2eClock.time = to;
		}, deadline );
		await expect( tiles ).toHaveClass( /is-closed/ );
		for ( const part of [ 'days', 'hours', 'minutes', 'seconds' ] ) {
			await expect( figure( part ) ).toHaveText( '00' );
		}
		await expect( tiles.locator( '.screen-reader-text' ) ).toHaveText(
			'Applications are closed.'
		);
		await expect( daysLine ).toBeHidden();
		await expect( opened ).toBeHidden();
		await expect( apply ).toBeHidden();
		await expect( closedText ).toBeVisible();
		await expect( closed ).toBeVisible();
		await expect( closed ).toBeDisabled();
		await context.close();
	} );

	test( 'after the deadline prints the closed page and loads no script', async ( {
		browser,
		requestUtils,
	} ) => {
		const made = await publish(
			requestUtils,
			'E2E Deadline Closed',
			Date.now() - HOUR
		);
		const context = await browser.newContext( VISITOR );
		const { page, requested } = await open( context, made.link );
		const { tiles, figure, daysLine, opened, closedText, apply, closed } =
			parts( page );
		await page.waitForLoadState( 'load' );

		await expect( tiles ).toHaveClass( /is-closed/ );
		for ( const part of [ 'days', 'hours', 'minutes', 'seconds' ] ) {
			await expect( figure( part ) ).toHaveText( '00' );
			await expect( figure( part ) ).toBeVisible();
		}
		await expect( tiles.locator( '.screen-reader-text' ) ).toHaveText(
			'Applications are closed.'
		);
		await expect( daysLine ).toHaveCount( 0 );
		await expect( opened ).toHaveCount( 0 );
		await expect( apply ).toHaveCount( 0 );
		await expect( closedText ).toBeVisible();
		// A real, disabled <button>, with the lock icon.
		await expect( closed ).toBeVisible();
		await expect( closed ).toBeDisabled();
		await expect(
			page.locator( '.wp-block-button.ts-icon-lock button[disabled]' )
		).toHaveCount( 1 );
		await expect(
			page.locator(
				'[data-wp-interactive="tekseries/deadline-countdown"]'
			)
		).toHaveCount( 0 );
		expect(
			requested.filter(
				( url ) =>
					url.includes( 'deadline-countdown/view' ) ||
					url.includes( 'surveys/view' )
			)
		).toEqual( [] );
		await context.close();
	} );

	test( 'a page without a deadline is open and shows no countdown', async ( {
		browser,
		requestUtils,
	} ) => {
		const made = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Deadline None',
				status: 'publish',
				content: CONTENT,
			},
		} );
		pages.push( made.id );
		const context = await browser.newContext( VISITOR );
		const { page, requested } = await open( context, made.link );
		const { opened, closedText, apply, closed } = parts( page );
		await page.waitForLoadState( 'load' );

		await expect(
			page.locator( '.wp-block-tekseries-deadline-countdown' )
		).toHaveCount( 0 );
		await expect( opened ).toBeVisible();
		await expect( apply ).toBeVisible();
		await expect( closedText ).toHaveCount( 0 );
		await expect( closed ).toHaveCount( 0 );
		expect(
			requested.filter( ( url ) =>
				url.includes( 'deadline-countdown/view' )
			)
		).toEqual( [] );
		await context.close();
	} );

	test( 'an open Apply link still opens its Formbricks form', async ( {
		admin,
		page: adminPage,
		browser,
		requestUtils,
	} ) => {
		const made = await publish(
			requestUtils,
			'E2E Deadline Survey',
			Date.now() + 5 * DAY
		);
		const settings = async ( url: string, id: string ) => {
			await admin.visitAdminPage(
				'options-general.php',
				'page=tekseries-forms'
			);
			await adminPage.getByLabel( 'SDK connection URL' ).fill( url );
			await adminPage.getByLabel( 'ID', { exact: true } ).fill( id );
			await adminPage
				.getByRole( 'button', { name: 'Save Changes' } )
				.click();
			await expect(
				adminPage.locator( '#setting-error-settings_updated' )
			).toBeVisible();
		};
		await settings( SERVER, 'ws_123' );

		try {
			const context = await browser.newContext( VISITOR );
			await context.route( `${ SERVER }/**`, ( route ) =>
				route.fulfill( {
					contentType: 'application/javascript',
					body: STAND_IN,
				} )
			);
			const { page } = await open( context, made.link );
			await parts( page ).apply.click();
			await expect
				.poll( () =>
					page.evaluate(
						() => ( window as Recorded ).e2eFormbricks?.tracked
					)
				)
				.toEqual( [ 'makers-prize' ] );
			expect(
				await page.evaluate(
					() => ( window as Recorded ).e2eFormbricks?.hidden
				)
			).toEqual( [ { entry_point: 'e2e_deadline' } ] );
			await expect( page ).toHaveURL( made.link );
			await context.close();
		} finally {
			// Leave the site as other specs expect it: not connected.
			await settings( '', '' );
		}
	} );

	test( 'the editor sets the page’s deadline', async ( {
		admin,
		editor,
		page,
		requestUtils,
	} ) => {
		await admin.createNewPost( {
			postType: 'page',
			title: 'E2E Deadline Editor',
		} );
		await editor.insertBlock( { name: 'tekseries/deadline-countdown' } );
		const block = editor.canvas.locator(
			'[data-type="tekseries/deadline-countdown"]'
		);
		await expect( block ).toContainText( 'Set the deadline' );

		await editor.openDocumentSettingsSidebar();
		const panel = page.getByRole( 'region', { name: 'Editor settings' } );
		await panel.getByRole( 'spinbutton', { name: 'Day' } ).fill( '1' );
		await panel
			.getByRole( 'combobox', { name: 'Month' } )
			.selectOption( '12' );
		await panel.getByRole( 'spinbutton', { name: 'Year' } ).fill( '2099' );
		await panel.getByRole( 'spinbutton', { name: 'Hours' } ).fill( '11' );
		await panel.getByRole( 'spinbutton', { name: 'Minutes' } ).fill( '59' );
		await panel.getByRole( 'radio', { name: 'PM' } ).click();
		await expect( block.locator( '.ts-deadline__tile' ) ).toHaveCount( 4 );

		await panel
			.getByRole( 'combobox', { name: 'Show' } )
			.selectOption( 'days' );
		await expect( block ).toHaveText( /^\d+ days left to apply$/ );

		await editor.publishPost();
		const id = await page.evaluate( () =>
			(
				window as unknown as {
					wp: {
						data: {
							select: ( store: string ) => {
								getCurrentPostId: () => number;
							};
						};
					};
				}
			 ).wp.data
				.select( 'core/editor' )
				.getCurrentPostId()
		);
		pages.push( id );
		const saved = await requestUtils.rest< Saved >( {
			path: `/wp/v2/pages/${ id }`,
			params: { context: 'edit' },
		} );
		// The picker has no seconds: 11:59 PM is saved as 23:59:00.
		expect( saved.meta.tekseries_deadline ).toBe( '2099-12-01T23:59:00' );
		expect( await editor.getBlocks() ).toMatchObject( [
			{
				name: 'tekseries/deadline-countdown',
				attributes: { view: 'days' },
			},
		] );
	} );
} );
