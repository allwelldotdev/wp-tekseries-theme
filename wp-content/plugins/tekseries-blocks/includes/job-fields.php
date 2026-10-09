<?php
/**
 * Job fields for templates.
 *
 * WP Job Manager keeps a job's details in protected (`_`-prefixed) post meta,
 * which core's post-meta binding source refuses. The `tekseries/job-field`
 * source gives templates the ones the design shows, as display text; the
 * `tekseries/job-stats` source gives the number of open jobs.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns a job's location as shown on the boards: "Lagos", "Lagos (Remote)",
 * "Remote", or "Anywhere" when none is set.
 *
 * @param WP_Post $job Job listing.
 * @return string
 */
function tekseries_blocks_job_location( WP_Post $job ): string {
	$location = trim( wp_strip_all_tags( (string) get_the_job_location( $job ) ) );
	if ( ! $job->_remote_position ) {
		return '' !== $location ? $location : __( 'Anywhere', 'tekseries-blocks' );
	}
	if ( '' === $location ) {
		return __( 'Remote', 'tekseries-blocks' );
	}
	/* translators: %s: job location, e.g. "Lagos". */
	return sprintf( __( '%s (Remote)', 'tekseries-blocks' ), $location );
}

/**
 * Returns when a job was posted, in WP Job Manager's date format setting:
 * "Posted 3 days ago" (relative, the default) or "Posted on October 8, 2026".
 *
 * @param WP_Post $job Job listing.
 * @return string
 */
function tekseries_blocks_job_posted( WP_Post $job ): string {
	$timestamp = (int) get_post_timestamp( $job );
	if ( 'default' === get_option( 'job_manager_date_format' ) ) {
		/* translators: %s: date the job was posted. */
		return sprintf( __( 'Posted on %s', 'tekseries-blocks' ), wp_date( (string) get_option( 'date_format' ), $timestamp ) );
	}
	/* translators: %s: time since the job was posted, e.g. "3 days". */
	return sprintf( __( 'Posted %s ago', 'tekseries-blocks' ), human_time_diff( $timestamp ) );
}

/**
 * Returns a job's type (WP Job Manager allows one per job here).
 *
 * @param WP_Post $job Job listing.
 * @return WP_Term|null
 */
function tekseries_blocks_job_type( WP_Post $job ): ?WP_Term {
	$types = wpjm_get_the_job_types( $job );
	return $types && current( $types ) instanceof WP_Term ? current( $types ) : null;
}

/**
 * Returns the value of a `tekseries/job-field` binding.
 *
 * Keys: `company`, `location`, `posted`, `type`. Like core's post-meta source,
 * it gives nothing for a job the visitor may not read.
 *
 * @param array    $args  Binding arguments; `key` names the field.
 * @param WP_Block $block Block being rendered.
 * @return string|null
 */
function tekseries_blocks_job_field_value( array $args, WP_Block $block ): ?string {
	if ( ! function_exists( 'get_the_job_location' ) ) {
		return null;
	}

	$job = get_post( (int) ( $block->context['postId'] ?? 0 ) );
	if (
		! $job
		|| 'job_listing' !== $job->post_type
		|| ( ! is_post_publicly_viewable( $job ) && ! current_user_can( 'read_post', $job->ID ) )
		|| post_password_required( $job )
		|| ! job_manager_user_can_view_job_listing( $job->ID )
	) {
		return null;
	}

	switch ( $args['key'] ?? '' ) {
		case 'company':
			return (string) get_the_company_name( $job );
		case 'location':
			return tekseries_blocks_job_location( $job );
		case 'posted':
			return tekseries_blocks_job_posted( $job );
		case 'type':
			return tekseries_blocks_job_type( $job )?->name ?? '';
	}
	return null;
}

/**
 * Returns the value of a `tekseries/job-stats` binding.
 *
 * Key `open`: the number of open jobs, as the Job Listings block counts them
 * (WP Job Manager caches the query), e.g. "1,341".
 *
 * @param array $args Binding arguments; `key` names the figure.
 * @return string|null
 */
function tekseries_blocks_job_stats_value( array $args ): ?string {
	if ( 'open' !== ( $args['key'] ?? '' ) || ! function_exists( 'get_job_listings' ) ) {
		return null;
	}
	$jobs = get_job_listings(
		array(
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);
	return number_format_i18n( (int) $jobs->found_posts );
}

/**
 * Registers the `tekseries/job-field` and `tekseries/job-stats` binding sources.
 */
function tekseries_blocks_register_job_field_source(): void {
	register_block_bindings_source(
		'tekseries/job-field',
		array(
			'label'              => __( 'Job field', 'tekseries-blocks' ),
			'get_value_callback' => 'tekseries_blocks_job_field_value',
			'uses_context'       => array( 'postId', 'postType' ),
		)
	);
	register_block_bindings_source(
		'tekseries/job-stats',
		array(
			'label'              => __( 'Job Series figures', 'tekseries-blocks' ),
			'get_value_callback' => 'tekseries_blocks_job_stats_value',
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_job_field_source' );
