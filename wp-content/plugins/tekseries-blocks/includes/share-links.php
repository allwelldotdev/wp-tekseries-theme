<?php
/**
 * Share Links: loads the block's script only where it has something to do.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Leaves the Share Links script out unless a block on the page offers "Link to
 * this page", the one link with behaviour (it copies the link).
 *
 * Core enqueues a block's view script module on every render, and the block
 * sits on every news post and event with share services only.
 *
 * @param string   $content  Rendered block.
 * @param array    $block    Parsed block.
 * @param WP_Block $instance Block instance.
 * @return string
 */
function tekseries_blocks_share_links_script( $content, $block, $instance ) {
	static $needed = false;

	$needed = $needed || str_contains( (string) $content, 'data-wp-on--click' );
	if ( ! $needed ) {
		foreach ( $instance->block_type->view_script_module_ids as $module_id ) {
			wp_dequeue_script_module( $module_id );
		}
	}
	return $content;
}
add_filter( 'render_block_tekseries/share-links', 'tekseries_blocks_share_links_script', 10, 3 );
