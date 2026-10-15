import { describe, expect, it } from 'vitest';

import {
	daysLine,
	line,
	read,
	type Words,
} from '../../wp-content/plugins/tekseries-blocks/src/deadline-countdown/time';

const at = ( iso: string ) => Date.parse( iso );

// The Maker's Prize deadline: 1 December 2026, 11:59:59 PM in Nigeria (UTC+1).
const deadline = at( '2026-12-01T23:59:59+01:00' );
const words: Words = {
	left: [ '%d day left to apply', '%d days left to apply' ],
	lastDay: 'Last day to apply',
	closeIn: 'Applications close in %s.',
	soon: 'Applications close in less than a day.',
	closed: 'Applications are closed.',
	days: [ '%d day', '%d days' ],
	hours: [ '%d hour', '%d hours' ],
	minutes: [ '%d minute', '%d minutes' ],
	two: '%1$s and %2$s',
	three: '%1$s, %2$s and %3$s',
};
const reading = ( iso: string ) => read( deadline, at( iso ) );

describe( 'deadline countdown', () => {
	it( 'counts days, hours, minutes and seconds as a clock does', () => {
		expect( reading( '2026-10-15T16:30:15+01:00' ) ).toEqual( {
			closed: false,
			days: 47,
			hours: 7,
			minutes: 29,
			seconds: 44,
		} );
	} );

	it( 'rounds down, so a part second still counts as open', () => {
		expect( read( deadline, deadline - 1 ) ).toEqual( {
			closed: false,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
		} );
		expect( read( deadline, deadline - 1001 ).seconds ).toBe( 1 );
	} );

	it( 'closes at the deadline and stays closed', () => {
		const closed = {
			closed: true,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
		};
		expect( read( deadline, deadline ) ).toEqual( closed );
		expect( reading( '2027-01-05T09:00:00+01:00' ) ).toEqual( closed );
	} );

	it( 'reads the same moment the same in any time zone', () => {
		expect( reading( '2026-11-30T22:59:59Z' ) ).toEqual(
			reading( '2026-11-30T23:59:59+01:00' )
		);
		expect( reading( '2026-11-30T23:59:59+01:00' ).days ).toBe( 1 );
	} );

	it( 'says the days left, with the right plural', () => {
		expect(
			daysLine( reading( '2026-10-15T16:30:15+01:00' ), words )
		).toBe( '47 days left to apply' );
		expect(
			daysLine( reading( '2026-11-30T12:00:00+01:00' ), words )
		).toBe( '1 day left to apply' );
	} );

	it( 'says "Last day to apply" in the last 24 hours, not "0 days"', () => {
		expect(
			daysLine( reading( '2026-12-01T00:00:00+01:00' ), words )
		).toBe( 'Last day to apply' );
		expect( daysLine( read( deadline, deadline - 1 ), words ) ).toBe(
			'Last day to apply'
		);
		expect( daysLine( read( deadline, deadline ), words ) ).toBe( '' );
	} );

	it( 'gives screen readers the time left with the right plurals', () => {
		expect( line( reading( '2026-10-15T16:30:15+01:00' ), words ) ).toBe(
			'Applications close in 47 days, 7 hours and 29 minutes.'
		);
		expect( line( reading( '2026-11-30T22:58:59+01:00' ), words ) ).toBe(
			'Applications close in 1 day, 1 hour and 1 minute.'
		);
		expect( line( reading( '2026-12-01T20:59:59+01:00' ), words ) ).toBe(
			'Applications close in 3 hours and 0 minutes.'
		);
		expect( line( reading( '2026-12-01T23:30:00+01:00' ), words ) ).toBe(
			'Applications close in 30 minutes.'
		);
		expect( line( read( deadline, deadline - 1 ), words ) ).toBe(
			'Applications close in 1 minute.'
		);
		expect( line( read( deadline, deadline ), words ) ).toBe(
			'Applications are closed.'
		);
	} );
} );
