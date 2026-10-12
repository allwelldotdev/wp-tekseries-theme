<?php
/**
 * List order: a visitor can turn a list round, oldest first, with ?order=asc
 * in the address. Events, event type pages and the job list follow it.
 *
 * A Button with the class "ts-sort" is the switch: bound to this file's
 * source it shows the order on show and links to the other one, so it works
 * as a plain link without JavaScript.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The order the address asks for.
 *
 * @return string "asc" (oldest first) or "desc" (newest first, the default).
 */
function tekseries_blocks_list_order(): string {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a public link; it only changes the order of a read-only list.
	$order = isset( $_GET['order'] ) && is_string( $_GET['order'] ) ? strtolower( sanitize_key( wp_unslash( $_GET['order'] ) ) ) : '';
	return 'asc' === $order ? 'asc' : 'desc';
}

/**
 * The label of an order.
 *
 * @param string $order "asc" or "desc".
 * @return string
 */
function tekseries_blocks_list_order_label( string $order ): string {
	return 'asc' === $order ? __( 'Oldest first', 'tekseries-blocks' ) : __( 'Newest first', 'tekseries-blocks' );
}

/**
 * What the switch does, for screen readers. It starts with the label on
 * show, so speech input still finds the link by the words on screen.
 *
 * @param string $order The order on show: "asc" or "desc".
 * @return string
 */
function tekseries_blocks_list_order_hint( string $order ): string {
	return 'asc' === $order
		? __( 'Oldest first. Show newest first', 'tekseries-blocks' )
		: __( 'Newest first. Show oldest first', 'tekseries-blocks' );
}

/**
 * The address of the list on show, from its first page, in an order.
 *
 * @param string $order "asc" or "desc".
 * @return string
 */
function tekseries_blocks_list_order_url( string $order ): string {
	$object = get_queried_object();
	$base   = '';
	if ( $object instanceof WP_Term ) {
		$base = get_term_link( $object );
	} elseif ( $object instanceof WP_Post_Type ) {
		$base = get_post_type_archive_link( $object->name );
	} elseif ( $object instanceof WP_Post ) {
		$base = get_permalink( $object );
	}
	$base = is_string( $base ) && '' !== $base ? $base : home_url( '/' );

	return 'asc' === $order ? add_query_arg( 'order', 'asc', $base ) : $base;
}

/**
 * Block binding callback for the `tekseries/list-order` source.
 *
 * Keys: "label" is the order on show; "url" is this list in the other order.
 *
 * @param array $args Binding arguments: `key`.
 * @return string|null Null for an unknown key.
 */
function tekseries_blocks_list_order_value( array $args ): ?string {
	$order = tekseries_blocks_list_order();
	switch ( $args['key'] ?? '' ) {
		case 'label':
			return tekseries_blocks_list_order_label( $order );
		case 'url':
			return tekseries_blocks_list_order_url( 'asc' === $order ? 'desc' : 'asc' );
	}
	return null;
}

/**
 * Registers the `tekseries/list-order` binding source.
 */
function tekseries_blocks_register_list_order_source(): void {
	register_block_bindings_source(
		'tekseries/list-order',
		array(
			'label'              => __( 'List order', 'tekseries-blocks' ),
			'get_value_callback' => 'tekseries_blocks_list_order_value',
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_list_order_source' );

/**
 * Tells screen readers what a "ts-sort" Button does: its text only names the
 * order on show.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (attributes).
 * @return string
 */
function tekseries_blocks_render_sort_button( string $content, array $parsed ): string {
	$class = $parsed['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! in_array( 'ts-sort', explode( ' ', $class ), true ) ) {
		return $content;
	}

	$tags = new WP_HTML_Tag_Processor( $content );
	if ( ! $tags->next_tag( 'a' ) ) {
		return $content;
	}
	$tags->set_attribute( 'aria-label', tekseries_blocks_list_order_hint( tekseries_blocks_list_order() ) );
	return $tags->get_updated_html();
}
add_filter( 'render_block_core/button', 'tekseries_blocks_render_sort_button', 10, 2 );
