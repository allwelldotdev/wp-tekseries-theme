import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { invalidBlocks } from './utils/blocks';

type Linked = { id: number; link: string };

const BUTTON =
	'<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button -->' +
	'<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#">E2E Icon Button</a></div>' +
	'<!-- /wp:button --></div><!-- /wp:buttons -->';

// The Button block's "Icon" panel only sets classes on the button; the theme
// draws the icon in CSS, so nothing of ours loads for visitors.
test.describe( 'Button icons', () => {
	let post: Linked;

	test.beforeAll( async ( { requestUtils } ) => {
		post = await requestUtils.rest< Linked >( {
			method: 'POST',
			path: '/wp/v2/pages',
			data: {
				title: 'E2E Button Icons',
				status: 'publish',
				content: BUTTON,
			},
		} );
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( {
			method: 'DELETE',
			path: `/wp/v2/pages/${ post.id }`,
			params: { force: true },
		} );
	} );

	test( 'an editor picks an icon and where it goes, and visitors see it', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.editPost( post.id );
		await editor.canvas
			.getByRole( 'document', { name: 'Block: Button', exact: true } )
			.click();
		await editor.openDocumentSettingsSidebar();
		const settings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		const icon = settings.getByRole( 'combobox', { name: 'Icon' } );
		const after = settings.getByRole( 'checkbox', {
			name: 'Icon after the text',
		} );
		const className = async () =>
			( await editor.getBlocks() )[ 0 ]?.innerBlocks[ 0 ]?.attributes
				.className;

		// No icon yet: there is nothing to put after the text.
		await expect( icon ).toHaveValue( '' );
		await expect( after ).toBeDisabled();

		await icon.selectOption( { label: 'Arrow forward' } );
		expect( await className() ).toBe( 'ts-icon-arrow_forward' );
		await after.check();
		expect( await className() ).toBe(
			'ts-icon-arrow_forward ts-icon-after'
		);

		// Another icon takes the first one's place and keeps the position.
		await icon.selectOption( { label: 'Send' } );
		expect( await className() ).toBe( 'ts-icon-after ts-icon-send' );

		await page
			.getByRole( 'region', { name: 'Editor top bar' } )
			.getByRole( 'button', { name: 'Save', exact: true } )
			.click();
		await expect(
			page
				.getByRole( 'button', { name: 'Dismiss this notice' } )
				.filter( { hasText: /updated/i } )
		).toBeVisible();

		// The saved button is an ordinary, valid Button block.
		await page.reload();
		await expect(
			editor.canvas.getByRole( 'document', {
				name: 'Block: Button',
				exact: true,
			} )
		).toBeVisible();
		expect( await invalidBlocks( page ) ).toEqual( [] );

		// Visitors: the icon is drawn after the text, 20px, by the stylesheet.
		await page.goto( post.link );
		const link = page.locator(
			'.wp-block-button.ts-icon-send.ts-icon-after .wp-block-button__link'
		);
		await expect( link ).toHaveText( 'E2E Icon Button' );
		expect(
			await link.evaluate( ( el ) => {
				const drawn = getComputedStyle( el, '::after' );
				return [
					drawn.width,
					drawn.height,
					drawn.maskImage.startsWith( 'url(' ),
					getComputedStyle( el, '::before' ).content,
				];
			} )
		).toEqual( [ '20px', '20px', true, 'none' ] );
	} );

	test( 'taking the icon away leaves a plain button', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.editPost( post.id );
		await editor.canvas
			.getByRole( 'document', { name: 'Block: Button', exact: true } )
			.click();
		await editor.openDocumentSettingsSidebar();
		const settings = page.getByRole( 'region', {
			name: 'Editor settings',
		} );
		await settings
			.getByRole( 'combobox', { name: 'Icon' } )
			.selectOption( { label: 'None' } );
		expect(
			( await editor.getBlocks() )[ 0 ]?.innerBlocks[ 0 ]?.attributes
				.className
		).toBeUndefined();
		await expect(
			settings.getByRole( 'checkbox', { name: 'Icon after the text' } )
		).toBeDisabled();
	} );
} );
