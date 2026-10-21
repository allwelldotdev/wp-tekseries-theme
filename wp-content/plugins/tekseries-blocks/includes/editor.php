<?php
/**
 * Editor-only scripts: the post sidebar's "Tone and icon" panel and the
 * Button block's "Icon" panel.
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

/**
 * Lists the icons the Button block's "Icon" panel offers.
 *
 * The panel only sets classes on the button (`ts-icon-<name>`); the theme
 * draws the icon, and has one rule per name here (a unit test checks it).
 *
 * @return string[] Icon names from the `tekseries` collection.
 */
function tekseries_blocks_button_icons(): array {
	return array(
		'arrow_forward',
		'arrow_back',
		'arrow_outward',
		'add_business',
		'upload_file',
		'edit_note',
		'send',
		'directions',
		'dashboard',
		'volunteer_activism',
		'mail',
		'call',
		'calendar_month',
		'search',
		'play_arrow',
		'swap_vert',
		'open_in_full',
		'lock',
	);
}

/**
 * Loads the Button block's "Icon" panel in the block editor, with the icons
 * it offers and their labels.
 */
function tekseries_blocks_enqueue_button_icon(): void {
	$asset_file = dirname( __DIR__ ) . '/build/button-icon/index.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset  = require $asset_file;
	$labels = tekseries_blocks_icon_labels();
	$icons  = array();
	foreach ( tekseries_blocks_button_icons() as $name ) {
		$icons[] = array(
			'name'  => $name,
			'label' => $labels[ $name ] ?? $name,
		);
	}

	wp_enqueue_script( 'tekseries-button-icon', plugins_url( 'build/button-icon/index.js', __DIR__ ), $asset['dependencies'], $asset['version'], true );
	wp_set_script_translations( 'tekseries-button-icon', 'tekseries-blocks' );
	wp_add_inline_script( 'tekseries-button-icon', 'window.tekseriesButtonIcons = ' . wp_json_encode( $icons ) . ';', 'before' );
}
add_action( 'enqueue_block_editor_assets', 'tekseries_blocks_enqueue_button_icon' );

/**
 * Loads the blocks' "Deadline" panel in the block editor: when visitors see
 * a block on a page with a deadline, and the disabled "Applications closed"
 * button (includes/deadline.php).
 */
function tekseries_blocks_enqueue_deadline_tools(): void {
	$asset_file = dirname( __DIR__ ) . '/build/deadline-tools/index.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	wp_enqueue_script( 'tekseries-deadline-tools', plugins_url( 'build/deadline-tools/index.js', __DIR__ ), $asset['dependencies'], $asset['version'], true );
	wp_set_script_translations( 'tekseries-deadline-tools', 'tekseries-blocks' );
}
add_action( 'enqueue_block_editor_assets', 'tekseries_blocks_enqueue_deadline_tools' );
