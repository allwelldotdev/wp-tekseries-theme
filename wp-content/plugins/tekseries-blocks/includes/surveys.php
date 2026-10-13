<?php
/**
 * Forms from Formbricks, opened over the page by a button.
 *
 * A Button with the class "ts-survey-<key>" opens the Formbricks "Website &
 * App" survey whose trigger is the code action <key>, instead of following
 * its link. The link stays the way without JavaScript and when Formbricks
 * cannot be reached. Formbricks' own script is fetched only when a visitor
 * reaches for such a button (src/surveys/view.ts).
 *
 * Settings, Forms (Formbricks) holds the address of the Formbricks server and
 * the ID it knows this site by. Until both are set the buttons are plain links.
 * The script hands the ID to Formbricks under both names it has had for it
 * (environmentId, workspaceId), so the site need not know the server's version.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Returns the Formbricks settings.
 *
 * @return array{url: string, id: string}
 */
function tekseries_blocks_formbricks_settings(): array {
	$saved = get_option( 'tekseries_blocks_formbricks', array() );
	$saved = is_array( $saved ) ? $saved : array();

	return array(
		'url' => (string) ( $saved['url'] ?? '' ),
		'id'  => (string) ( $saved['id'] ?? '' ),
	);
}

/**
 * Tells whether both the server address and the ID are set.
 *
 * @return bool
 */
function tekseries_blocks_formbricks_ready(): bool {
	$settings = tekseries_blocks_formbricks_settings();
	return '' !== $settings['url'] && '' !== $settings['id'];
}

/**
 * Cleans the settings as they are saved. The address must be an https one:
 * a browser would not load a script from anything else on this site.
 *
 * @param mixed $value Submitted value.
 * @return array{url: string, id: string}
 */
function tekseries_blocks_sanitize_formbricks( $value ): array {
	$value = is_array( $value ) ? $value : array();
	$typed = trim( (string) ( $value['url'] ?? '' ) );
	$url   = untrailingslashit( (string) strtok( esc_url_raw( $typed, array( 'https' ) ), '?#' ) );
	if ( '' !== $typed && '' === $url ) {
		add_settings_error( 'tekseries_blocks_formbricks', 'url', __( 'The SDK connection URL was not saved: it must start with https://.', 'tekseries-blocks' ) );
	}

	return array(
		'url' => $url,
		'id'  => (string) preg_replace( '/[^A-Za-z0-9_-]/', '', (string) ( $value['id'] ?? '' ) ),
	);
}

/**
 * Registers the setting and the script that opens the forms.
 */
function tekseries_blocks_register_surveys(): void {
	register_setting(
		'tekseries_blocks_forms',
		'tekseries_blocks_formbricks',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'tekseries_blocks_sanitize_formbricks',
			'default'           => array(),
			'show_in_rest'      => false,
		)
	);

	$asset_file = dirname( __DIR__ ) . '/build/surveys/view.asset.php';
	if ( file_exists( $asset_file ) ) {
		$asset = require $asset_file;
		wp_register_script_module( 'tekseries-blocks-surveys', plugins_url( 'build/surveys/view.js', __DIR__ ), $asset['dependencies'], $asset['version'] );
	}
}
add_action( 'init', 'tekseries_blocks_register_surveys' );

/**
 * Adds Settings, Forms (Formbricks).
 */
function tekseries_blocks_surveys_menu(): void {
	add_options_page(
		__( 'Forms (Formbricks)', 'tekseries-blocks' ),
		__( 'Forms (Formbricks)', 'tekseries-blocks' ),
		'manage_options',
		'tekseries-forms',
		'tekseries_blocks_surveys_page'
	);
}
add_action( 'admin_menu', 'tekseries_blocks_surveys_menu' );

/**
 * Prints the settings screen.
 */
function tekseries_blocks_surveys_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$settings = tekseries_blocks_formbricks_settings();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Forms (Formbricks)', 'tekseries-blocks' ); ?></h1>
		<p>
			<?php esc_html_e( 'A button on the site can open a Formbricks form over the page, for example “Upload your CV”. This screen connects the site to your Formbricks.', 'tekseries-blocks' ); ?>
			<strong><?php echo esc_html( tekseries_blocks_formbricks_ready() ? __( 'Connected: marked buttons open their form.', 'tekseries-blocks' ) : __( 'Not connected yet: marked buttons are ordinary links.', 'tekseries-blocks' ) ); ?></strong>
		</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'tekseries_blocks_forms' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><label for="tekseries-formbricks-url"><?php esc_html_e( 'SDK connection URL', 'tekseries-blocks' ); ?></label></th>
					<td>
						<input type="url" class="regular-text code" id="tekseries-formbricks-url" name="tekseries_blocks_formbricks[url]" value="<?php echo esc_attr( $settings['url'] ); ?>" placeholder="https://" aria-describedby="tekseries-formbricks-url-help" />
						<p class="description" id="tekseries-formbricks-url-help"><?php esc_html_e( 'The address of your Formbricks, as it stands in the code Formbricks gives you for connecting a website (appUrl). It starts with https://.', 'tekseries-blocks' ); ?></p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="tekseries-formbricks-id"><?php esc_html_e( 'ID', 'tekseries-blocks' ); ?></label></th>
					<td>
						<input type="text" class="regular-text code" id="tekseries-formbricks-id" name="tekseries_blocks_formbricks[id]" value="<?php echo esc_attr( $settings['id'] ); ?>" autocomplete="off" spellcheck="false" aria-describedby="tekseries-formbricks-id-help" />
						<p class="description" id="tekseries-formbricks-id-help"><?php esc_html_e( 'The ID in that same code: the value of environmentId (a newer Formbricks calls it workspaceId). Where Formbricks lists both an Environment ID and a Workspace ID, as version 4 does, use the Environment ID.', 'tekseries-blocks' ); ?></p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>

		<h2><?php esc_html_e( 'Make a button open a form', 'tekseries-blocks' ); ?></h2>
		<ol>
			<li><?php esc_html_e( 'In Formbricks, add an action of the kind “Code” and give it a key in small letters, numbers and hyphens, for example upload-cv.', 'tekseries-blocks' ); ?></li>
			<li><?php esc_html_e( 'In the form’s settings in Formbricks, set Survey Type to “Website & App Survey” and add that action as its Survey Trigger. Under Visibility & Recontact choose “Keep showing while conditions match” and “Ignore Cooldown Period”, so the form opens every time the button is pressed. Then publish the form.', 'tekseries-blocks' ); ?></li>
			<li><?php esc_html_e( 'On the site, select the Button in the editor and, under Advanced, Additional CSS class(es), add ts-survey- followed by the key, for example ts-survey-upload-cv.', 'tekseries-blocks' ); ?></li>
			<li><?php esc_html_e( 'Give the Button a link as well. Visitors follow it when their browser has JavaScript off, cannot reach Formbricks, or gets no form within a few seconds.', 'tekseries-blocks' ); ?></li>
		</ol>
		<p><?php esc_html_e( 'The site’s “Upload your CV” buttons use the key upload-cv, and “Apply for the Maker’s Prize” uses makers-prize.', 'tekseries-blocks' ); ?></p>
	</div>
	<?php
}

/**
 * Returns the attributes that make a link open the form of an action, and
 * loads the script on this page. Empty until Formbricks is connected.
 *
 * @param string $action Key of the Formbricks code action.
 * @return array<string, string>
 */
function tekseries_blocks_survey_attributes( string $action ): array {
	if ( '' === $action || ! tekseries_blocks_formbricks_ready() ) {
		return array();
	}

	$settings = tekseries_blocks_formbricks_settings();
	wp_interactivity_config(
		'tekseries/surveys',
		array(
			'url' => $settings['url'],
			'id'  => $settings['id'],
		)
	);
	wp_enqueue_script_module( 'tekseries-blocks-surveys' );

	return array(
		'data-wp-interactive'            => 'tekseries/surveys',
		'data-wp-context'                => (string) wp_json_encode( array( 'action' => $action ), JSON_HEX_TAG | JSON_HEX_AMP ),
		'data-wp-on--click'              => 'actions.open',
		'data-wp-on-async--pointerenter' => 'actions.warm',
		'data-wp-on-async--focus'        => 'actions.warm',
	);
}

/**
 * Makes the link of a block with the class "ts-survey-<key>" open that form.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function tekseries_blocks_survey_link( $content, $block ) {
	$class = $block['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! preg_match( '/(?:^|\s)ts-survey-([a-z0-9][a-z0-9_-]*)(?:\s|$)/', $class, $found ) ) {
		return $content;
	}

	$tags = new WP_HTML_Tag_Processor( (string) $content );
	if ( ! $tags->next_tag( 'a' ) ) {
		return $content;
	}

	$attributes = tekseries_blocks_survey_attributes( $found[1] );
	foreach ( $attributes as $name => $value ) {
		$tags->set_attribute( $name, $value );
	}
	return $attributes ? $tags->get_updated_html() : $content;
}
add_filter( 'render_block', 'tekseries_blocks_survey_link', 10, 2 );
