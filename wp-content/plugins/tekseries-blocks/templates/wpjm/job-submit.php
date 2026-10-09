<?php
/**
 * Submit a job, step 1 (WP Job Manager template override): the steps aside
 * beside either the sign-in card (visitors) or the form, its fields grouped in
 * a "Job details" and a "Company details" card. WP Job Manager also uses this
 * template for editing a published job from the dashboard, without the steps.
 *
 * The form may use jQuery (WP Job Manager's editor, category select and logo
 * upload need it).
 *
 * @package TekSeries
 *
 * @var string $form               Form name: "submit-job" or "edit-job".
 * @var string $action             Form action URL.
 * @var int    $job_id             Job being edited, or 0.
 * @var string $step               Current step key.
 * @var array  $job_fields         Job fields.
 * @var array  $company_fields     Company fields.
 * @var string $submit_button_text "Preview", or "Save changes" when editing.
 * @var bool   $can_continue_later Whether "Save draft" is offered.
 * @var string $resume_edit        Key of a submission being resumed, if any.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_style( 'tekseries-blocks-job-submit' );

$tekseries_captcha  = WP_Job_Manager\WP_Job_Manager_Recaptcha::instance()->get_recaptcha_version();
$tekseries_editing  = 'edit-job' === $form;
$tekseries_can_post = job_manager_user_can_post_job() || job_manager_user_can_edit_job( $job_id );

// [ heading, subtitle, icon, fields ] for each card.
$tekseries_sections = array(
	'job'     => array( __( 'Job details', 'tekseries-blocks' ), __( 'What the role is and how to apply.', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'work' ), $job_fields ),
	'company' => array( __( 'Company details', 'tekseries-blocks' ), __( 'Shown on the listing so applicants know who is hiring.', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'apartment' ), $company_fields ),
);
?>
<div class="ts-submit<?php echo $tekseries_editing ? ' ts-submit--edit' : ''; ?>">
	<?php
	if ( ! $tekseries_editing ) {
		tekseries_blocks_submit_steps( 1 );
	}
	?>
	<form action="<?php echo esc_url( $action ); ?>" method="post" id="submit-job-form" class="job-manager-form ts-submit__main" enctype="multipart/form-data">
		<?php if ( ! empty( $resume_edit ) ) : ?>
			<p class="ts-submit-status" role="status">
				<?php echo tekseries_blocks_icon_svg( 'edit_note' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<span>
					<?php esc_html_e( 'You are editing a job you started earlier.', 'tekseries-blocks' ); ?>
					<?php
					$tekseries_new = add_query_arg(
						array(
							'job_manager_form' => 'submit-job',
							'new'              => 1,
							'key'              => $resume_edit,
						)
					);
					?>
					<a href="<?php echo esc_url( $tekseries_new ); ?>"><?php esc_html_e( 'Start a new job instead', 'tekseries-blocks' ); ?></a>
				</span>
			</p>
		<?php endif; ?>

		<?php do_action( 'submit_job_form_start' ); ?>

		<?php
		if ( apply_filters( 'submit_job_form_show_signin', true ) ) {
			get_job_manager_template( 'account-signin.php' );
		}
		?>

		<?php if ( $tekseries_can_post ) : ?>
			<?php foreach ( $tekseries_sections as $tekseries_section => [ $tekseries_heading, $tekseries_subtitle, $tekseries_icon, $tekseries_fields ] ) : ?>
				<?php
				if ( ! $tekseries_fields ) {
					continue;
				}
				?>
				<section class="ts-submit-card ts-submit-card--<?php echo esc_attr( $tekseries_section ); ?>" aria-labelledby="ts-submit-<?php echo esc_attr( $tekseries_section ); ?>">
					<div class="ts-submit-card__head">
						<span class="ts-submit-card__icon" aria-hidden="true"><?php echo $tekseries_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
						<div>
							<h2 id="ts-submit-<?php echo esc_attr( $tekseries_section ); ?>"><?php echo esc_html( $tekseries_heading ); ?></h2>
							<p><?php echo esc_html( $tekseries_subtitle ); ?></p>
						</div>
					</div>
					<div class="ts-submit-fields">
						<?php do_action( "submit_job_form_{$tekseries_section}_fields_start" ); ?>
						<?php foreach ( $tekseries_fields as $tekseries_key => $tekseries_field ) : ?>
							<fieldset class="fieldset-<?php echo esc_attr( $tekseries_key ); ?> fieldset-type-<?php echo esc_attr( $tekseries_field['type'] ); ?>">
								<label for="<?php echo esc_attr( $tekseries_key ); ?>"><?php echo wp_kses_post( $tekseries_field['label'] ) . wp_kses_post( apply_filters( 'submit_job_form_required_label', $tekseries_field['required'] ? '' : ' <small>' . __( '(optional)', 'tekseries-blocks' ) . '</small>', $tekseries_field ) ); ?></label>
								<div class="field <?php echo $tekseries_field['required'] ? 'required-field' : ''; ?>">
									<?php
									get_job_manager_template(
										'form-fields/' . $tekseries_field['type'] . '-field.php',
										array(
											'key'   => $tekseries_key,
											'field' => $tekseries_field,
										)
									);
									?>
								</div>
							</fieldset>
						<?php endforeach; ?>
						<?php do_action( "submit_job_form_{$tekseries_section}_fields_end" ); ?>
					</div>
				</section>
			<?php endforeach; ?>

			<?php do_action( 'submit_job_form_end' ); ?>

			<div class="ts-submit-actions">
				<input type="hidden" name="job_manager_form" value="<?php echo esc_attr( $form ); ?>" />
				<input type="hidden" name="job_id" value="<?php echo esc_attr( $job_id ); ?>" />
				<input type="hidden" name="step" value="<?php echo esc_attr( $step ); ?>" />
				<button type="submit" name="submit_job" class="ts-job-button" value="<?php echo esc_attr( $submit_button_text ); ?>"<?php echo 'v3' === $tekseries_captcha ? ' onclick="jm_job_submit_click(event)"' : ''; ?>>
					<?php echo $tekseries_editing ? tekseries_blocks_icon_svg( 'check' ) : tekseries_blocks_icon_svg( 'visibility' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					<?php echo esc_html( $submit_button_text ); ?>
				</button>
				<?php if ( ! empty( $can_continue_later ) ) : ?>
					<button type="submit" name="save_draft" class="ts-job-button ts-job-button--outline save_draft" value="<?php esc_attr_e( 'Save draft', 'tekseries-blocks' ); ?>" formnovalidate>
						<?php echo tekseries_blocks_icon_svg( 'bookmark' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<?php esc_html_e( 'Save draft', 'tekseries-blocks' ); ?>
					</button>
				<?php endif; ?>
				<p class="ts-submit-actions__legend"><span aria-hidden="true">*</span> <?php esc_html_e( 'Required', 'tekseries-blocks' ); ?></p>
			</div>
		<?php else : ?>
			<?php do_action( 'submit_job_form_disabled' ); ?>
		<?php endif; ?>
	</form>
</div>
