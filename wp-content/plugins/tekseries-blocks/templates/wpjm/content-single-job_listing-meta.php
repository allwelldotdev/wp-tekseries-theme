<?php
/**
 * Job details on a single job (WP Job Manager template override): type,
 * location, when it was posted and the salary, one row each with an icon,
 * then a row when the job is filled or closed.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $post;

$tekseries_type   = get_option( 'job_manager_enable_types' ) ? tekseries_blocks_job_type( $post ) : null;
$tekseries_salary = the_job_salary( '', '', false );
$tekseries_posted = 'default' === get_option( 'job_manager_date_format' )
	? wp_date( (string) get_option( 'date_format' ), (int) get_post_timestamp( $post ) )
	/* translators: %s: time since the job was posted, e.g. "3 days". */
	: sprintf( __( '%s ago', 'tekseries-blocks' ), human_time_diff( (int) get_post_timestamp( $post ) ) );

// [ class, icon, label, value ].
$tekseries_rows = array();
if ( $tekseries_type ) {
	$tekseries_rows[] = array( 'job-type', tekseries_blocks_icon_svg( tekseries_blocks_job_type_icon( $tekseries_type ) ), __( 'Job type:', 'tekseries-blocks' ), esc_html( $tekseries_type->name ) );
}
$tekseries_rows[] = array(
	'location',
	$post->_remote_position ? tekseries_blocks_icon_svg( 'public' ) : tekseries_blocks_icon_svg( 'location_on' ),
	__( 'Location:', 'tekseries-blocks' ),
	esc_html( tekseries_blocks_job_location( $post ) ),
);
$tekseries_rows[] = array(
	'date-posted',
	tekseries_blocks_icon_svg( 'calendar_month' ),
	__( 'Posted:', 'tekseries-blocks' ),
	sprintf( '<time datetime="%1$s">%2$s</time>', esc_attr( get_post_datetime( $post )->format( 'Y-m-d' ) ), esc_html( $tekseries_posted ) ),
);
if ( $tekseries_salary ) {
	$tekseries_rows[] = array( 'salary', tekseries_blocks_icon_svg( 'payments' ), __( 'Salary:', 'tekseries-blocks' ), esc_html( $tekseries_salary ) );
}

do_action( 'single_job_listing_meta_before' );
?>
<ul class="job-listing-meta meta ts-job-meta">
	<?php do_action( 'single_job_listing_meta_start' ); ?>
	<?php foreach ( $tekseries_rows as [ $tekseries_class, $tekseries_icon, $tekseries_label, $tekseries_value ] ) : ?>
		<li class="<?php echo esc_attr( $tekseries_class ); ?>">
			<?php echo $tekseries_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<span><strong><?php echo esc_html( $tekseries_label ); ?></strong> <?php echo $tekseries_value; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?></span>
		</li>
	<?php endforeach; ?>
	<?php if ( is_position_filled() ) : ?>
		<li class="position-filled ts-job-meta__state">
			<?php echo tekseries_blocks_icon_svg( 'how_to_reg' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<span><?php esc_html_e( 'This position has been filled', 'tekseries-blocks' ); ?></span>
		</li>
	<?php elseif ( ! candidates_can_apply() && 'preview' !== $post->post_status ) : ?>
		<li class="listing-expired ts-job-meta__state">
			<?php echo tekseries_blocks_icon_svg( 'event_busy' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<span><?php esc_html_e( 'Applications have closed', 'tekseries-blocks' ); ?></span>
		</li>
	<?php endif; ?>
	<?php do_action( 'single_job_listing_meta_end' ); ?>
</ul>
<?php
do_action( 'single_job_listing_meta_after' );
