<?php
/**
 * Plugin Name:       TekSeries Blocks
 * Plugin URI:        https://tekseries.com/
 * Description:       Custom blocks for tekseries.com.
 * Version:           1.18.1
 * Requires at least: 7.1
 * Requires PHP:      8.2
 * Requires Plugins:  advanced-custom-fields
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

require_once __DIR__ . '/includes/content-types.php';
require_once __DIR__ . '/includes/icons.php';
require_once __DIR__ . '/includes/meta.php';
require_once __DIR__ . '/includes/acf.php';
require_once __DIR__ . '/includes/list-order.php';
require_once __DIR__ . '/includes/events.php';
require_once __DIR__ . '/includes/deadline.php';
require_once __DIR__ . '/includes/event-types.php';
require_once __DIR__ . '/includes/job-fields.php';
require_once __DIR__ . '/includes/wpjm.php';
require_once __DIR__ . '/includes/job-submission.php';
require_once __DIR__ . '/includes/job-dashboard.php';
require_once __DIR__ . '/includes/media-albums.php';
require_once __DIR__ . '/includes/lightbox.php';
require_once __DIR__ . '/includes/post-video.php';
require_once __DIR__ . '/includes/video-poster.php';
require_once __DIR__ . '/includes/share-links.php';
require_once __DIR__ . '/includes/reveal.php';
require_once __DIR__ . '/includes/contact-form.php';
require_once __DIR__ . '/includes/surveys.php';
require_once __DIR__ . '/includes/tone-cycle.php';
require_once __DIR__ . '/includes/editor.php';

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	require_once __DIR__ . '/includes/cli.php';
}

/**
 * Adds the event rewrite rules on activation, so /events/ resolves at once.
 */
function tekseries_blocks_activate(): void {
	tekseries_blocks_register_content_types();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'tekseries_blocks_activate' );

/**
 * Removes the event rewrite rules on deactivation.
 */
function tekseries_blocks_deactivate(): void {
	unregister_taxonomy( 'event_type' );
	unregister_post_type( 'event' );
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'tekseries_blocks_deactivate' );

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
