<?php
/**
 * Post editor sidebar: the "Tone and icon" panel.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads the panel script in the block editor, with the curated icon list it offers.
 */
function tekseries_blocks_enqueue_post_settings(): void {
	$asset_file = dirname( __DIR__ ) . '/build/post-settings/index.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	$url   = plugins_url( 'build/post-settings/', __DIR__ );

	wp_enqueue_script( 'tekseries-post-settings', $url . 'index.js', $asset['dependencies'], $asset['version'], true );
	wp_set_script_translations( 'tekseries-post-settings', 'tekseries-blocks' );
	wp_add_inline_script(
		'tekseries-post-settings',
		'window.tekseriesPostSettings = ' . wp_json_encode(
			array(
				'postTypes'  => tekseries_blocks_tone_post_types(),
				'topicIcons' => tekseries_blocks_topic_icons(),
			)
		) . ';',
		'before'
	);
	wp_enqueue_style( 'tekseries-post-settings', $url . 'index.css', array( 'wp-components' ), $asset['version'] );
}
add_action( 'enqueue_block_editor_assets', 'tekseries_blocks_enqueue_post_settings' );
