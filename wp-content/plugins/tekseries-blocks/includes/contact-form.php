<?php
/**
 * Contact form: the Subject field's hint follows the topic the visitor picks.
 *
 * The form is a Fluent Forms form with a "topic" choice and a "subject" text
 * field. The server sets the hint for the topic the form starts on (the one
 * a link asked for with ?topic=); the script follows the visitor's choice.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The Subject hint for each topic, keyed by the topic's value in the form.
 * A topic without a hint shows the form's own placeholder.
 *
 * @return array<string, string>
 */
function tekseries_blocks_contact_subject_hints(): array {
	$hints = array(
		'general'  => __( 'How can we help?', 'tekseries-blocks' ),
		'workshop' => __( 'e.g. Joining the next Eziama boot camp', 'tekseries-blocks' ),
		'jobs'     => __( 'e.g. Posting an internship', 'tekseries-blocks' ),
		'support'  => __( 'e.g. Sponsoring a workshop', 'tekseries-blocks' ),
	);

	/**
	 * Filters the Subject hints of the contact form.
	 *
	 * @param array<string, string> $hints Hint text keyed by topic value.
	 */
	$hints = apply_filters( 'tekseries_blocks_contact_subject_hints', $hints );

	return is_array( $hints ) ? array_filter( array_map( 'strval', $hints ), 'strlen' ) : array();
}

/**
 * Registers the script that changes the hint when the topic changes.
 */
function tekseries_blocks_register_contact_form(): void {
	$asset_file = dirname( __DIR__ ) . '/build/contact-form/view.asset.php';
	if ( ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	wp_register_script_module( 'tekseries-blocks-contact-form', plugins_url( 'build/contact-form/view.js', __DIR__ ), $asset['dependencies'], $asset['version'] );
}
add_action( 'init', 'tekseries_blocks_register_contact_form' );

/**
 * Sets the Subject hint for the topic the form starts on and hands the form
 * to the script. A form without both fields is left as it is.
 *
 * Only the form tag gets directives. Fluent Forms changes the fields with its
 * own script, so nothing inside the form is bound to state.
 *
 * @param string $content Rendered Fluent Forms block.
 * @return string
 */
function tekseries_blocks_contact_form_hint( $content ) {
	$content = (string) $content;
	$hints   = tekseries_blocks_contact_subject_hints();
	if ( ! $hints ) {
		return $content;
	}

	// The topic the form starts on: Fluent Forms has already checked it.
	$topic  = null;
	$topics = false;
	$tags   = new WP_HTML_Tag_Processor( $content );
	while ( $tags->next_tag( 'input' ) ) {
		if ( 'topic' !== $tags->get_attribute( 'name' ) ) {
			continue;
		}
		$topics = true;
		if ( null !== $tags->get_attribute( 'checked' ) ) {
			$topic = (string) $tags->get_attribute( 'value' );
			break;
		}
	}
	if ( ! $topics ) {
		return $content;
	}

	$tags = new WP_HTML_Tag_Processor( $content );
	if ( ! $tags->next_tag( 'form' ) ) {
		return $content;
	}
	$tags->set_bookmark( 'form' );

	$found = false;
	while ( $tags->next_tag( 'input' ) ) {
		if ( 'subject' !== $tags->get_attribute( 'name' ) ) {
			continue;
		}
		$found = true;
		$own   = (string) $tags->get_attribute( 'placeholder' );
		if ( null !== $topic && isset( $hints[ $topic ] ) ) {
			$tags->set_attribute( 'placeholder', $hints[ $topic ] );
		}
		break;
	}
	if ( ! $found ) {
		return $content;
	}

	$tags->seek( 'form' );
	$tags->set_attribute( 'data-wp-interactive', 'tekseries/contact-form' );
	$tags->set_attribute( 'data-wp-context', (string) wp_json_encode( array( 'placeholder' => $own ), JSON_HEX_TAG | JSON_HEX_AMP ) );
	$tags->set_attribute( 'data-wp-on--change', 'actions.hint' );
	$tags->set_attribute( 'data-wp-on--reset', 'actions.reset' );

	wp_interactivity_state( 'tekseries/contact-form', array( 'hints' => $hints ) );
	wp_enqueue_script_module( 'tekseries-blocks-contact-form' );

	return $tags->get_updated_html();
}
add_filter( 'render_block_fluentfom/guten-block', 'tekseries_blocks_contact_form_hint' );
