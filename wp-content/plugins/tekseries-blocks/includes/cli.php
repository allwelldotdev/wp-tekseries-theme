<?php
/**
 * WP-CLI commands.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Tones published events and news posts that have no tone yet, oldest first.
 *
 * ## OPTIONS
 *
 * [--post_type=<post_type>]
 * : Tone only this post type.
 * ---
 * options:
 *   - event
 *   - post
 * ---
 *
 * [--force]
 * : Re-tone posts that already have a tone.
 *
 * [--dry-run]
 * : Show the tones without saving them.
 *
 * ## EXAMPLES
 *
 *     wp tekseries backfill-tones --dry-run
 *     wp tekseries backfill-tones --post_type=event
 *
 * @param string[]             $args       Positional arguments. Unused.
 * @param array<string, mixed> $assoc_args Named arguments.
 */
function tekseries_blocks_cli_backfill_tones( array $args, array $assoc_args ): void {
	$post_types = isset( $assoc_args['post_type'] ) ? array( (string) $assoc_args['post_type'] ) : tekseries_blocks_tone_post_types();
	$force      = (bool) WP_CLI\Utils\get_flag_value( $assoc_args, 'force', false );
	$dry_run    = (bool) WP_CLI\Utils\get_flag_value( $assoc_args, 'dry-run', false );

	foreach ( $post_types as $post_type ) {
		$plan = tekseries_blocks_plan_tones( $post_type, $force );
		$rows = array();
		$kept = 0;

		foreach ( array_reverse( $plan, true ) as $id => $item ) {
			if ( $item['kept'] ) {
				++$kept;
			} elseif ( ! $dry_run ) {
				update_post_meta( $id, 'tekseries_tone', $item['tone'] );
			}
			$rows[] = array(
				'ID'     => $id,
				'date'   => get_the_date( 'Y-m-d', $id ),
				'tone'   => $item['tone'],
				'status' => $item['kept'] ? 'kept' : ( $dry_run ? 'planned' : 'saved' ),
				'title'  => wp_html_excerpt( get_post_field( 'post_title', $id, 'raw' ), 50, '…' ),
			);
		}

		WP_CLI::log( sprintf( '%s (newest first):', $post_type ) );
		WP_CLI\Utils\format_items( 'table', $rows, array( 'ID', 'date', 'tone', 'status', 'title' ) );
		WP_CLI::success(
			sprintf(
				$dry_run ? '%1$s: %2$d to tone, %3$d kept (dry run, nothing saved).' : '%1$s: %2$d toned, %3$d kept.',
				$post_type,
				count( $plan ) - $kept,
				$kept
			)
		);
	}
}

WP_CLI::add_command( 'tekseries backfill-tones', 'tekseries_blocks_cli_backfill_tones' );
