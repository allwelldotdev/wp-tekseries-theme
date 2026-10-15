import { getContext, getElement, store } from '@wordpress/interactivity';

import { two } from '../event-countdown/time';
import { daysLine, line, read, type Words } from './time';

// Sent by render.php: the words, in the site's language.
type State = { words: Words; now: number };
// The page's deadline, and, on a block marked ts-when-open or ts-when-closed,
// which of the two it is (includes/deadline.php).
type Context = { deadline: number; when?: 'open' | 'closed' };

const { state } = store( 'tekseries/deadline-countdown', {
	state: {
		// The moment everything on the page is read at.
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
		// Shows a ts-when-open block until the deadline, and a ts-when-closed
		// block from then on.
		phase() {
			const { ref } = getElement();
			if ( ! ref ) {
				return;
			}
			const { deadline, when } = getContext< Context >();
			const closed = state.now >= deadline;
			ref.hidden = when === 'closed' ? ! closed : closed;
		},
		// Writes one countdown. It reads the clock, so it runs again on
		// every tick.
		draw() {
			const { ref } = getElement();
			if ( ! ref ) {
				return;
			}
			const reading = read( getContext< Context >().deadline, state.now );
			const set = ( name: string, text: string ) => {
				const part = ref.querySelector( `[data-part="${ name }"]` );
				if ( part && part.textContent !== text ) {
					part.textContent = text;
				}
			};

			ref.classList.add( 'is-live' );
			ref.classList.toggle( 'is-closed', reading.closed );
			if ( ref.classList.contains( 'is-days' ) ) {
				ref.hidden = reading.closed;
			}
			set( 'days-line', daysLine( reading, state.words ) );
			set( 'line', line( reading, state.words ) );
			set( 'days', two( reading.days ) );
			set( 'hours', two( reading.hours ) );
			set( 'minutes', two( reading.minutes ) );
			set( 'seconds', two( reading.seconds ) );
		},
	},
} );

let clock: number | undefined;
