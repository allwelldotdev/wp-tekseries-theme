import {
	getContext,
	getElement,
	store,
	withSyncEvent,
} from '@wordpress/interactivity';

// "Link to this page": its label, and the note shown after a copy.
type Context = { label: string; note: string };
// Translated by render.php.
type ServerState = { state: { copyLabel: string; copied: string } };

// How long "Link copied" stays up, in milliseconds.
const NOTE_TIME = 2500;

const storeDef = {
	actions: {
		// Copies the link instead of following it. A modified click (new tab)
		// and a page without the Clipboard API keep the plain link.
		copy: withSyncEvent( function* ( event: MouseEvent ) {
			const modified =
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey;
			if ( modified || ! navigator.clipboard ) {
				return;
			}
			event.preventDefault();

			const { href } = getElement().ref as HTMLAnchorElement;
			try {
				yield navigator.clipboard.writeText( href );
			} catch {
				// Not allowed to copy: do what the link would have done.
				window.location.assign( href );
				return;
			}
			const context = getContext< Context >();
			context.note = state.copied;
			yield new Promise( ( resolve ) =>
				setTimeout( resolve, NOTE_TIME )
			);
			context.note = '';
		} ),
	},
	callbacks: {
		// Names the link for what it now does.
		ready() {
			if ( navigator.clipboard ) {
				getContext< Context >().label = state.copyLabel;
			}
		},
	},
};

const { state } = store< ServerState & typeof storeDef >(
	'tekseries/share-links',
	storeDef
);
