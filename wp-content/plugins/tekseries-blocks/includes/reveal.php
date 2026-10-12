<?php
/**
 * Reveal on scroll: a block with the class "ts-reveal" plays the first time a
 * visitor scrolls to it. The script only says when; stylesheets do the rest.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the script that tells a block it has come into view. The Stat
 * block lists it in its block.json; other blocks get it from the filter below.
 */
function tekseries_blocks_register_reveal(): void {
	$asset_file = dirname( __DIR__ ) . '/build/reveal/view.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	wp_register_script_module( 'tekseries-blocks-reveal', plugins_url( 'build/reveal/view.js', __DIR__ ), $asset['dependencies'], $asset['version'] );
}
add_action( 'init', 'tekseries_blocks_register_reveal' );

/**
 * Hands a block with the class to the script, which then loads on this page.
 *
 * The directive carries its own namespace and id, so a block that already has
 * behaviour of its own keeps it.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function tekseries_blocks_reveal_block( $content, $block ) {
	if ( ! str_contains( (string) ( $block['attrs']['className'] ?? '' ), 'ts-reveal' ) ) {
		return $content;
	}

	$tags = new WP_HTML_Tag_Processor( (string) $content );
	if ( ! $tags->next_tag() || ! $tags->has_class( 'ts-reveal' ) ) {
		return $content;
	}

	if ( null === $tags->get_attribute( 'data-wp-interactive' ) ) {
		$tags->set_attribute( 'data-wp-interactive', 'tekseries/reveal' );
	}
	$tags->set_attribute( 'data-wp-init---reveal', 'tekseries/reveal::callbacks.watch' );
	wp_enqueue_script_module( 'tekseries-blocks-reveal' );

	return $tags->get_updated_html();
}
add_filter( 'render_block', 'tekseries_blocks_reveal_block', 10, 2 );
