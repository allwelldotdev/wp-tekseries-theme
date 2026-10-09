<?php
/**
 * The job submission form (WP Job Manager's [submit_job_form]).
 *
 * The form's markup comes from this plugin's templates (job-submit.php,
 * account-signin.php, job-preview.php, job-submitted.php); the fields keep WP
 * Job Manager's definitions, with the design's labels, placeholders and help.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the submission screens' styles; their templates enqueue them.
 */
function tekseries_blocks_register_job_submit_style(): void {
	$version = (string) filemtime( dirname( __DIR__ ) . '/assets/css/job-submit.css' );
	wp_register_style( 'tekseries-blocks-job-submit', plugins_url( 'assets/css/job-submit.css', __DIR__ ), array( 'tekseries-blocks-job' ), $version );
}
add_action( 'init', 'tekseries_blocks_register_job_submit_style' );

/**
 * Prints the submission steps (Job details, Preview, Submitted) and, beside
 * the form, tips for a good listing.
 *
 * @param int $current Current step, 1 to 3.
 */
function tekseries_blocks_submit_steps( int $current ): void {
	$steps = array(
		1 => __( 'Job details', 'tekseries-blocks' ),
		2 => __( 'Preview', 'tekseries-blocks' ),
		3 => __( 'Submitted', 'tekseries-blocks' ),
	);
	$tips  = array(
		__( 'Use a clear, specific job title.', 'tekseries-blocks' ),
		__( 'List responsibilities and requirements as bullet points.', 'tekseries-blocks' ),
		__( 'Add a salary: listings with pay get more applicants.', 'tekseries-blocks' ),
	);
	?>
	<div class="ts-submit__aside">
		<ol class="ts-steps" aria-label="<?php esc_attr_e( 'Submission steps', 'tekseries-blocks' ); ?>">
			<?php foreach ( $steps as $number => $label ) : ?>
				<?php $state = $number < $current ? 'done' : ( $number === $current ? 'current' : 'next' ); ?>
				<li class="ts-steps__step is-<?php echo esc_attr( $state ); ?>"<?php echo 'current' === $state ? ' aria-current="step"' : ''; ?>>
					<span class="ts-steps__dot" aria-hidden="true">
						<?php echo 'done' === $state ? tekseries_blocks_icon_svg( 'check' ) : esc_html( (string) $number ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					</span>
					<?php echo esc_html( $label ); ?>
					<?php if ( 'done' === $state ) : ?>
						<span class="screen-reader-text"><?php esc_html_e( '(done)', 'tekseries-blocks' ); ?></span>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ol>
		<?php if ( 1 === $current ) : ?>
			<div class="ts-submit-tips">
				<p class="ts-submit-tips__title"><?php esc_html_e( 'Tips for a great listing', 'tekseries-blocks' ); ?></p>
				<ul>
					<?php foreach ( $tips as $tip ) : ?>
						<li><?php echo tekseries_blocks_icon_svg( 'check_circle' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?><?php echo esc_html( $tip ); ?></li>
					<?php endforeach; ?>
				</ul>
			</div>
		<?php endif; ?>
	</div>
	<?php
}

/**
 * Gives the submission fields the design's labels, placeholders and help, and
 * makes the category optional (imported jobs all sit in one category).
 *
 * @param array $fields Fields by group ("job", "company"), then by key.
 * @return array
 */
function tekseries_blocks_job_submit_fields( $fields ) {
	$changes = array(
		'job'     => array(
			'job_title'           => array(
				'label'       => __( 'Job title', 'tekseries-blocks' ),
				'placeholder' => __( 'e.g. Junior Frontend Developer', 'tekseries-blocks' ),
			),
			'remote_position'     => array( 'label' => __( 'Remote position', 'tekseries-blocks' ) ),
			'job_category'        => array( 'required' => false ),
			'job_description'     => array( 'label' => __( 'Description', 'tekseries-blocks' ) ),
			'application'         => array( 'description' => __( 'Where applicants apply. An email opens their mail app; a URL opens your application page.', 'tekseries-blocks' ) ),
			'job_salary_currency' => array(
				'label'       => __( 'Salary currency', 'tekseries-blocks' ),
				/* translators: %s: default currency code, e.g. NGN. */
				'description' => sprintf( __( 'Leave it empty to use the default salary currency (%s).', 'tekseries-blocks' ), (string) get_option( 'job_manager_default_salary_currency', 'USD' ) ),
			),
			'job_salary_unit'     => array(
				'label'       => __( 'Salary unit', 'tekseries-blocks' ),
				'description' => __( 'Leave it empty to use the default salary unit, if one is defined.', 'tekseries-blocks' ),
			),
		),
		'company' => array(
			'company_name'    => array( 'placeholder' => __( 'Your company or organisation', 'tekseries-blocks' ) ),
			'company_website' => array( 'placeholder' => 'https://' ),
		),
	);
	foreach ( $changes as $group => $keys ) {
		foreach ( $keys as $key => $change ) {
			if ( isset( $fields[ $group ][ $key ] ) ) {
				$fields[ $group ][ $key ] = array_merge( $fields[ $group ][ $key ], $change );
			}
		}
	}
	return $fields;
}
add_filter( 'submit_job_form_fields', 'tekseries_blocks_job_submit_fields' );

/**
 * Marks required fields with a star (the design); optional ones keep
 * "(optional)".
 *
 * @param string $label Text after the field label.
 * @param array  $field Field definition.
 * @return string
 */
function tekseries_blocks_job_submit_required_label( $label, $field ) {
	return empty( $field['required'] ) ? $label : ' <span class="ts-required" aria-hidden="true">*</span>';
}
add_filter( 'submit_job_form_required_label', 'tekseries_blocks_job_submit_required_label', 10, 2 );
