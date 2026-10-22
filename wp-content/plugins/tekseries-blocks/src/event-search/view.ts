import { getElement, store, withSyncEvent } from '@wordpress/interactivity';

// How long typing must pause before the list follows it, in milliseconds.
const TYPING_PAUSE = 400;

let typing: number | undefined;

// Core numbers each block style variation on a page (is-style-card--14) and
// prints their rules in one style element, which the router turns off for
// the new page's. What it doesn't swap, the footer, keeps the first page's
// numbers, so the first page's rules stay on too. A variation's rules are the
// same whatever its number, so the two sets never disagree.
const firstVariations = document.getElementById(
	'block-style-variation-styles-inline-css'
) as HTMLStyleElement | null;

const keepVariations = () => {
	if ( firstVariations?.sheet ) {
		firstVariations.sheet.disabled = false;
	}
};

const isPlainClick = ( event: MouseEvent ) =>
	event.button === 0 &&
	! event.metaKey &&
	! event.ctrlKey &&
	! event.shiftKey &&
	! event.altKey;

// Fetches the address's page and swaps the results in (the router regions
// of includes/event-search.php), where the browser would have loaded the
// whole page. True once the results on show are that address's.
const go = async ( href: string, replace = false ) => {
	if ( href === window.location.href ) {
		return false;
	}
	const { actions } = await import( '@wordpress/interactivity-router' );
	// The count of matches is a status element, so it is read out by itself.
	await actions.navigate( href, {
		replace,
		screenReaderAnnouncement: false,
	} );
	keepVariations();
	return href === window.location.href;
};

const theForm = () =>
	document.querySelector< HTMLFormElement >( '.ts-event-search__form' );

const fieldOf = ( form: HTMLFormElement ) =>
	form.querySelector< HTMLInputElement >( 'input[type="search"]' );

// The list a page shows, whichever of its pages: /event_type/webinar/page/2/
// is /event_type/webinar/.
const listPath = ( url: URL ) =>
	url.pathname.replace( /\/page\/\d+\/?$/, '/' ).replace( /\/?$/, '/' );

// The address the form would submit to, without an empty search.
const searchUrl = ( form: HTMLFormElement ) => {
	const url = new URL( form.action );
	for ( const [ name, value ] of new FormData( form ) ) {
		if ( typeof value === 'string' && value.trim() !== '' ) {
			url.searchParams.set( name, value.trim() );
		}
	}
	return url.href;
};

// The clear button shows while there is something to clear.
const showClear = ( form: HTMLFormElement ) => {
	const clear = form.querySelector< HTMLElement >(
		'.ts-event-search__clear'
	);
	if ( clear ) {
		clear.hidden = ! fieldOf( form )?.value;
	}
};

// Brings what stays on the page into step with the address: the field (only
// when asked, so a search that lands never undoes what was typed since), its
// clear button, and the type chips and order switch, which keep the search.
const sync = ( texts: boolean ) => {
	const form = theForm();
	const search =
		new URL( window.location.href ).searchParams.get( 'q' ) ?? '';
	const field = form && fieldOf( form );
	if ( texts && field ) {
		field.value = search;
	}
	if ( form ) {
		showClear( form );
	}
	for ( const link of document.querySelectorAll< HTMLAnchorElement >(
		'.ts-type-chip a[href], .ts-sort a[href]'
	) ) {
		const url = new URL( link.href );
		if ( search ) {
			url.searchParams.set( 'q', search );
		} else {
			url.searchParams.delete( 'q' );
		}
		link.href = url.href;
	}
};

// Runs the form's search in place.
const search = async ( form: HTMLFormElement, replace = false ) => {
	if ( await go( searchUrl( form ), replace ) ) {
		sync( false );
	}
};

store( 'tekseries/event-search', {
	actions: {
		// Enter in the field.
		submit: withSyncEvent( ( event: SubmitEvent ) => {
			const form = getElement().ref as HTMLFormElement | null;
			if ( form ) {
				event.preventDefault();
				window.clearTimeout( typing );
				search( form );
			}
		} ),
		// The list follows once the typing pauses, on the same history
		// entry, so Back is not one step per letter.
		type( event: InputEvent ) {
			const form = getElement().ref as HTMLFormElement | null;
			if ( ! form || event.isComposing ) {
				return;
			}
			showClear( form );
			window.clearTimeout( typing );
			typing = window.setTimeout(
				() => search( form, true ),
				TYPING_PAUSE
			);
		},
		// The cross in the field: every event again, and the field ready
		// for the next search (the cross goes).
		clear: withSyncEvent( function* ( event: MouseEvent ) {
			const link = getElement().ref as HTMLAnchorElement | null;
			const form = theForm();
			const field = form && fieldOf( form );
			if ( ! link || ! form || ! field || ! isPlainClick( event ) ) {
				return;
			}
			event.preventDefault();
			window.clearTimeout( typing );
			field.value = '';
			showClear( form );
			field.focus();
			if ( ( yield go( link.href ) ) as boolean ) {
				sync( true );
			}
		} ),
		// A link in the results to this same list: a page link, Clear
		// search, or a suggested word. A link elsewhere (another event,
		// "Search all event types") loads as usual.
		follow: withSyncEvent( function* ( event: MouseEvent ) {
			const region = getElement().ref as HTMLElement | null;
			const link =
				event.target instanceof Element
					? event.target.closest< HTMLAnchorElement >( 'a[href]' )
					: null;
			if ( ! region || ! link || ! isPlainClick( event ) ) {
				return;
			}
			const to = new URL( link.href );
			const here = new URL( window.location.href );
			if (
				to.origin !== here.origin ||
				listPath( to ) !== listPath( here )
			) {
				return;
			}
			event.preventDefault();
			window.clearTimeout( typing );
			const isPage = !! link.closest( '.wp-block-query-pagination' );
			if ( ( yield go( link.href ) ) as boolean ) {
				sync( true );
				const form = theForm();
				if ( isPage ) {
					region.focus( { preventScroll: true } );
					region.scrollIntoView();
				} else if ( form ) {
					fieldOf( form )?.focus();
				}
			}
		} ),
		// Back and Forward: the router brings the results back, and the
		// form follows the address.
		*restore() {
			sync( true );
			const { state } =
				( yield import( '@wordpress/interactivity-router' ) ) as typeof import( '@wordpress/interactivity-router' );
			for ( let waited = 0; state.navigating && waited < 100; waited++ ) {
				yield new Promise( ( done ) => setTimeout( done, 50 ) );
			}
			keepVariations();
		},
	},
} );
