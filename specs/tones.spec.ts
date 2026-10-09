import {
	test,
	expect,
	type RequestUtils,
} from '@wordpress/e2e-test-utils-playwright';

type Toned = {
	id: number;
	meta: { tekseries_tone: string; tekseries_icon: string };
};

const CYCLE = [ 'saffron', 'plum', 'ink', 'lilac' ];
const after = ( tone: string ) =>
	CYCLE[ ( CYCLE.indexOf( tone ) + 1 ) % CYCLE.length ] ?? '';

// Each event and news post gets its tone once, on first publish: the tone after
// the newest published post of the same type. Tests run in one worker, so each
// post created here is the newest of its type when the next one is published.
test.describe( 'post tones', () => {
	const created: [ string, number ][] = [];

	const create = async (
		requestUtils: RequestUtils,
		type: 'event' | 'posts',
		data: Record< string, unknown >
	) => {
		const { id } = await requestUtils.rest< Toned >( {
			method: 'POST',
			path: `/wp/v2/${ type }`,
			data: {
				title: `E2E Tone ${ type }`,
				content: 'Tone test.',
				...data,
			},
		} );
		created.push( [ type, id ] );
		return id;
	};

	const meta = async (
		requestUtils: RequestUtils,
		type: 'event' | 'posts',
		id: number
	) =>
		(
			await requestUtils.rest< Toned >( {
				path: `/wp/v2/${ type }/${ id }`,
				params: { context: 'edit' },
			} )
		).meta;

	test.afterAll( async ( { requestUtils } ) => {
		for ( const [ type, id ] of created ) {
			await requestUtils.rest( {
				method: 'DELETE',
				path: `/wp/v2/${ type }/${ id }`,
				params: { force: true },
			} );
		}
	} );

	test( 'a published event takes the tone after the newest event', async ( {
		requestUtils,
	} ) => {
		const first = await create( requestUtils, 'event', {
			status: 'publish',
		} );
		const firstTone = ( await meta( requestUtils, 'event', first ) )
			.tekseries_tone;
		expect( CYCLE ).toContain( firstTone );

		const second = await create( requestUtils, 'event', {
			status: 'publish',
		} );
		expect(
			( await meta( requestUtils, 'event', second ) ).tekseries_tone
		).toBe( after( firstTone ) );
	} );

	test( 'a draft has no tone until it is published', async ( {
		requestUtils,
	} ) => {
		const id = await create( requestUtils, 'event', { status: 'draft' } );
		expect(
			( await meta( requestUtils, 'event', id ) ).tekseries_tone
		).toBe( '' );

		await requestUtils.rest( {
			method: 'POST',
			path: `/wp/v2/event/${ id }`,
			data: { status: 'publish' },
		} );
		expect( CYCLE ).toContain(
			( await meta( requestUtils, 'event', id ) ).tekseries_tone
		);
	} );

	test( 'a tone picked before publishing is kept', async ( {
		requestUtils,
	} ) => {
		const id = await create( requestUtils, 'event', {
			status: 'publish',
			meta: { tekseries_tone: 'lilac', tekseries_icon: 'rocket_launch' },
		} );
		expect( await meta( requestUtils, 'event', id ) ).toMatchObject( {
			tekseries_tone: 'lilac',
			tekseries_icon: 'rocket_launch',
		} );
	} );

	test( 'news posts follow their own cycle', async ( { requestUtils } ) => {
		const news = await create( requestUtils, 'posts', {
			status: 'publish',
		} );
		const newsTone = ( await meta( requestUtils, 'posts', news ) )
			.tekseries_tone;

		// An event published in between, in a tone a shared cycle would continue from.
		await create( requestUtils, 'event', {
			status: 'publish',
			meta: { tekseries_tone: after( after( newsTone ) ) },
		} );

		const next = await create( requestUtils, 'posts', {
			status: 'publish',
		} );
		expect(
			( await meta( requestUtils, 'posts', next ) ).tekseries_tone
		).toBe( after( newsTone ) );
	} );

	test( 'an unknown tone or icon is rejected', async ( { requestUtils } ) => {
		for ( const value of [
			{ tekseries_tone: 'green' },
			{ tekseries_icon: 'not_an_icon' },
		] ) {
			await expect(
				requestUtils.rest( {
					method: 'POST',
					path: '/wp/v2/event',
					data: { title: 'E2E Bad Tone', meta: value },
				} )
			).rejects.toMatchObject( { code: 'rest_not_in_enum' } );
		}
	} );
} );
