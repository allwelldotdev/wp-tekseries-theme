// The deadline settings live in a block's class list, as the Button icon
// does (src/button-icon): a saved block stays valid with or without this
// plugin, and the server reads the classes (includes/deadline.php).

/** When visitors see a block: always, before the deadline or after it. */
export type When = '' | 'open' | 'closed';

const OPEN = 'ts-when-open';
const CLOSED = 'ts-when-closed';
const DISABLED = 'ts-disabled';
const LOCK = 'ts-icon-lock';

const split = ( className?: string ) =>
	( className ?? '' ).split( /\s+/ ).filter( Boolean );
const join = ( tokens: string[] ) => tokens.join( ' ' ) || undefined;

/**
 * Says when visitors see a block, from its classes.
 *
 * @param className The block's classes.
 * @return '' for always, 'open' before the deadline, 'closed' after it.
 */
export const whenOf = ( className?: string ): When => {
	const tokens = split( className );
	if ( tokens.includes( OPEN ) ) {
		return 'open';
	}
	return tokens.includes( CLOSED ) ? 'closed' : '';
};

/**
 * Sets when visitors see a block, keeping its other classes.
 *
 * @param className The block's classes.
 * @param when      '' for always, 'open' or 'closed'.
 * @return The new classes, or undefined for none.
 */
export const withWhen = ( className: string | undefined, when: When ) =>
	join( [
		...split( className ).filter(
			( token ) => token !== OPEN && token !== CLOSED
		),
		...( when ? [ when === 'open' ? OPEN : CLOSED ] : [] ),
	] );

type ButtonAttributes = {
	tagName?: string;
	className?: string;
	url?: string;
	linkTarget?: string;
	rel?: string;
};

/**
 * Whether a Button is a disabled "Applications closed" button: a <button>
 * with the class ts-disabled.
 *
 * @param attributes The Button's attributes.
 * @return True for a closed button.
 */
export const isClosedButton = ( attributes: ButtonAttributes ) =>
	attributes.tagName === 'button' &&
	split( attributes.className ).includes( DISABLED );

/**
 * The attributes that make a Button a disabled "Applications closed"
 * button, or a link again.
 *
 * On, it becomes a <button> with ts-disabled and no link, and gets the lock
 * icon unless it has an icon already. Off, it becomes a link again, without
 * a URL: the editor adds one from the toolbar.
 *
 * @param attributes The Button's attributes.
 * @param on         True to make it a closed button.
 * @return The attributes to set.
 */
export const closedButtonAttributes = (
	attributes: ButtonAttributes,
	on: boolean
): ButtonAttributes => {
	const tokens = split( attributes.className ).filter(
		( token ) => token !== DISABLED
	);
	if ( ! on ) {
		return { tagName: undefined, className: join( tokens ) };
	}
	const hasIcon = tokens.some(
		( token ) =>
			token.startsWith( 'ts-icon-' ) &&
			token !== 'ts-icon-after' &&
			token !== 'ts-icon-small'
	);
	return {
		tagName: 'button',
		className: join( [
			...( hasIcon ? [] : [ LOCK ] ),
			...tokens,
			DISABLED,
		] ),
		url: undefined,
		linkTarget: undefined,
		rel: undefined,
	};
};

/**
 * The classes of the "Applications closed" button that takes an Apply
 * button's place after the deadline, as on the Maker Prize page.
 */
export const CLOSED_BUTTON_CLASSES = `${ LOCK } ${ DISABLED } ${ CLOSED }`;
