import { describe, expect, it } from 'vitest';

import {
	CLOSED_BUTTON_CLASSES,
	closedButtonAttributes,
	isClosedButton,
	whenOf,
	withWhen,
} from '../../wp-content/plugins/tekseries-blocks/src/deadline-tools/tokens';

// The blocks' Deadline panel keeps its settings in the class list, which
// the server reads (includes/deadline.php).
describe( 'deadline panel classes', () => {
	it( 'reads when a block shows', () => {
		expect( whenOf( undefined ) ).toBe( '' );
		expect( whenOf( 'is-style-accent' ) ).toBe( '' );
		expect( whenOf( 'is-style-accent ts-when-open' ) ).toBe( 'open' );
		expect( whenOf( 'ts-when-closed has-text' ) ).toBe( 'closed' );
	} );

	it( 'sets when a block shows and keeps its other classes', () => {
		expect( withWhen( 'is-style-accent', 'open' ) ).toBe(
			'is-style-accent ts-when-open'
		);
		expect( withWhen( 'is-style-accent ts-when-open', 'closed' ) ).toBe(
			'is-style-accent ts-when-closed'
		);
		expect( withWhen( 'ts-when-closed', '' ) ).toBeUndefined();
		expect( withWhen( undefined, 'closed' ) ).toBe( 'ts-when-closed' );
	} );

	it( 'knows a closed button', () => {
		expect(
			isClosedButton( {
				tagName: 'button',
				className: CLOSED_BUTTON_CLASSES,
			} )
		).toBe( true );
		expect( isClosedButton( { className: 'ts-disabled' } ) ).toBe( false );
		expect( isClosedButton( { tagName: 'button' } ) ).toBe( false );
	} );

	it( 'makes a link a closed button with the lock and no link', () => {
		expect(
			closedButtonAttributes(
				{
					className: 'is-style-accent ts-when-closed',
					url: 'https://example.com',
					linkTarget: '_blank',
					rel: 'noopener',
				},
				true
			)
		).toEqual( {
			tagName: 'button',
			className:
				'ts-icon-lock is-style-accent ts-when-closed ts-disabled',
			url: undefined,
			linkTarget: undefined,
			rel: undefined,
		} );
	} );

	it( 'keeps an icon the button has', () => {
		expect(
			closedButtonAttributes(
				{ className: 'ts-icon-arrow_forward ts-icon-after' },
				true
			).className
		).toBe( 'ts-icon-arrow_forward ts-icon-after ts-disabled' );
	} );

	it( 'makes a closed button a link again', () => {
		expect(
			closedButtonAttributes(
				{
					tagName: 'button',
					className: 'ts-icon-lock ts-disabled ts-when-closed',
				},
				false
			)
		).toEqual( {
			tagName: undefined,
			className: 'ts-icon-lock ts-when-closed',
		} );
	} );
} );
