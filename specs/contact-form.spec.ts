import { test, expect } from '@wordpress/e2e-test-utils-playwright';

type Linked = { id: number; link: string };

// The test site has no Fluent Forms, so its block is unregistered there and
// WordPress prints what the comment wraps. These forms stand in for the
// plugin's markup: a "topic" choice and a "subject" text field.
const radio = ( value: string, checked = false ) =>
	`<label><input type="radio" name="topic" value="${ value }"${
		checked ? ' checked="1"' : ''
	}> ${ value }</label>`;
const form = ( fields: string ) =>
	`<!-- wp:fluentfom/guten-block {"formId":"1"} --><form class="frm-fluent-form" method="POST">${ fields }<input type="text" name="subject" placeholder="The form's own hint"><button type="reset">Reset</button></form><!-- /wp:fluentfom/guten-block -->`;

const HINTS = {
	general: 'How can we help?',
	workshop: 'e.g. Joining the next Eziama boot camp',
	jobs: 'e.g. Posting an internship',
	support: 'e.g. Sponsoring a workshop',
};

// The contact form's Subject hint follows the topic. The server sets it for
// the topic the form starts on; a small script follows the visitor's choice.
test.describe( 'Contact form subject hint', () => {
	let withTopics: Linked;
	let withoutTopics: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		const page = ( title: string, content: string ) =>
			requestUtils.rest< Linked >( {
				method: 'POST',
				path: '/wp/v2/pages',
				data: { title, status: 'publish', content },
			} );
		withTopics = await page(
			'E2E Contact Form',
			form(
				[
					radio( 'general' ),
					radio( 'workshop', true ),
					radio( 'jobs' ),
					radio( 'support' ),
					// A topic the plugin has no hint for.
					radio( 'press' ),
				].join( '' )
			)
		);
		withoutTopics = await page( 'E2E Contact Form Plain', form( '' ) );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		for ( const { id } of [ withTopics, withoutTopics ] ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/pages/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'the server sets the hint of the topic the form starts on', async ( {
		browser,
	} ) => {
		const context = await browser.newContext( {
			javaScriptEnabled: false,
			storageState: { cookies: [], origins: [] },
		} );
		const page = await context.newPage();
		await page.goto( withTopics.link );
		await expect( page.locator( 'input[name="subject"]' ) ).toHaveAttribute(
			'placeholder',
			HINTS.workshop
		);
		await context.close();
	} );

	test( 'the hint follows the topic and a reset puts it back', async ( {
		page,
	} ) => {
		const errors: string[] = [];
		page.on( 'pageerror', ( error ) => errors.push( String( error ) ) );
		await page.goto( withTopics.link );
		const subject = page.locator( 'input[name="subject"]' );
		const pick = ( value: string ) =>
			page.locator( `input[name="topic"][value="${ value }"]` ).check();

		await expect( subject ).toHaveAttribute(
			'placeholder',
			HINTS.workshop
		);
		for ( const [ value, hint ] of Object.entries( HINTS ) ) {
			await pick( value );
			await expect( subject ).toHaveAttribute( 'placeholder', hint );
		}
		// No hint for this one: the form's own placeholder shows.
		await pick( 'press' );
		await expect( subject ).toHaveAttribute(
			'placeholder',
			"The form's own hint"
		);

		// What the visitor typed is never touched.
		await subject.fill( 'A question' );
		await pick( 'jobs' );
		await expect( subject ).toHaveValue( 'A question' );
		await expect( subject ).toHaveAttribute( 'placeholder', HINTS.jobs );

		await page.getByRole( 'button', { name: 'Reset' } ).click();
		await expect(
			page.locator( 'input[name="topic"][value="workshop"]' )
		).toBeChecked();
		await expect( subject ).toHaveAttribute(
			'placeholder',
			HINTS.workshop
		);
		expect( errors ).toEqual( [] );
	} );

	test( 'a form without a topic choice is left alone', async ( { page } ) => {
		const ours: string[] = [];
		page.on( 'request', ( request ) => {
			if ( /build\/contact-form\/view\.js/.test( request.url() ) ) {
				ours.push( request.url() );
			}
		} );
		await page.goto( withoutTopics.link );
		const plain = page.locator( 'form.frm-fluent-form' );
		await expect( plain ).toBeVisible();
		await expect( plain ).not.toHaveAttribute( 'data-wp-interactive' );
		await expect(
			plain.locator( 'input[name="subject"]' )
		).toHaveAttribute( 'placeholder', "The form's own hint" );
		expect( ours ).toEqual( [] );
	} );
} );
