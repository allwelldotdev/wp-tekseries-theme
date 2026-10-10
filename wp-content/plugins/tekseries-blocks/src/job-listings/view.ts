import { getElement, store, withSyncEvent } from '@wordpress/interactivity';

// How long typing must pause before the list follows it, in milliseconds.
const TYPING_PAUSE = 400;

let typing: number | undefined;

const isPlainClick = ( event: MouseEvent ) =>
	event.button === 0 &&
	! event.metaKey &&
	! event.ctrlKey &&
	! event.shiftKey &&
	! event.altKey;

// Fetches the address's page and swaps the results in, where the browser
// would have loaded the whole page (the router still does if the fetch
// fails). True once the results on show are that address's.
const go = async ( href: string, replace = false ) => {
	if ( href === window.location.href ) {
		return false;
	}
	const { actions } = await import( '@wordpress/interactivity-router' );
	// The count of jobs is a status element, so it is read out by itself.
	await actions.navigate( href, {
		replace,
		screenReaderAnnouncement: false,
	} );
	return href === window.location.href;
};

const checkboxes = ( form: HTMLFormElement ) =>
	[ ...form.elements ].filter(
		( field ): field is HTMLInputElement =>
			field instanceof HTMLInputElement && field.type === 'checkbox'
	);

// The address the form would submit to, without what narrows nothing: empty
// fields, and a group of checkboxes with every box ticked.
const searchUrl = ( form: HTMLFormElement ) => {
	const url = new URL( form.action );
	for ( const [ name, value ] of new FormData( form ) ) {
		if ( typeof value === 'string' && value !== '' ) {
			url.searchParams.append( name, value );
		}
	}
	const groups = checkboxes( form ).filter( ( { name } ) =>
		name.endsWith( '[]' )
	);
	for ( const name of new Set( groups.map( ( box ) => box.name ) ) ) {
		const group = groups.filter( ( box ) => box.name === name );
		if ( group.every( ( box ) => box.checked ) ) {
			url.searchParams.delete( name );
		}
	}
	return url.href;
};

// Sets the form to the address, as the server would have drawn it: a group
// of checkboxes with none chosen means all of it. Typed text is left alone
// unless asked for, so a search that lands never undoes what was typed since.
const fill = ( form: HTMLFormElement, texts: boolean ) => {
	const params = new URL( window.location.href ).searchParams;
	for ( const box of checkboxes( form ) ) {
		const chosen = params.getAll( box.name );
		box.checked =
			box.name.endsWith( '[]' ) && ! chosen.length
				? true
				: chosen.includes( box.value );
	}
	for ( const field of form.elements ) {
		const isText =
			field instanceof HTMLInputElement && field.type !== 'checkbox';
		if ( field instanceof HTMLSelectElement || ( texts && isText ) ) {
			field.value = params.get( field.name ) ?? '';
		}
	}
};

// Runs the form's search in place.
const search = async ( form: HTMLFormElement, replace = false ) => {
	if ( await go( searchUrl( form ), replace ) ) {
		fill( form, false );
	}
};

store( 'tekseries/job-listings', {
	actions: {
		// The Search button, and Enter in a field.
		submit: withSyncEvent( ( event: SubmitEvent ) => {
			const form = getElement().ref as HTMLFormElement | null;
			if ( form ) {
				event.preventDefault();
				window.clearTimeout( typing );
				search( form );
			}
		} ),
		// Keywords and Location: the list follows once the typing pauses, on
		// the same history entry, so Back is not one step per word.
		type( event: InputEvent ) {
			const form = getElement().ref as HTMLFormElement | null;
			const field = event.target;
			if (
				! form ||
				! ( field instanceof HTMLInputElement ) ||
				field.type !== 'search' ||
				event.isComposing
			) {
				return;
			}
			window.clearTimeout( typing );
			typing = window.setTimeout(
				() => search( form, true ),
				TYPING_PAUSE
			);
		},
		// A type chip, the remote switch or the category. (A text field
		// reports a change too, when it is left; typing has dealt with it.)
		change( event: Event ) {
			const form = getElement().ref as HTMLFormElement | null;
			const field = event.target;
			const isText =
				field instanceof HTMLInputElement && field.type === 'search';
			if ( form && ! isText ) {
				window.clearTimeout( typing );
				search( form );
			}
		},
		// A page link: the next jobs replace the list, and focus and the
		// view go to the top of them.
		page: withSyncEvent( function* ( event: MouseEvent ) {
			const results =
				getElement().ref?.closest< HTMLElement >( '.ts-job-results' );
			const link =
				event.target instanceof Element
					? event.target.closest< HTMLAnchorElement >( 'a[href]' )
					: null;
			if ( ! results || ! link || ! isPlainClick( event ) ) {
				return;
			}
			event.preventDefault();
			if ( ( yield go( link.href ) ) as boolean ) {
				results.focus( { preventScroll: true } );
				results.scrollIntoView();
			}
		} ),
		// "Clear filters" under an empty list: back to every job, with the
		// form emptied to match and focus on its first field (the link goes).
		clear: withSyncEvent( function* ( event: MouseEvent ) {
			const link = getElement().ref as HTMLAnchorElement | null;
			const form = link
				?.closest( '.wp-block-tekseries-job-listings' )
				?.querySelector( 'form' );
			if ( ! link || ! form || ! isPlainClick( event ) ) {
				return;
			}
			event.preventDefault();
			if ( ( yield go( link.href ) ) as boolean ) {
				fill( form, true );
				form.querySelector( 'input' )?.focus();
			}
		} ),
		// Back and Forward: the router brings the results back, and the form
		// follows the address.
		restore() {
			const form = getElement().ref as HTMLFormElement | null;
			if ( form ) {
				fill( form, true );
			}
		},
	},
} );
