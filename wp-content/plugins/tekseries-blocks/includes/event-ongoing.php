<?php
/**
 * Ongoing events.
 *
 * An event marked "Ongoing" (the ACF switch `event_ongoing`) started on its
 * event date and is still running. Its date reads "Since …", it never shows
 * as ended or counts down, its type badge carries an "Ongoing" chip, and the
 * Events page shows it under "Happening now".
 *
 * Templates mark blocks for one state only with the classes `ts-ongoing-only`
 * and `ts-not-ongoing`. The texts that depend on today's date come from the
 * `tekseries/event-ongoing` binding source, in Nigerian time.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tells whether an event is marked as ongoing.
 *
 * @param int $post_id Event ID.
 * @return bool
 */
function tekseries_blocks_event_is_ongoing( int $post_id ): bool {
	return $post_id > 0 && 'event' === get_post_type( $post_id ) && '1' === (string) get_post_meta( $post_id, 'event_ongoing', true );
}

/**
 * Returns the post a block is rendered for: its context, else the loop's post.
 *
 * @param WP_Block|null $block Block instance.
 * @return int
 */
function tekseries_blocks_ongoing_post_id( ?WP_Block $block ): int {
	return (int) ( $block->context['postId'] ?? get_the_ID() );
}

/**
 * Says how long an event has been running, in whole years and months.
 *
 * @param DateTimeImmutable $start When it started.
 * @param DateTimeImmutable $now   Now, in the same time zone.
 * @return string E.g. "3 years, 2 months".
 */
function tekseries_blocks_event_running_for( DateTimeImmutable $start, DateTimeImmutable $now ): string {
	$span  = $start->diff( $now );
	$parts = array();
	if ( $span->invert ) {
		return __( 'less than a month', 'tekseries-blocks' );
	}
	if ( $span->y ) {
		/* translators: %d: number of years. */
		$parts[] = sprintf( _n( '%d year', '%d years', $span->y, 'tekseries-blocks' ), $span->y );
	}
	if ( $span->m ) {
		/* translators: %d: number of months. */
		$parts[] = sprintf( _n( '%d month', '%d months', $span->m, 'tekseries-blocks' ), $span->m );
	}
	return $parts ? implode( ', ', $parts ) : __( 'less than a month', 'tekseries-blocks' );
}

/**
 * Value callback of the `tekseries/event-ongoing` binding source.
 *
 * Keys: "since" (Since August 15, 2023), "started" (Started Aug 2023), "now"
 * (Now · Oct 2026), "status" (Ongoing · October 2026), "stillRunning" (Still
 * running · Oct 2026), "running" (Running for 3 years, 2 months, and still
 * going.), "view" (View workshop) and "link" (the event's address).
 *
 * @param array    $args  Binding arguments: `key`.
 * @param WP_Block $block Block being rendered.
 * @return string|null Null for an unknown key.
 */
function tekseries_blocks_event_ongoing_value( array $args, WP_Block $block ): ?string {
	$post_id = tekseries_blocks_ongoing_post_id( $block );
	$zone    = tekseries_blocks_event_timezone();
	$start   = tekseries_blocks_event_date( $post_id );
	$now     = new DateTimeImmutable( 'now', $zone );

	switch ( $args['key'] ?? '' ) {
		case 'since':
			/* translators: %s: the date the event started, e.g. "August 15, 2023". */
			return $start ? sprintf( __( 'Since %s', 'tekseries-blocks' ), wp_date( 'F j, Y', $start->getTimestamp(), $zone ) ) : '';
		case 'started':
			/* translators: %s: month and year the event started, e.g. "Aug 2023". */
			return $start ? sprintf( __( 'Started %s', 'tekseries-blocks' ), wp_date( 'M Y', $start->getTimestamp(), $zone ) ) : '';
		case 'now':
			/* translators: %s: this month and year, e.g. "Oct 2026". */
			return sprintf( __( 'Now · %s', 'tekseries-blocks' ), wp_date( 'M Y', $now->getTimestamp(), $zone ) );
		case 'status':
			/* translators: %s: this month and year, e.g. "October 2026". */
			return sprintf( __( 'Ongoing · %s', 'tekseries-blocks' ), wp_date( 'F Y', $now->getTimestamp(), $zone ) );
		case 'stillRunning':
			/* translators: %s: this month and year, e.g. "Oct 2026". */
			return sprintf( __( 'Still running · %s', 'tekseries-blocks' ), wp_date( 'M Y', $now->getTimestamp(), $zone ) );
		case 'running':
			/* translators: %s: how long the event has run, e.g. "3 years, 2 months". */
			return $start ? sprintf( __( 'Running for %s, and still going.', 'tekseries-blocks' ), tekseries_blocks_event_running_for( $start, $now ) ) : '';
		case 'view':
			$terms = get_the_terms( $post_id, 'event_type' );
			return is_array( $terms ) && $terms
				/* translators: %s: the event's type in lower case, e.g. "workshop". */
				? sprintf( __( 'View %s', 'tekseries-blocks' ), mb_strtolower( reset( $terms )->name ) )
				: __( 'View event', 'tekseries-blocks' );
		case 'link':
			return (string) get_permalink( $post_id );
	}
	return null;
}

/**
 * Registers the `tekseries/event-ongoing` binding source.
 */
function tekseries_blocks_register_event_ongoing_source(): void {
	register_block_bindings_source(
		'tekseries/event-ongoing',
		array(
			'label'              => __( 'Ongoing event', 'tekseries-blocks' ),
			'get_value_callback' => 'tekseries_blocks_event_ongoing_value',
			'uses_context'       => array( 'postId' ),
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_event_ongoing_source' );

/**
 * Leaves out a block marked for the other state: `ts-ongoing-only` when the
 * event isn't ongoing, `ts-not-ongoing` when it is.
 *
 * @param string        $content Rendered block.
 * @param array         $parsed  Parsed block (attributes).
 * @param WP_Block|null $block   Block instance.
 * @return string
 */
function tekseries_blocks_render_ongoing_state( string $content, array $parsed, ?WP_Block $block = null ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! str_contains( $class, 'ongoing' ) ) {
		return $content;
	}
	$classes = explode( ' ', $class );
	$only    = in_array( 'ts-ongoing-only', $classes, true );
	$not     = in_array( 'ts-not-ongoing', $classes, true );
	if ( ! $only && ! $not ) {
		return $content;
	}
	return tekseries_blocks_event_is_ongoing( tekseries_blocks_ongoing_post_id( $block ) ) === $only ? $content : '';
}
add_filter( 'render_block', 'tekseries_blocks_render_ongoing_state', 10, 3 );

/**
 * Words an ongoing event's bound dates: "Since August 15, 2023" for the full
 * date, and "Aug 2023 – Now" for the month under a card's large day. A date
 * with the class `ts-no-since` is left as it is (the details card, the banner).
 *
 * @param string   $content Rendered block.
 * @param array    $parsed  Parsed block (attributes).
 * @param WP_Block $block   Block instance.
 * @return string
 */
function tekseries_blocks_render_ongoing_date( string $content, array $parsed, WP_Block $block ): string {
	$attrs = $parsed['attrs'] ?? array();
	if ( 'event_date' !== ( $attrs['metadata']['bindings']['datetime']['args']['key'] ?? '' ) ) {
		return $content;
	}
	$classes = explode( ' ', (string) ( $attrs['className'] ?? '' ) );
	if ( in_array( 'ts-no-since', $classes, true ) || ! tekseries_blocks_event_is_ongoing( tekseries_blocks_ongoing_post_id( $block ) ) ) {
		return $content;
	}

	if ( in_array( 'ts-card-date__month', $classes, true ) ) {
		/* translators: %s: month and year the event started, e.g. "Aug 2023". */
		$wording = __( '%s – Now', 'tekseries-blocks' );
	} elseif ( 'F j, Y' === ( $attrs['format'] ?? '' ) ) {
		/* translators: %s: the date the event started, e.g. "August 15, 2023". */
		$wording = __( 'Since %s', 'tekseries-blocks' );
	} else {
		return $content;
	}
	return (string) preg_replace_callback(
		'#<time\b.*?</time>#s',
		static fn( array $time ): string => sprintf( $wording, $time[0] ),
		$content,
		1
	);
}
add_filter( 'render_block_core/post-date', 'tekseries_blocks_render_ongoing_date', 10, 3 );

/**
 * Lists only ongoing events in a Query Loop whose query carries
 * `"tekseriesOngoing":true` (Happening now on the Events page).
 *
 * @param array    $query Query arguments built from the Query Loop block.
 * @param WP_Block $block The block asking: its context carries the loop's settings.
 * @return array
 */
function tekseries_blocks_ongoing_query_loop( array $query, WP_Block $block ): array {
	if ( empty( $block->context['query']['tekseriesOngoing'] ) ) {
		return $query;
	}
	$query['meta_query'] = array_merge( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- one loop, one meta key.
		(array) ( $query['meta_query'] ?? array() ),
		array(
			array(
				'key'   => 'event_ongoing',
				'value' => '1',
			),
		)
	);
	return $query;
}
add_filter( 'query_loop_block_query_vars', 'tekseries_blocks_ongoing_query_loop', 10, 2 );

/**
 * Returns the "Ongoing" chip that follows an ongoing event's type badge.
 *
 * @return string
 */
function tekseries_blocks_ongoing_chip(): string {
	return '<span class="ts-ongoing-chip"><span class="ts-live" aria-hidden="true"></span>' . esc_html__( 'Ongoing', 'tekseries-blocks' ) . '</span>';
}

/**
 * Leaves out the Happening now loop when no event is ongoing, so no empty
 * band is left above the filters.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (attributes).
 * @return string
 */
function tekseries_blocks_render_ongoing_loop( string $content, array $parsed ): string {
	if ( empty( $parsed['attrs']['query']['tekseriesOngoing'] ) ) {
		return $content;
	}
	return str_contains( $content, 'wp-block-post-template' ) ? $content : '';
}
add_filter( 'render_block_core/query', 'tekseries_blocks_render_ongoing_loop', 10, 2 );
