<?php
/**
 * Account on the submission form (WP Job Manager template override). Signed
 * in: a bar with the account's initial, name and "Sign out". Signed out: the
 * sign-in card beside "How posting works", then WP Job Manager's registration
 * fields when registration is on.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( is_user_logged_in() ) :
	$tekseries_user = wp_get_current_user();
	?>
	<div class="fieldset-logged_in ts-submit-account">
		<span class="ts-submit-account__avatar" aria-hidden="true"><?php echo esc_html( strtoupper( mb_substr( '' !== $tekseries_user->display_name ? $tekseries_user->display_name : $tekseries_user->user_login, 0, 1 ) ) ); ?></span>
		<p>
			<?php
			/* translators: %s: the signed-in user's name, in bold. */
			echo wp_kses_post( sprintf( __( 'You are currently signed in as %s.', 'tekseries-blocks' ), '<strong>' . esc_html( $tekseries_user->user_login ) . '</strong>' ) );
			?>
		</p>
		<a class="ts-submit-account__out" href="<?php echo esc_url( apply_filters( 'submit_job_form_logout_url', wp_logout_url( get_permalink() ) ) ); ?>">
			<?php echo tekseries_blocks_icon_svg( 'logout' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<?php esc_html_e( 'Sign out', 'tekseries-blocks' ); ?>
		</a>
	</div>
	<?php
	return;
endif;

$tekseries_registration = job_manager_enable_registration();
$tekseries_fields       = wpjm_get_registration_fields();
$tekseries_steps        = array(
	array( __( 'Fill in the job details', 'tekseries-blocks' ), __( 'Title, type, description, how to apply and your company.', 'tekseries-blocks' ) ),
	array( __( 'Preview your listing', 'tekseries-blocks' ), __( 'Check how it will look on Job Series, then edit anything you need.', 'tekseries-blocks' ) ),
	array( __( 'Submit', 'tekseries-blocks' ), __( 'Send it in, or save a draft and finish later from your job dashboard.', 'tekseries-blocks' ) ),
);
?>
<div class="fieldset-login_required ts-signin">
	<div class="account-sign-in ts-signin__card">
		<span class="ts-submit-card__icon" aria-hidden="true"><?php echo tekseries_blocks_icon_svg( 'key' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
		<h2><?php esc_html_e( 'Have an account?', 'tekseries-blocks' ); ?></h2>
		<p>
			<?php
			echo $tekseries_registration
				? esc_html__( 'Sign in, or create an account below with your email address.', 'tekseries-blocks' )
				: wp_kses_post( apply_filters( 'submit_job_form_login_required_message', __( 'You must sign in to create a new listing.', 'tekseries-blocks' ) ) );
			?>
		</p>
		<a class="ts-job-button" href="<?php echo esc_url( apply_filters( 'submit_job_form_login_url', wp_login_url( get_permalink() ) ) ); ?>">
			<?php echo tekseries_blocks_icon_svg( 'login' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<?php esc_html_e( 'Sign in', 'tekseries-blocks' ); ?>
		</a>
		<p class="ts-signin__help"><?php esc_html_e( 'Signs you in to your TekSeries account, then brings you back here.', 'tekseries-blocks' ); ?></p>
		<?php if ( ! $tekseries_registration ) : ?>
			<p class="ts-signin__help">
				<?php
				/* translators: %s: link to the contact page. */
				echo wp_kses_post( sprintf( __( 'No account yet? %s to get an employer account.', 'tekseries-blocks' ), '<a href="' . esc_url( home_url( '/contact/#contact-form' ) ) . '">' . esc_html__( 'Contact us', 'tekseries-blocks' ) . '</a>' ) );
				?>
			</p>
		<?php endif; ?>
	</div>
	<div class="ts-signin__how">
		<p class="ts-job-eyebrow"><?php esc_html_e( 'How posting works', 'tekseries-blocks' ); ?></p>
		<ol>
			<?php foreach ( $tekseries_steps as [ $tekseries_title, $tekseries_text ] ) : ?>
				<li><strong><?php echo esc_html( $tekseries_title ); ?></strong> <span><?php echo esc_html( $tekseries_text ); ?></span></li>
			<?php endforeach; ?>
		</ol>
	</div>
</div>
<?php if ( $tekseries_registration ) : ?>
	<?php foreach ( $tekseries_fields as $tekseries_key => $tekseries_field ) : ?>
		<fieldset class="fieldset-<?php echo esc_attr( $tekseries_key ); ?>">
			<label for="<?php echo esc_attr( $tekseries_key ); ?>"><?php echo esc_html( $tekseries_field['label'] ) . wp_kses_post( apply_filters( 'submit_job_form_required_label', $tekseries_field['required'] ? '' : ' <small>' . __( '(optional)', 'tekseries-blocks' ) . '</small>', $tekseries_field ) ); ?></label>
			<div class="field <?php echo $tekseries_field['required'] ? 'required-field draft-required' : ''; ?>">
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
	<?php do_action( 'job_manager_register_form' ); ?>
<?php endif; ?>
