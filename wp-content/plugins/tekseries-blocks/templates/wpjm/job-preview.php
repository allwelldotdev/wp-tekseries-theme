<?php
/**
 * Submit a job, step 2 (WP Job Manager template override): the steps aside
 * beside the listing as it will appear, under a plum bar with "Edit listing"
 * and "Submit listing". The body is the single job's (content-single-job_listing.php).
 *
 * @package TekSeries
 *
 * @var WP_Job_Manager_Form_Submit_Job $form Submission form.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_style( 'tekseries-blocks-job-submit' );
?>
<div class="ts-submit">
	<?php tekseries_blocks_submit_steps( 2 ); ?>
	<form method="post" id="job_preview" class="ts-submit__main ts-preview" action="<?php echo esc_url( $form->get_action() ); ?>">
		<?php do_action( 'preview_job_form_start' ); ?>
		<div class="job_listing_preview_title ts-preview__bar">
			<p class="ts-preview__label">
				<?php echo tekseries_blocks_icon_svg( 'visibility' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php esc_html_e( 'Preview', 'tekseries-blocks' ); ?>
			</p>
			<div class="ts-preview__actions">
				<?php if ( ! WP_Job_Manager_Helper_Renewals::is_renew_action() ) : ?>
					<button type="submit" name="edit_job" class="ts-job-button ts-job-button--glass job-manager-button-edit-listing" value="<?php esc_attr_e( 'Edit listing', 'tekseries-blocks' ); ?>">
						<?php echo tekseries_blocks_icon_svg( 'edit' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<?php esc_html_e( 'Edit listing', 'tekseries-blocks' ); ?>
					</button>
				<?php endif; ?>
				<?php $tekseries_submit = apply_filters( 'submit_job_step_preview_submit_text', __( 'Submit listing', 'tekseries-blocks' ) ); ?>
				<button type="submit" name="continue" id="job_preview_submit_button" class="ts-job-button ts-job-button--accent job-manager-button-submit-listing" value="<?php echo esc_attr( $tekseries_submit ); ?>">
					<?php echo esc_html( $tekseries_submit ); ?>
					<?php echo tekseries_blocks_icon_svg( 'send' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				</button>
			</div>
		</div>
		<div class="job_listing_preview single_job_listing ts-preview__body">
			<h2 class="ts-preview__title"><?php wpjm_the_job_title(); ?></h2>
			<?php get_job_manager_template_part( 'content-single', \WP_Job_Manager_Post_Types::PT_LISTING ); ?>
			<input type="hidden" name="job_id" value="<?php echo esc_attr( $form->get_job_id() ); ?>" />
			<input type="hidden" name="step" value="<?php echo esc_attr( $form->get_step() ); ?>" />
			<input type="hidden" name="job_manager_form" value="<?php echo esc_attr( $form->get_form_name() ); ?>" />
		</div>
		<?php do_action( 'preview_job_form_end' ); ?>
	</form>
</div>
