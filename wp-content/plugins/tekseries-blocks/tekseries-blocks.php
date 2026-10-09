<?php
/**
 * Plugin Name:       TekSeries Blocks
 * Plugin URI:        https://tekseries.com/
 * Description:       Custom blocks for tekseries.com.
 * Version:           0.1.0
 * Requires at least: 7.1
 * Requires PHP:      8.2
 * Author:            TekSeries
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       tekseries-blocks
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers every block in the build manifest.
 *
 * The manifest exists only after `npm run build` has compiled at least one block;
 * registering without it triggers two `_doing_it_wrong` notices in core.
 */
function tekseries_blocks_register_blocks(): void {
	$manifest = __DIR__ . '/build/blocks-manifest.php';
	if ( ! file_exists( $manifest ) ) {
		return;
	}
	wp_register_block_types_from_metadata_collection( __DIR__ . '/build', $manifest );
}
add_action( 'init', 'tekseries_blocks_register_blocks' );
