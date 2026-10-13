import {
	getConfig,
	getContext,
	getElement,
	store,
	withSyncEvent,
} from '@wordpress/interactivity';

// From Settings, Forms (Formbricks): the server the forms are on, the ID it
// knows this site by and the name that ID goes by in its snippet.
type Config = {
	url: string;
	id: string;
	idName: 'workspaceId' | 'environmentId';
};
// The key of the Formbricks action the link fires.
type Context = { action: string };

// The part of Formbricks' script used here.
type Formbricks = {
	setup: ( config: Record< string, string > ) => unknown;
	track: ( action: string ) => unknown;
};
type WithFormbricks = Window & { formbricks?: Formbricks };

// How long a visitor waits for Formbricks before the link is followed
// instead, in milliseconds.
const PATIENCE = 8000;

let loading: Promise< Formbricks > | undefined;

// Loads Formbricks' script and sets it up, once per page: the same steps as
// the snippet Formbricks gives out. A failed load can be tried again.
const formbricks = (): Promise< Formbricks > => {
	if ( loading ) {
		return loading;
	}
	const { url, id, idName } = getConfig( 'tekseries/surveys' ) as Config;
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
			Promise.resolve( loaded.setup( { [ idName ]: id, appUrl: url } ) )
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

store( 'tekseries/surveys', {
	actions: {
		// The pointer or the keyboard reaches the link: fetch Formbricks now,
		// so the form opens at once on the click.
		warm() {
			formbricks().catch( () => {} );
		},
		// Opens the form over the page instead of following the link. A
		// modified click (new tab) keeps the link, and so does a visitor
		// whose browser cannot reach Formbricks.
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
