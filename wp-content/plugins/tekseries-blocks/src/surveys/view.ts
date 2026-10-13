import {
	getConfig,
	getContext,
	getElement,
	store,
	withSyncEvent,
} from '@wordpress/interactivity';

// From Settings, Forms (Formbricks): the server the forms are on and the ID it
// knows this site by.
type Config = { url: string; id: string };
// The key of the Formbricks action the link fires.
type Context = { action: string };

// The part of Formbricks' script used here.
type Formbricks = {
	setup: ( config: Record< string, string > ) => unknown;
	track: ( action: string ) => unknown;
};
type WithFormbricks = Window & { formbricks?: Formbricks };

// How long a visitor waits for Formbricks, and then for its form, before the
// link is followed instead, in milliseconds.
const PATIENCE = 8000;
// The element Formbricks draws its form in. It is empty while no form shows.
const PANEL = 'formbricks-modal-container';
// What the keyboard can reach inside a form.
const REACHABLE =
	'a[href], button:not([disabled]), input:not([disabled], [type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let loading: Promise< Formbricks > | undefined;
let closing: MutationObserver | undefined;

// Loads Formbricks' script and sets it up, once per page: the same steps as
// the snippet Formbricks gives out. A failed load can be tried again. The ID
// goes under both of the names Formbricks has had for it, so the site need
// not know which version it talks to.
const formbricks = (): Promise< Formbricks > => {
	if ( loading ) {
		return loading;
	}
	const { url, id } = getConfig( 'tekseries/surveys' ) as Config;
	loading = new Promise< Formbricks >( ( resolve, reject ) => {
		const script = document.createElement( 'script' );
		script.async = true;
		script.src = `${ url }/js/formbricks.umd.cjs`;
		script.onerror = () => reject( new Error( 'Formbricks did not load' ) );
		script.onload = () => {
			const loaded = ( window as WithFormbricks ).formbricks;
			if ( ! loaded ) {
				reject( new Error( 'Formbricks is missing' ) );
				return;
			}
			Promise.resolve(
				loaded.setup( {
					environmentId: id,
					workspaceId: id,
					appUrl: url,
				} )
			)
				.then( () => resolve( loaded ) )
				.catch( reject );
		};
		document.head.append( script );
	} );
	loading.catch( () => {
		loading = undefined;
	} );
	return loading;
};

const late = () =>
	new Promise< never >( ( _resolve, reject ) =>
		window.setTimeout( () => reject( new Error( 'Too slow' ) ), PATIENCE )
	);

const panel = () => {
	const box = document.getElementById( PANEL );
	return box && box.childElementCount > 0 ? box : null;
};

// Formbricks says nothing when it has no form to show (a wrong ID, a form
// that is not published, a server that fails): the only sign of a form is
// the form itself, so wait for it.
const opened = (): Promise< HTMLElement > =>
	new Promise( ( resolve, reject ) => {
		const until = Date.now() + PATIENCE;
		const look = () => {
			const box = panel();
			if ( box ) {
				resolve( box );
			} else if ( Date.now() > until ) {
				reject( new Error( 'No form opened' ) );
			} else {
				window.setTimeout( look, 100 );
			}
		};
		look();
	} );

// Formbricks draws its form at the end of the page and leaves the keyboard on
// the button behind it. Put the focus in the form, and back on the button
// once the form is gone, unless the visitor has moved on by then.
const enter = ( box: HTMLElement, button: HTMLElement ) => {
	const reach = () => {
		if ( box.contains( box.ownerDocument.activeElement ) ) {
			return true;
		}
		const first = box.querySelector< HTMLElement >( REACHABLE );
		first?.focus( { preventScroll: true } );
		return !! first;
	};
	closing?.disconnect();
	// The form's fields arrive a moment after its frame.
	let inside = reach();
	closing = new window.MutationObserver( () => {
		if ( panel() ) {
			inside = inside || reach();
			return;
		}
		closing?.disconnect();
		closing = undefined;
		const { activeElement, body } = button.ownerDocument;
		if ( ! activeElement || activeElement === body ) {
			button.focus( { preventScroll: true } );
		}
	} );
	closing.observe( document.body, { childList: true, subtree: true } );
};

store( 'tekseries/surveys', {
	actions: {
		// The pointer or the keyboard reaches the link: fetch Formbricks now,
		// so the form opens at once on the click.
		warm() {
			formbricks().catch( () => {} );
		},
		// Opens the form over the page instead of following the link. A
		// modified click (new tab) keeps the link, and so does a visitor
		// for whom no form opens.
		open: withSyncEvent( function* ( event: MouseEvent ) {
			const { ref } = getElement();
			const modified =
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey;
			if ( modified || ! ( ref instanceof HTMLAnchorElement ) ) {
				return;
			}
			event.preventDefault();
			if ( ref.getAttribute( 'aria-busy' ) === 'true' ) {
				return;
			}
			const { action } = getContext< Context >();

			ref.setAttribute( 'aria-busy', 'true' );
			try {
				const loaded: Formbricks = yield Promise.race( [
					formbricks(),
					late(),
				] );
				yield Promise.resolve( loaded.track( action ) );
				const box: HTMLElement = yield opened();
				enter( box, ref );
			} catch {
				// The link itself is the way without the form.
				const href = ref.getAttribute( 'href' ) ?? '';
				if ( href !== '' && ! href.startsWith( '#' ) ) {
					window.location.assign( ref.href );
				}
			} finally {
				ref.removeAttribute( 'aria-busy' );
			}
		} ),
	},
} );
