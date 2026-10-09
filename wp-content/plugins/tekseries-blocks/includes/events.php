<?php
/**
 * Event dates and registration.
 *
 * An event's date is the ACF `event_date` field, stored as `Ymd`. Templates
 * mark the blocks that only make sense before the event (the Register button
 * and the "Join here" row) with the `ts-register` class; once the date has
 * passed, the button becomes "This event has ended" and the rest is left out.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parses a stored `Ymd` date as midnight in the site's time zone.
 *
 * @param string $ymd Stored date, e.g. "20260926".
 * @return DateTimeImmutable|null Null when the value isn't a valid date.
 */
function tekseries_blocks_parse_ymd( string $ymd ): ?DateTimeImmutable {
	if ( ! preg_match( '/^\d{8}$/', $ymd ) ) {
		return null;
	}
	$date = DateTimeImmutable::createFromFormat( '!Ymd', $ymd, wp_timezone() );
	return $date && $date->format( 'Ymd' ) === $ymd ? $date : null;
}

/**
 * Returns an event's date.
 *
 * @param int $post_id Event ID.
 * @return DateTimeImmutable|null Null when the event has no valid date.
 */
function tekseries_blocks_event_date( int $post_id ): ?DateTimeImmutable {
	return tekseries_blocks_parse_ymd( (string) get_post_meta( $post_id, 'event_date', true ) );
}

/**
 * Tells whether an event's day is over, in the site's time zone.
 *
 * @param int $post_id Event ID.
 * @return bool False for an event without a date.
 */
function tekseries_blocks_event_has_ended( int $post_id ): bool {
	$date = tekseries_blocks_event_date( $post_id );
	return null !== $date && $date < new DateTimeImmutable( 'today', wp_timezone() );
}

/**
 * Swaps the registration blocks of an ended event, and hides a Register button without a link.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (name, attributes).
 * @return string
 */
function tekseries_blocks_render_registration( string $content, array $parsed ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! in_array( 'ts-register', explode( ' ', $class ), true ) ) {
		return $content;
	}

	// The current post: the single event, or the event a Query Loop is rendering.
	$post_id = (int) get_the_ID();
	if ( 'event' !== get_post_type( $post_id ) ) {
		return $content;
	}

	$is_button = 'core/button' === ( $parsed['blockName'] ?? '' );
	if ( tekseries_blocks_event_has_ended( $post_id ) ) {
		return $is_button ? tekseries_blocks_event_ended_note() : '';
	}

	if ( $is_button ) {
		$link = new WP_HTML_Tag_Processor( $content );
		if ( ! $link->next_tag( 'a' ) || ! $link->get_attribute( 'href' ) ) {
			return '';
		}
	}

	return $content;
}
add_filter( 'render_block', 'tekseries_blocks_render_registration', 10, 2 );

/**
 * Returns the note that replaces the Register button after the event.
 *
 * @return string
 */
function tekseries_blocks_event_ended_note(): string {
	return sprintf(
		'<p class="ts-event-ended">%1$s<span>%2$s</span></p>',
		wp_get_icon( 'tekseries/event_busy', array( 'size' => null ) ),
		esc_html__( 'This event has ended', 'tekseries-blocks' )
	);
}
