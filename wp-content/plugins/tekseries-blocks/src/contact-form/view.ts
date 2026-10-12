import { getContext, getElement, store } from '@wordpress/interactivity';

type Context = { placeholder: string };

type State = { hints: Record< string, string > };

// The Subject field shows the hint of the topic that is checked, or the
// form's own placeholder for a topic without one. Fluent Forms owns the
// fields, so they are changed directly and nothing in the form is bound.
const show = (
	form: HTMLFormElement,
	hints: State[ 'hints' ],
	own: string
) => {
	const subject = form.querySelector< HTMLInputElement >(
		'input[name="subject"]'
	);
	const topic = form.querySelector< HTMLInputElement >(
		'input[name="topic"]:checked'
	);
	if ( subject ) {
		subject.placeholder = hints[ topic?.value ?? '' ] ?? own;
	}
};

const { state } = store( 'tekseries/contact-form', {
	state: {} as State,
	actions: {
		hint( event: Event ) {
			const { ref } = getElement();
			const { placeholder } = getContext< Context >();
			const field = event.target;
			if (
				ref instanceof HTMLFormElement &&
				field instanceof HTMLInputElement &&
				field.name === 'topic'
			) {
				show( ref, state.hints, placeholder );
			}
		},
		// The browser puts the fields back after this event, so the hint
		// is read once it has.
		reset() {
			const { ref } = getElement();
			const { placeholder } = getContext< Context >();
			const { hints } = state;
			if ( ref instanceof HTMLFormElement ) {
				window.setTimeout( () => show( ref, hints, placeholder ) );
			}
		},
	},
} );
