<?php
/**
 * Event type icons.
 *
 * Each event type has an icon: the term's own `tekseries_icon`, or the default
 * for its slug (tekseries_blocks_event_type_icons()). It shows in the type
 * badge, the type filter chips and the event details card, and an event
 * without a topic icon of its own shows it too.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the event type icon as term meta, editable over REST.
 */
function tekseries_blocks_register_event_type_meta(): void {
	register_term_meta(
		'event_type',
		'tekseries_icon',
		array(
			'type'              => 'string',
			'description'       => __( 'Icon shown with the event type.', 'tekseries-blocks' ),
			'single'            => true,
			'default'           => '',
			'sanitize_callback' => 'tekseries_blocks_sanitize_icon',
			'auth_callback'     => static fn( $allowed, $meta_key, $term_id ): bool => current_user_can( 'edit_term', (int) $term_id ),
			'show_in_rest'      => array(
				// Empty means "use the default for the type's slug".
				'schema' => array( 'enum' => array_merge( array( '' ), tekseries_blocks_topic_icons() ) ),
			),
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_event_type_meta' );

/**
 * Returns an event type's icon: its own, or the default for its slug.
 *
 * @param WP_Term $term Event type.
 * @return string Icon name.
 */
function tekseries_blocks_event_type_icon( WP_Term $term ): string {
	$icon = tekseries_blocks_sanitize_icon( get_term_meta( $term->term_id, 'tekseries_icon', true ) );
	if ( '' !== $icon ) {
		return $icon;
	}
	return tekseries_blocks_event_type_icons()[ $term->slug ] ?? 'event';
}

/**
 * Returns the icon of the event's first type.
 *
 * @param int $post_id Event ID.
 * @return string Icon name, or an empty string for an event without a type.
 */
function tekseries_blocks_event_first_type_icon( int $post_id ): string {
	$terms = get_the_terms( $post_id, 'event_type' );
	return is_array( $terms ) && $terms ? tekseries_blocks_event_type_icon( reset( $terms ) ) : '';
}

/**
 * Puts each type's icon in front of its name in a "badge" Post Terms block.
 *
 * @param string   $content Rendered block.
 * @param array    $parsed  Parsed block (attributes).
 * @param WP_Block $block   Block instance, for the post ID.
 * @return string
 */
function tekseries_blocks_render_type_badges( string $content, array $parsed, WP_Block $block ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( 'event_type' !== ( $parsed['attrs']['term'] ?? '' ) || ! is_string( $class ) || ! str_contains( $class, 'is-style-badge' ) ) {
		return $content;
	}

	$terms = get_the_terms( (int) ( $block->context['postId'] ?? 0 ), 'event_type' );
	if ( ! is_array( $terms ) ) {
		return $content;
	}

	foreach ( $terms as $term ) {
		$link = get_term_link( $term );
		if ( is_wp_error( $link ) ) {
			continue;
		}
		// The link markup get_the_term_list() prints for each term.
		$anchor  = '<a href="' . esc_url( $link ) . '" rel="tag">';
		$content = str_replace( $anchor, $anchor . tekseries_blocks_icon_svg( tekseries_blocks_event_type_icon( $term ) ), $content );
	}

	// An ongoing event's badge ends with the "Ongoing" chip.
	$close = strrpos( $content, '</div>' );
	if ( false !== $close && tekseries_blocks_event_is_ongoing( (int) ( $block->context['postId'] ?? 0 ) ) ) {
		$content = substr_replace( $content, tekseries_blocks_ongoing_chip(), $close, 0 );
	}
	return $content;
}
add_filter( 'render_block_core/post-terms', 'tekseries_blocks_render_type_badges', 10, 3 );

/**
 * Shows the event's type icon in an Icon block with the `ts-event-type-icon`
 * class (the details card), in place of the icon saved in the template.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (attributes).
 * @return string
 */
function tekseries_blocks_render_type_tile( string $content, array $parsed ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! in_array( 'ts-event-type-icon', explode( ' ', $class ), true ) ) {
		return $content;
	}

	$icon = 'event' === get_post_type() ? tekseries_blocks_event_first_type_icon( (int) get_the_ID() ) : '';
	return '' === $icon ? $content : tekseries_blocks_swap_icon( $content, $icon );
}
add_filter( 'render_block_core/icon', 'tekseries_blocks_render_type_tile', 10, 2 );

/**
 * Puts an icon in each event type filter chip (Navigation links with the
 * `ts-type-chip` class): the type's icon, or "apps" for the all-events chip.
 * A visitor who turned the list round, or searched it, keeps that from chip to
 * chip.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (attributes).
 * @return string
 */
function tekseries_blocks_render_type_chip( string $content, array $parsed ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! in_array( 'ts-type-chip', explode( ' ', $class ), true ) ) {
		return $content;
	}

	$svg = tekseries_blocks_icon_svg( 'apps' );
	if ( preg_match( '#/event_type/([^/?\#]+)#', (string) ( $parsed['attrs']['url'] ?? '' ), $slug ) ) {
		$term = get_term_by( 'slug', sanitize_title( $slug[1] ), 'event_type' );
		$svg  = tekseries_blocks_icon_svg( $term instanceof WP_Term ? tekseries_blocks_event_type_icon( $term ) : 'event' );
	}

	// The order and an event search carry from chip to chip.
	$keep = array_filter(
		array(
			'q'     => rawurlencode( tekseries_blocks_event_search() ),
			'order' => 'asc' === tekseries_blocks_list_order() ? 'asc' : '',
		)
	);
	if ( $keep ) {
		$tags = new WP_HTML_Tag_Processor( $content );
		if ( $tags->next_tag( 'a' ) && is_string( $tags->get_attribute( 'href' ) ) ) {
			$tags->set_attribute( 'href', add_query_arg( $keep, $tags->get_attribute( 'href' ) ) );
			$content = $tags->get_updated_html();
		}
	}

	$label = '<span class="wp-block-navigation-item__label">';
	$at    = strpos( $content, $label );
	return false === $at ? $content : substr_replace( $content, $svg . $label, $at, strlen( $label ) );
}
add_filter( 'render_block_core/navigation-link', 'tekseries_blocks_render_type_chip', 10, 2 );
