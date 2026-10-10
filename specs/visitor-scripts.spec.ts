import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { setUpJobPages } from './utils/wpjm';

type Linked = { id: number; link: string };

// Each kind of public page, and the plugin scripts its blocks should bring.
const PAGES: [ name: string, scripts: string[] ][] = [
	[ 'front page', [] ],
	[ 'Home page pattern', [] ],
	[ 'events archive', [] ],
	[ 'event', [] ],
	[ 'news post', [] ],
	[ 'gallery', [ 'media-gallery/view.js' ] ],
	[ 'legal page', [ 'toc/view.js' ] ],
	[ 'job listings', [ 'job-listings/view.js' ] ],
	[ 'job', [] ],
	[ 'job dashboard', [] ],
	[ 'search results', [] ],
	[ 'not found', [] ],
];

// What a visitor's browser is asked to load. React stays in the editor, jQuery
// is only for the job submission form (WP Job Manager needs it there), and a
// block's own script comes only with its block.
test.describe( 'scripts sent to visitors', () => {
	const made: [ path: string, id: number ][] = [];
	const urls = new Map< string, string >();

	test.beforeAll( async ( { requestUtils, browser } ) => {
		const publish = async (
			name: string,
			path: string,
			data: Record< string, unknown >
		) => {
			const item = await requestUtils.rest< Linked >( {
				method: 'POST',
				path,
				data: { status: 'publish', ...data },
			} );
			made.push( [ path, item.id ] );
			urls.set( name, item.link );
		};
		const pattern = ( slug: string ) =>
			`<!-- wp:pattern {"slug":"tekseries/${ slug }"} /-->`;

		await publish( 'Home page pattern', '/wp/v2/pages', {
			title: 'E2E Scripts Home',
			content: pattern( 'page-home' ),
		} );
		await publish( 'gallery', '/wp/v2/pages', {
			title: 'E2E Scripts Gallery',
			content: pattern( 'page-gallery' ),
		} );
		await publish( 'legal page', '/wp/v2/pages', {
			title: 'E2E Scripts Legal',
			template: 'page-legal',
			content:
				'<!-- wp:heading {"anchor":"purpose"} --><h2 class="wp-block-heading" id="purpose">Purpose</h2><!-- /wp:heading -->',
		} );
		await publish( 'event', '/wp/v2/event', {
			title: 'E2E Scripts Event',
		} );
		await publish( 'news post', '/wp/v2/posts', {
			title: 'E2E Scripts Post',
			content: 'A post.',
		} );
		await publish( 'job', '/wp/v2/job-listings', {
			title: 'E2E Scripts Job',
		} );

		// Contexts opened here are logged in as the admin.
		const admin = await browser.newPage();
		const jobs = await setUpJobPages( requestUtils, admin );
		await admin.close();
		urls.set( 'job listings', jobs.jobs.link );
		urls.set( 'job dashboard', jobs.dashboard.link );
		urls.set( 'job submission', jobs.submit.link );

		urls.set( 'front page', '/' );
		urls.set( 'events archive', '/?post_type=event' );
		urls.set( 'search results', '/?s=E2E+Scripts' );
		urls.set( 'not found', '/?p=999999999' );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const [ path, id ] of made ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `${ path }/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'no public page loads React or jQuery, and block scripts come only with their block', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		let requested: string[] = [];
		page.on( 'request', ( request ) => requested.push( request.url() ) );
		const visit = async ( name: string ) => {
			requested = [];
			const response = await page.goto( urls.get( name ) ?? '' );
			await page.waitForLoadState( 'load' );
			return {
				page: name,
				status: response?.status(),
				unwanted: requested.filter( ( url ) =>
					/react|jquery/i.test( url )
				),
				ours: requested
					.filter( ( url ) =>
						/\/tekseries-blocks\/build\/.*\.js/.test( url )
					)
					.map( ( url ) => url.replace( /^.*\/build\/|\?.*$/g, '' ) ),
			};
		};

		for ( const [ name, scripts ] of PAGES ) {
			expect( await visit( name ) ).toEqual( {
				page: name,
				status: name === 'not found' ? 404 : 200,
				unwanted: [],
				ours: scripts,
			} );
		}

		// The one exception: WP Job Manager's form brings jQuery, never React.
		const form = await visit( 'job submission' );
		expect( form.status ).toBe( 200 );
		expect(
			form.unwanted.filter( ( url ) => /react/i.test( url ) )
		).toEqual( [] );
		await context.close();
	} );
} );
