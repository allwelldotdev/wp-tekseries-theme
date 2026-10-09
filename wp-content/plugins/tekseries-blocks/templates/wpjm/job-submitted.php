<?php
/**
 * Submit a job, done (WP Job Manager template override): the steps aside
 * beside a card saying the listing was submitted (or published), with links
 * to the job dashboard and back to Job Series.
 *
 * @package TekSeries
 *
 * @var WP_Post $job Submitted job.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_style( 'tekseries-blocks-job-submit' );

do_action( 'job_manager_job_submitted_content_before', $job );

$tekseries_job   = get_post( $job->ID );
$tekseries_title = get_the_title( $tekseries_job );
$tekseries_dash  = job_manager_get_permalink( 'job_dashboard' );
$tekseries_jobs  = job_manager_get_permalink( 'jobs' );

if ( 'publish' === $tekseries_job->post_status ) {
	/* translators: %s: job title. */
	$tekseries_heading = sprintf( __( '%s is live', 'tekseries-blocks' ), $tekseries_title );
	$tekseries_text    = __( 'Your listing is now on Job Series. You can edit it from your job dashboard.', 'tekseries-blocks' );
} else {
	/* translators: %s: job title. */
	$tekseries_heading = sprintf( __( '%s submitted', 'tekseries-blocks' ), $tekseries_title );
	$tekseries_text    = 'pending' === $tekseries_job->post_status
		? __( 'Your listing will be visible once approved. You can follow its status from your job dashboard.', 'tekseries-blocks' )
		: __( 'Thank you for posting on Job Series.', 'tekseries-blocks' );
}

ob_start();
?>
<div class="ts-submit">
	<?php tekseries_blocks_submit_steps( 3 ); ?>
	<div class="ts-submit__main">
		<div class="job-manager-message ts-submit-done" role="status">
			<span class="ts-submit-done__icon" aria-hidden="true"><?php echo tekseries_blocks_icon_svg( 'task_alt' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
			<h2><?php echo esc_html( $tekseries_heading ); ?></h2>
			<p><?php echo esc_html( $tekseries_text ); ?></p>
			<p class="ts-submit-done__actions">
				<?php if ( 'publish' === $tekseries_job->post_status ) : ?>
					<a class="ts-job-button" href="<?php echo esc_url( get_permalink( $tekseries_job ) ); ?>">
						<?php echo tekseries_blocks_icon_svg( 'visibility' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<?php esc_html_e( 'View your listing', 'tekseries-blocks' ); ?>
					</a>
				<?php endif; ?>
				<?php if ( $tekseries_dash ) : ?>
					<a class="ts-job-button<?php echo 'publish' === $tekseries_job->post_status ? ' ts-job-button--soft' : ''; ?>" href="<?php echo esc_url( $tekseries_dash ); ?>">
						<?php echo tekseries_blocks_icon_svg( 'dashboard' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<?php esc_html_e( 'Go to job dashboard', 'tekseries-blocks' ); ?>
					</a>
				<?php endif; ?>
				<?php if ( $tekseries_jobs ) : ?>
					<a class="ts-job-button ts-job-button--soft" href="<?php echo esc_url( $tekseries_jobs ); ?>"><?php esc_html_e( 'Back to Job Series', 'tekseries-blocks' ); ?></a>
				<?php endif; ?>
			</p>
		</div>
	</div>
</div>
<?php
// Other plugins may still change the message through WP Job Manager's filter.
echo apply_filters( 'job_manager_job_submitted_content', ob_get_clean(), $tekseries_job ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above; filtered content is trusted plugin output, as in WP Job Manager.

do_action( 'job_manager_job_submitted_content_after', sanitize_title( $tekseries_job->post_status ), $tekseries_job );
