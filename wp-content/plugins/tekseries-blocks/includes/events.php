<?php
/**
 * Event dates and registration.
 *
 * An event's date is the ACF `event_date` field, stored as `Ymd`. Event lists
 * are ordered by it, newest first, or oldest first when the address asks
 * (includes/list-order.php). Templates mark the blocks that only make
 * sense before the event (the Register button and the "Join here" row) with
 * the `ts-register` class; once the date has passed, the button becomes "This
 * event has ended" and the rest is left out.
 *
 * An event's day, and its optional start time (`start_time`), are read in
 * Nigerian time. The Event Countdown block (src/event-countdown) counts down
 * to the start.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Parses a stored `Ymd` date as midnight in a time zone.
 *
 * @param string            $ymd  Stored date, e.g. "20260926".
 * @param DateTimeZone|null $zone Time zone. Default: the site's, which is what a date shown by a block needs.
 * @return DateTimeImmutable|null Null when the value isn't a valid date.
 */
function tekseries_blocks_parse_ymd( string $ymd, ?DateTimeZone $zone = null ): ?DateTimeImmutable {
	if ( ! preg_match( '/^\d{8}$/', $ymd ) ) {
		return null;
	}
	$date = DateTimeImmutable::createFromFormat( '!Ymd', $ymd, $zone ?? wp_timezone() );
	return $date && $date->format( 'Ymd' ) === $ymd ? $date : null;
}

/**
 * Returns the time zone the event fields are filled in: Nigerian time.
 *
 * WordPress keeps its clock on UTC on this site, and events are announced in
 * West Africa Time. An event's day and its start time are read in this zone.
 *
 * @return DateTimeZone
 */
function tekseries_blocks_event_timezone(): DateTimeZone {
	/**
	 * Filters the time zone event dates and start times are given in.
	 *
	 * @param string $timezone A time zone name PHP knows, e.g. "Africa/Lagos".
	 */
	$name = apply_filters( 'tekseries_blocks_event_timezone', 'Africa/Lagos' );
	try {
		return new DateTimeZone( (string) $name );
	} catch ( Exception $error ) {
		return new DateTimeZone( 'Africa/Lagos' );
	}
}

/**
 * Returns when an event starts: its date with its start time, or the start
 * of its day when it has no start time.
 *
 * @param int $post_id Event ID.
 * @return array{0: DateTimeImmutable, 1: bool}|null The moment, and whether a start time is set. Null without a valid date.
 */
function tekseries_blocks_event_start( int $post_id ): ?array {
	$day = tekseries_blocks_event_date( $post_id );
	if ( ! $day ) {
		return null;
	}
	// ACF's time picker stores "H:i:s".
	if ( preg_match( '/^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/', (string) get_post_meta( $post_id, 'start_time', true ), $time ) ) {
		return array( $day->setTime( (int) $time[1], (int) $time[2] ), true );
	}
	return array( $day, false );
}

/**
 * Works out what an event's countdown shows at a moment.
 *
 * With a start time the days, hours, minutes and seconds left are what a
 * clock shows. Without one only days count, and they are days on a calendar:
 * an event the day after tomorrow is 2 days away all day long. The script
 * does the same in the browser (src/event-countdown/time.ts): keep the two
 * alike.
 *
 * @param int      $post_id Event ID.
 * @param int|null $now     The moment as a Unix time. Default: now.
 * @return array{start: int, end: int, timed: bool, phase: string, days: int, hours: int, minutes: int, seconds: int}|null
 *         `start` and `end` (the end of the event's day) in milliseconds, for the script; `phase` is
 *         "before" or "during". Null without a valid date, once the event's day is over, and for an
 *         ongoing event.
 */
function tekseries_blocks_event_countdown( int $post_id, ?int $now = null ): ?array {
	$start = tekseries_blocks_event_start( $post_id );
	if ( ! $start || tekseries_blocks_event_is_ongoing( $post_id ) ) {
		return null;
	}

	[ $at, $timed ] = $start;
	$now          ??= time();
	$begins         = $at->getTimestamp();
	$ends           = $at->setTime( 0, 0 )->modify( '+1 day' )->getTimestamp();
	if ( $now >= $ends ) {
		return null;
	}

	$left = max( 0, $begins - $now );
	return array(
		'start'   => $begins * 1000,
		'end'     => $ends * 1000,
		'timed'   => $timed,
		'phase'   => $now >= $begins ? 'during' : 'before',
		'days'    => $timed ? intdiv( $left, DAY_IN_SECONDS ) : (int) ceil( $left / DAY_IN_SECONDS ),
		'hours'   => $timed ? intdiv( $left % DAY_IN_SECONDS, HOUR_IN_SECONDS ) : 0,
		'minutes' => $timed ? intdiv( $left % HOUR_IN_SECONDS, MINUTE_IN_SECONDS ) : 0,
		'seconds' => $timed ? $left % MINUTE_IN_SECONDS : 0,
	);
}

/**
 * Returns the countdown's words. The script gets them too, so each count
 * comes as [ one, many ] rather than through _n().
 *
 * @return array{inDays: string[], inHours: string[], inMinutes: string[], day: string[], today: string, now: string}
 */
function tekseries_blocks_event_countdown_words(): array {
	return array(
		/* translators: %d: number of days, 1. */
		'inDays'    => array( __( 'In %d day', 'tekseries-blocks' ), /* translators: %d: number of days. */ __( 'In %d days', 'tekseries-blocks' ) ),
		/* translators: %d: number of hours, 1. */
		'inHours'   => array( __( 'In %d hour', 'tekseries-blocks' ), /* translators: %d: number of hours. */ __( 'In %d hours', 'tekseries-blocks' ) ),
		/* translators: %d: number of minutes. */
		'inMinutes' => array( __( 'In %d min', 'tekseries-blocks' ), /* translators: %d: number of minutes. */ __( 'In %d min', 'tekseries-blocks' ) ),
		'day'       => array( __( 'day', 'tekseries-blocks' ), __( 'days', 'tekseries-blocks' ) ),
		'today'     => __( 'Today', 'tekseries-blocks' ),
		'now'       => __( 'Happening now', 'tekseries-blocks' ),
	);
}

/**
 * Says a countdown in a few words, by its largest unit: "In 12 days",
 * "In 5 hours", "In 20 min", "Today" or "Happening now". A started minute
 * counts, so the last minute reads "In 1 min".
 *
 * @param array $view  From tekseries_blocks_event_countdown().
 * @param array $words From tekseries_blocks_event_countdown_words().
 * @return string
 */
function tekseries_blocks_event_countdown_line( array $view, array $words ): string {
	if ( 'before' !== $view['phase'] ) {
		return $view['timed'] ? $words['now'] : $words['today'];
	}

	if ( $view['days'] > 0 ) {
		[ $unit, $count ] = array( 'inDays', $view['days'] );
	} elseif ( $view['hours'] > 0 ) {
		[ $unit, $count ] = array( 'inHours', $view['hours'] );
	} else {
		[ $unit, $count ] = array( 'inMinutes', $view['minutes'] + ( $view['seconds'] > 0 ? 1 : 0 ) );
	}
	return sprintf( $words[ $unit ][ 1 === $count ? 0 : 1 ], $count );
}

/**
 * Says when an event starts, for screen readers: "November 7, 2026,
 * 11:00 AM WAT". The time is the event's "Time" text when it has one.
 *
 * @param int $post_id Event ID.
 * @return string Empty without a valid date.
 */
function tekseries_blocks_event_start_text( int $post_id ): string {
	$start = tekseries_blocks_event_start( $post_id );
	if ( ! $start ) {
		return '';
	}

	[ $at, $timed ] = $start;
	$zone           = tekseries_blocks_event_timezone();
	$date           = (string) wp_date( (string) get_option( 'date_format' ), $at->getTimestamp(), $zone );
	$time           = trim( (string) get_post_meta( $post_id, 'time_label', true ) );
	if ( '' === $time && $timed ) {
		$time = (string) wp_date( 'g:i A T', $at->getTimestamp(), $zone );
	}
	return '' === $time ? $date : "$date, $time";
}

/**
 * Returns the start of an event's day, in Nigerian time.
 *
 * @param int $post_id Event ID.
 * @return DateTimeImmutable|null Null when the event has no valid date.
 */
function tekseries_blocks_event_date( int $post_id ): ?DateTimeImmutable {
	return tekseries_blocks_parse_ymd( (string) get_post_meta( $post_id, 'event_date', true ), tekseries_blocks_event_timezone() );
}

/**
 * Tells whether an event's day is over, in Nigerian time. An ongoing event
 * (includes/event-ongoing.php) has not ended.
 *
 * @param int $post_id Event ID.
 * @return bool False for an event without a date.
 */
function tekseries_blocks_event_has_ended( int $post_id ): bool {
	if ( tekseries_blocks_event_is_ongoing( $post_id ) ) {
		return false;
	}
	$date = tekseries_blocks_event_date( $post_id );
	return null !== $date && $date < new DateTimeImmutable( 'today', tekseries_blocks_event_timezone() );
}

/**
 * Registers the Event Countdown's script; the block asks for it when it
 * prints a countdown.
 */
function tekseries_blocks_register_event_countdown(): void {
	$asset_file = dirname( __DIR__ ) . '/build/event-countdown/view.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	wp_register_script_module( 'tekseries-blocks-event-countdown', plugins_url( 'build/event-countdown/view.js', __DIR__ ), $asset['dependencies'], $asset['version'] );
}
add_action( 'init', 'tekseries_blocks_register_event_countdown' );

/**
 * Returns the query argument that lists events by event date.
 *
 * Events without a date stay in the list, after the dated ones in either
 * order; events on the same date fall back to the publish date. The argument
 * marks the query for tekseries_blocks_event_order_clauses().
 *
 * @param string $order ASC or DESC.
 * @return array{tekseries_event_order: string}
 */
function tekseries_blocks_event_order_args( string $order ): array {
	return array( 'tekseries_event_order' => 'ASC' === strtoupper( $order ) ? 'ASC' : 'DESC' );
}

/**
 * Orders a query marked by tekseries_blocks_event_order_args().
 *
 * The date is read through a join of its own. A meta query that also lets
 * undated events through would order those by whichever of their other
 * fields the database picks, which can put them first.
 *
 * @param string[] $clauses The query's clauses.
 * @param WP_Query $query   The query.
 * @return string[]
 */
function tekseries_blocks_event_order_clauses( array $clauses, WP_Query $query ): array {
	global $wpdb;

	$order = $query->get( 'tekseries_event_order' );
	if ( 'ASC' !== $order && 'DESC' !== $order ) {
		return $clauses;
	}

	$date               = 'MAX( tekseries_event_date.meta_value )';
	$clauses['join']   .= " LEFT JOIN {$wpdb->postmeta} AS tekseries_event_date ON ( tekseries_event_date.post_id = {$wpdb->posts}.ID AND tekseries_event_date.meta_key = 'event_date' )";
	$clauses['groupby'] = '' !== trim( (string) $clauses['groupby'] ) ? $clauses['groupby'] : "{$wpdb->posts}.ID";
	$clauses['orderby'] = "( $date IS NULL OR $date = '' ), $date $order, {$wpdb->posts}.post_date $order";
	return $clauses;
}
add_filter( 'posts_clauses', 'tekseries_blocks_event_order_clauses', 10, 2 );

/**
 * Orders event Query Loops (Latest, the grid, More events) by event date.
 *
 * Only loops left on the default "date" order are changed, so an editor's
 * other choice (title, random) still applies.
 *
 * A loop that skips the first events lists "the rest": the Events page's
 * grid, under the Latest card. When the address asks for the oldest first it
 * is turned round, and still leaves out the newest events, which the loop
 * before it shows.
 *
 * @param array    $query Query arguments built from the Query Loop block.
 * @param WP_Block $block The block asking: its context carries the loop's settings.
 * @return array
 */
function tekseries_blocks_sort_event_query_loop( array $query, WP_Block $block ): array {
	if ( 'event' !== ( $query['post_type'] ?? '' ) || 'date' !== ( $query['orderby'] ?? 'date' ) ) {
		return $query;
	}

	$order = (string) ( $query['order'] ?? 'DESC' );
	// A searched grid starts from the first event (includes/event-search.php).
	$searched = ! empty( $block->context['query']['tekseriesSearch'] ) && '' !== tekseries_blocks_event_search();
	$skip     = $searched ? 0 : absint( $block->context['query']['offset'] ?? 0 );
	if ( $skip && 'asc' === tekseries_blocks_list_order() ) {
		$newest = new WP_Query(
			array_merge(
				$query,
				tekseries_blocks_event_order_args( 'DESC' ),
				array(
					'posts_per_page' => $skip,
					'offset'         => 0,
					'fields'         => 'ids',
					'no_found_rows'  => true,
				)
			)
		);

		$query['post__not_in'] = array_merge( (array) ( $query['post__not_in'] ?? array() ), $newest->posts );
		$query['offset']       = max( 0, (int) ( $query['offset'] ?? 0 ) - $skip );
		$order                 = 'ASC';
	}

	return array_merge( $query, tekseries_blocks_event_order_args( $order ) );
}
add_filter( 'query_loop_block_query_vars', 'tekseries_blocks_sort_event_query_loop', 10, 2 );

/**
 * Orders the event archives' main query by event date: event type pages list
 * events with a Query Loop that inherits it. WordPress reads ?order=asc into
 * that query itself.
 *
 * An event type page shows six events a page: two rows of the three-column
 * grid. The loop inherits this query, so its own "perPage" is not used.
 *
 * @param WP_Query $query Query being prepared.
 */
function tekseries_blocks_sort_event_archives( WP_Query $query ): void {
	if ( is_admin() || ! $query->is_main_query() || ! ( $query->is_post_type_archive( 'event' ) || $query->is_tax( 'event_type' ) ) ) {
		return;
	}
	foreach ( tekseries_blocks_event_order_args( (string) $query->get( 'order' ) ) as $key => $value ) {
		$query->set( $key, $value );
	}
	if ( $query->is_tax( 'event_type' ) ) {
		$query->set( 'posts_per_page', 6 );
	}
}
add_action( 'pre_get_posts', 'tekseries_blocks_sort_event_archives' );

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
		$link->next_tag( 'div' );
		$link->set_bookmark( 'wrapper' );
		if ( ! $link->next_tag( 'a' ) || ! $link->get_attribute( 'href' ) ) {
			return '';
		}
		// A link to this site (e.g. /contact/#support) opens in the same tab.
		$host = wp_parse_url( (string) $link->get_attribute( 'href' ), PHP_URL_HOST );
		if ( ! $host || wp_parse_url( home_url(), PHP_URL_HOST ) === $host ) {
			$link->remove_attribute( 'target' );
			$link->remove_attribute( 'rel' );
			$link->seek( 'wrapper' );
			$link->add_class( 'ts-register--here' );
		}
		return $link->get_updated_html();
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
		tekseries_blocks_icon_svg( 'event_busy' ),
		esc_html__( 'This event has ended', 'tekseries-blocks' )
	);
}
