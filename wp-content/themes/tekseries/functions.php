<?php
/**
 * TekSeries theme setup.
 *
 * Block themes get core theme supports automatically; this file stays light
 * (stylesheets, block styles, pattern categories and similar setup only).
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads the global stylesheet on the front end.
 */
function tekseries_enqueue_styles(): void {
	wp_enqueue_style(
		'tekseries-global',
		get_theme_file_uri( 'assets/css/global.css' ),
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'tekseries_enqueue_styles' );

/**
 * Loads the same stylesheet in the editor canvas.
 */
function tekseries_editor_styles(): void {
	add_editor_style( 'assets/css/global.css' );
}
add_action( 'after_setup_theme', 'tekseries_editor_styles' );
