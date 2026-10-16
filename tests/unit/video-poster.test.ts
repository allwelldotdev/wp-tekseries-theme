import { describe, expect, it } from 'vitest';

import {
	clampTime,
	defaultTimes,
	formatTime,
	frameSize,
	middleTime,
	otherTimes,
	posterFileName,
} from '../../wp-content/plugins/tekseries-blocks/src/video-poster/frames';

describe( 'poster frame times', () => {
	it( 'grabs a quarter, half and three quarters of the way through', () => {
		expect( defaultTimes( 120 ) ).toEqual( [ 30, 60, 90 ] );
		expect( defaultTimes( 9.9 ) ).toEqual( [ 2.5, 5, 7.4 ] );
	} );

	it( 'sets the middle frame automatically', () => {
		expect( middleTime( 125 ) ).toBe( 62.5 );
		expect( middleTime( 125 ) ).toBe( defaultTimes( 125 )[ 1 ] );
	} );

	it( 'shows other frames in order, apart, inside 10–90%', () => {
		for ( const value of [ 0, 0.3, 0.999 ] ) {
			const times = otherTimes( 100, () => value );
			expect( times ).toHaveLength( 3 );
			expect( new Set( times ).size ).toBe( 3 );
			expect( [ ...times ].sort( ( a, b ) => a - b ) ).toEqual( times );
			for ( const time of times ) {
				expect( time ).toBeGreaterThanOrEqual( 10 );
				expect( time ).toBeLessThanOrEqual( 90 );
			}
		}
	} );

	it( 'keeps a moment inside the video', () => {
		expect( clampTime( -3, 60 ) ).toBe( 0 );
		expect( clampTime( 60, 60 ) ).toBe( 59.9 );
		expect( clampTime( 12.345, 60 ) ).toBe( 12.3 );
		expect( clampTime( 5, 0 ) ).toBe( 0 );
	} );
} );

describe( 'poster frame labels and files', () => {
	it( 'writes times as a clock', () => {
		expect( formatTime( 0 ) ).toBe( '0:00' );
		expect( formatTime( 65.8 ) ).toBe( '1:05' );
		expect( formatTime( 3725 ) ).toBe( '1:02:05' );
	} );

	it( 'reads a video under a minute to a tenth of a second', () => {
		expect( formatTime( 2.5, 10 ) ).toBe( '0:02.5' );
		expect( formatTime( 7.4, 9.9 ) ).toBe( '0:07.4' );
		expect( formatTime( 30, 59 ) ).toBe( '0:30.0' );
		expect( formatTime( 30, 60 ) ).toBe( '0:30' );
	} );

	it( 'names the poster after the video file', () => {
		expect(
			posterFileName(
				'https://example.org/wp-content/uploads/2026/04/Empower-Her-Webinar.mp4'
			)
		).toBe( 'Empower-Her-Webinar-poster.jpg' );
		expect( posterFileName( '/uploads/clip.final.mov?ver=2' ) ).toBe(
			'clip.final-poster.jpg'
		);
		expect( posterFileName( '/uploads/my%20talk.webm' ) ).toBe(
			'my talk-poster.jpg'
		);
		expect( posterFileName( '' ) ).toBe( 'video-poster.jpg' );
	} );

	it( 'caps the frame at 1920px wide, in proportion', () => {
		expect( frameSize( 3840, 2160 ) ).toEqual( {
			width: 1920,
			height: 1080,
		} );
		expect( frameSize( 1280, 720 ) ).toEqual( {
			width: 1280,
			height: 720,
		} );
	} );
} );
