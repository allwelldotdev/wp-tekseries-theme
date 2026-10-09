<?php
/**
 * The job dashboard (WP Job Manager's [job_dashboard]).
 *
 * The list comes from this plugin's job-dashboard.php template; WP Job
 * Manager still runs the actions, the statistics dialog and its script.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the dashboard's styles; its template enqueues them.
 */
function tekseries_blocks_register_job_dashboard_style(): void {
	$version = (string) filemtime( dirname( __DIR__ ) . '/assets/css/job-dashboard.css' );
	wp_register_style( 'tekseries-blocks-job-dashboard', plugins_url( 'assets/css/job-dashboard.css', __DIR__ ), array( 'tekseries-blocks-job' ), $version );
}
add_action( 'init', 'tekseries_blocks_register_job_dashboard_style' );

/**
 * Returns the icon for a dashboard action; a chevron for one this site
 * doesn't know.
 *
 * @param string $action Action name, e.g. "duplicate".
 * @return string
 */
function tekseries_blocks_job_action_icon( string $action ): string {
	$icons = array(
		'continue'        => 'edit_note',
		'edit'            => 'edit',
		'duplicate'       => 'content_copy',
		'delete'          => 'delete',
		'mark_filled'     => 'how_to_reg',
		'mark_not_filled' => 'undo',
		'renew'           => 'autorenew',
		'relist'          => 'replay',
	);
	return $icons[ $action ] ?? 'chevron_right';
}

/**
 * Makes "Continue Submission" the main action of a draft and "Edit" that of
 * any other job, where WP Job Manager offers them (the design). Otherwise WP
 * Job Manager's choice stands, except Delete: it stays in the menu, and
 * Duplicate takes the button (a pending job can't be edited on this site).
 *
 * @param array|false $primary Action WP Job Manager picked.
 * @param WP_Post     $job     Job.
 * @param array       $actions Actions on offer, by name.
 * @return array|false
 */
function tekseries_blocks_job_primary_action( $primary, $job, $actions ) {
	$preferred = 'draft' === $job->post_status ? 'continue' : 'edit';
	if ( isset( $actions[ $preferred ] ) ) {
		return $actions[ $preferred ];
	}
	if ( is_array( $primary ) && 'delete' === ( $primary['name'] ?? '' ) ) {
		return $actions['duplicate'] ?? false;
	}
	return $primary;
}
add_filter( 'job_manager_my_job_primary_action', 'tekseries_blocks_job_primary_action', 10, 3 );

/**
 * Calls a published job "Published" on the site (WP Job Manager says
 * "Active"); wp-admin keeps WP Job Manager's labels.
 *
 * @param array $statuses Status labels by status.
 * @return array
 */
function tekseries_blocks_job_status_labels( $statuses ) {
	if ( ! is_admin() && isset( $statuses['publish'] ) ) {
		$statuses['publish'] = __( 'Published', 'tekseries-blocks' );
	}
	return $statuses;
}
add_filter( 'job_listing_post_statuses', 'tekseries_blocks_job_status_labels' );
