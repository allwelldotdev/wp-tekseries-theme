<?php
/**
 * Tone assignment.
 *
 * A post gets its tone once, when it is first published: the tone after the
 * newest published post of the same type, in the cycle of
 * tekseries_blocks_tones(). The tone is stored, so later filtering or paging
 * never recolours a post. `wp tekseries backfill-tones` tones existing posts.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns the tone that follows the given one in the cycle.
 *
 * @param string $tone A tone from tekseries_blocks_tones().
 * @return string
 */
function tekseries_blocks_tone_after( string $tone ): string {
	$tones = tekseries_blocks_tones();
	$index = array_search( $tone, $tones, true );
	return false === $index ? 'plum' : $tones[ ( $index + 1 ) % count( $tones ) ];
}

/**
 * Picks the tone for a post being published: the one after the newest toned post of its type.
 *
 * Posts published on the same second are ordered by ID. A site with no toned post starts at plum.
 *
 * @param WP_Post $post Post being published.
 * @return string
 */
function tekseries_blocks_next_tone( WP_Post $post ): string {
	$newest = get_posts(
		array(
			'post_type'        => $post->post_type,
			'post_status'      => 'publish',
			'post__not_in'     => array( $post->ID ), // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude -- one row, once per publish.
			'posts_per_page'   => 1,
			'orderby'          => array(
				'date' => 'DESC',
				'ID'   => 'DESC',
			),
			'fields'           => 'ids',
			'no_found_rows'    => true,
			'suppress_filters' => true,
			'meta_query'       => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- one row, once per publish.
				array(
					'key'     => 'tekseries_tone',
					'value'   => tekseries_blocks_tones(),
					'compare' => 'IN',
				),
			),
		)
	);

	return empty( $newest ) ? 'plum' : tekseries_blocks_tone_after( tekseries_blocks_stored_tone( (int) $newest[0] ) );
}

/**
 * Gives a post its tone when it moves into "publish" without one.
 *
 * Runs on wp_after_insert_post, which fires after the REST API has saved meta,
 * so a tone the editor picked before publishing is kept.
 *
 * @param int          $post_id     Post ID.
 * @param WP_Post      $post        Post object.
 * @param bool         $update      Whether this is an update. Unused.
 * @param WP_Post|null $post_before Post before the save, null for a new post.
 */
function tekseries_blocks_assign_tone_on_publish( int $post_id, WP_Post $post, bool $update, ?WP_Post $post_before ): void {
	if (
		'publish' !== $post->post_status
		|| ( $post_before && 'publish' === $post_before->post_status )
		|| ! in_array( $post->post_type, tekseries_blocks_tone_post_types(), true )
		|| '' !== tekseries_blocks_stored_tone( $post_id )
	) {
		return;
	}

	update_post_meta( $post_id, 'tekseries_tone', tekseries_blocks_next_tone( $post ) );
}
add_action( 'wp_after_insert_post', 'tekseries_blocks_assign_tone_on_publish', 10, 4 );

/**
 * Plans tones for the published posts of one type, oldest first.
 *
 * Each post without a tone takes the tone after the post before it. The
 * oldest one starts where the cycle must start for the newest post to end on
 * plum, as on the design boards. Posts that already have a tone keep it,
 * unless $force is set.
 *
 * @param string $post_type Post type.
 * @param bool   $force     Re-tone posts that already have a tone.
 * @return array<int, array{tone: string, kept: bool}> Post ID => planned tone, oldest first.
 */
function tekseries_blocks_plan_tones( string $post_type, bool $force = false ): array {
	$ids = get_posts(
		array(
			'post_type'        => $post_type,
			'post_status'      => 'publish',
			'posts_per_page'   => -1,
			'orderby'          => array(
				'date' => 'ASC',
				'ID'   => 'ASC',
			),
			'fields'           => 'ids',
			'no_found_rows'    => true,
			'suppress_filters' => true,
		)
	);

	$tones    = tekseries_blocks_tones();
	$count    = count( $tones );
	$plum     = (int) array_search( 'plum', $tones, true );
	$start    = $tones[ ( ( $plum - ( count( $ids ) - 1 ) ) % $count + $count ) % $count ];
	$previous = '';
	$plan     = array();

	foreach ( $ids as $id ) {
		$stored = $force ? '' : tekseries_blocks_stored_tone( (int) $id );
		$tone   = '' !== $stored ? $stored : ( '' === $previous ? $start : tekseries_blocks_tone_after( $previous ) );

		$plan[ (int) $id ] = array(
			'tone' => $tone,
			'kept' => '' !== $stored,
		);
		$previous          = $tone;
	}

	return $plan;
}
