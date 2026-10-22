<?php
/**
 * Event search: the Events page and the event type pages find events by
 * their title, from ?q= in the address.
 *
 * The Event Search block (src/event-search) prints the form, and the status
 * line or the empty card. The search is `q`, not WordPress's `s`, which would
 * turn the page into the site's search results. Every word must be in the
 * title. While searching:
 * - the Events page's grid lists the matches from the first, twelve a page,
 *   and blocks with the class `ts-hide-searching` (the Latest card, Happening
 *   now, the "no events yet" note) are left out;
 * - an event type page lists its matches, twelve a page.
 * The type chips and the order switch keep the search.
 *
 * Blocks with the class `ts-event-region--<name>` are the parts the block's
 * script swaps in place as the visitor types (router regions).
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The search in the address, tidied.
 *
 * @return string Empty when there is none.
 */
function tekseries_blocks_event_search(): string {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a public search of a read-only list.
	$search = isset( $_GET['q'] ) && is_string( $_GET['q'] ) ? sanitize_text_field( wp_unslash( $_GET['q'] ) ) : '';
	return mb_substr( trim( preg_replace( '/\s+/', ' ', $search ) ), 0, 100 );
}

/**
 * How many matches a page lists while searching.
 *
 * @return int
 */
function tekseries_blocks_event_search_per_page(): int {
	return 12;
}

/**
 * Keeps only events whose title holds every word of a query marked with
 * `tekseries_title_search`.
 *
 * @param string   $where The query's WHERE clause.
 * @param WP_Query $query The query.
 * @return string
 */
function tekseries_blocks_event_search_where( string $where, WP_Query $query ): string {
	global $wpdb;

	$search = (string) $query->get( 'tekseries_title_search' );
	foreach ( array_filter( explode( ' ', $search ) ) as $word ) {
		$where .= $wpdb->prepare( " AND {$wpdb->posts}.post_title LIKE %s", '%' . $wpdb->esc_like( $word ) . '%' );
	}
	return $where;
}
add_filter( 'posts_where', 'tekseries_blocks_event_search_where', 10, 2 );

/**
 * Searches the Events page's grid: a Query Loop whose query carries
 * `"tekseriesSearch":true`. It then starts from the first event, so the
 * Latest card's event is a match like any other.
 *
 * @param array    $query Query arguments built from the Query Loop block.
 * @param WP_Block $block The block asking: its context carries the loop's settings.
 * @return array
 */
function tekseries_blocks_event_search_query_loop( array $query, WP_Block $block ): array {
	$search = tekseries_blocks_event_search();
	if ( '' === $search || empty( $block->context['query']['tekseriesSearch'] ) ) {
		return $query;
	}

	$per_page = tekseries_blocks_event_search_per_page();
	$key      = isset( $block->context['queryId'] ) ? 'query-' . $block->context['queryId'] . '-page' : 'query-page';
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- the page of a read-only list.
	$page = max( 1, isset( $_GET[ $key ] ) ? absint( $_GET[ $key ] ) : 1 );

	$query['tekseries_title_search'] = $search;
	$query['posts_per_page']         = $per_page;
	$query['offset']                 = ( $page - 1 ) * $per_page;
	return $query;
}
add_filter( 'query_loop_block_query_vars', 'tekseries_blocks_event_search_query_loop', 20, 2 );

/**
 * Searches an event type page: its loop inherits the main query.
 *
 * @param WP_Query $query Query being prepared.
 */
function tekseries_blocks_event_search_archive( WP_Query $query ): void {
	if ( is_admin() || ! $query->is_main_query() || ! $query->is_tax( 'event_type' ) ) {
		return;
	}
	$search = tekseries_blocks_event_search();
	if ( '' !== $search ) {
		$query->set( 'tekseries_title_search', $search );
		$query->set( 'posts_per_page', tekseries_blocks_event_search_per_page() );
	}
}
add_action( 'pre_get_posts', 'tekseries_blocks_event_search_archive', 20 );

/**
 * Counts the events that match the search where it is shown: in the event
 * type on show, or all events.
 *
 * @return int
 */
function tekseries_blocks_event_search_count(): int {
	$args = array(
		'post_type'              => 'event',
		'post_status'            => 'publish',
		'posts_per_page'         => 1,
		'fields'                 => 'ids',
		'tekseries_title_search' => tekseries_blocks_event_search(),
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
	);
	$term = get_queried_object();
	if ( $term instanceof WP_Term && 'event_type' === $term->taxonomy ) {
		$args['tax_query'] = array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- one count per search.
			array(
				'taxonomy' => 'event_type',
				'terms'    => $term->term_id,
			),
		);
	}
	return ( new WP_Query( $args ) )->found_posts;
}

/**
 * The address the form searches: the list on show, from its first page, in
 * its order, without a search.
 *
 * @return string
 */
function tekseries_blocks_event_search_base(): string {
	return remove_query_arg( array( 'order', 'q' ), tekseries_blocks_list_order_url( tekseries_blocks_list_order() ) );
}

/**
 * Leaves out what a search replaces (`ts-hide-searching`), and makes the
 * parts the script swaps (`ts-event-region--<name>`) router regions.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (attributes).
 * @return string
 */
function tekseries_blocks_render_event_search_parts( string $content, array $parsed ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! str_contains( $class, 'ts-' ) ) {
		return $content;
	}
	$classes = explode( ' ', $class );
	if ( in_array( 'ts-hide-searching', $classes, true ) && '' !== tekseries_blocks_event_search() ) {
		return '';
	}

	foreach ( $classes as $name ) {
		if ( str_starts_with( $name, 'ts-event-region--' ) ) {
			$tags = new WP_HTML_Tag_Processor( $content );
			if ( $tags->next_tag() ) {
				$tags->set_attribute( 'data-wp-interactive', 'tekseries/event-search' );
				$tags->set_attribute( 'data-wp-router-region', 'tekseries/event-search/' . substr( $name, strlen( 'ts-event-region--' ) ) );
				$tags->set_attribute( 'data-wp-on--click', 'actions.follow' );
				// Focus goes here after a change of page.
				$tags->set_attribute( 'tabindex', '-1' );
				return $tags->get_updated_html();
			}
		}
	}
	return $content;
}
add_filter( 'render_block', 'tekseries_blocks_render_event_search_parts', 10, 2 );

/**
 * Words that find events, offered when a search finds none.
 *
 * @return string[]
 */
function tekseries_blocks_event_search_suggestions(): array {
	/**
	 * Filters the words offered under a search that found no events.
	 *
	 * @param string[] $words Words, each a search of its own.
	 */
	return (array) apply_filters( 'tekseries_blocks_event_search_suggestions', array( 'Coding', 'AI', 'Career', 'Women' ) );
}
