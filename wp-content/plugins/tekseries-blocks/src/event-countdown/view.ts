import { getContext, getElement, store } from '@wordpress/interactivity';

import { read, say, two, type When, type Words } from './time';

// Sent by render.php: the words, in the site's language.
type State = { words: Words; now: number };

const { state } = store( 'tekseries/event-countdown', {
	state: {
		// The moment every countdown on the page is read at.
		now: Date.now(),
	} as State,
	callbacks: {
		// Starts the page's one clock. It stops while the tab is hidden and
		// is put right as soon as the tab shows again.
		run() {
			if ( clock ) {
				return;
			}
			const tick = () => {
				state.now = Date.now();
			};
			clock = window.setInterval( () => {
				if ( ! document.hidden ) {
					tick();
				}
			}, 1000 );
			document.addEventListener( 'visibilitychange', tick );
			tick();
		},
		// Writes one countdown. It reads the clock, so it runs again on
		// every tick. The server printed the same blocks; here they are put
		// right for this moment and kept right.
		draw() {
			const { ref } = getElement();
			if ( ! ref ) {
				return;
			}
			const when = getContext< When >();
			const reading = read( when, state.now );
			const line = say( reading, when.timed, state.words );
			const set = ( name: string, text: string ) => {
				const part = ref.querySelector( `[data-part="${ name }"]` );
				if ( part && part.textContent !== text ) {
					part.textContent = text;
				}
			};

			ref.hidden = reading.phase === 'after';
			ref.classList.add( 'is-live' );
			ref.classList.toggle( 'is-started', reading.phase !== 'before' );
			set( 'line', line );
			set( 'days', String( reading.days ) );
			set( 'days-name', state.words.day[ reading.days === 1 ? 0 : 1 ] );
			set( 'hours', two( reading.hours ) );
			set( 'minutes', two( reading.minutes ) );
			set( 'seconds', two( reading.seconds ) );
		},
	},
} );

let clock: number | undefined;
