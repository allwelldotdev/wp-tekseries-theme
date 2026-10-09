<?php
/**
 * Event fields (ACF).
 *
 * The "Events" field group was created in the ACF admin and stored in the
 * database. It is registered here with the same group and field keys, so the
 * code version replaces the stored one and existing values keep loading. The
 * fields are exposed over REST and to block bindings (`acf/field`), which the
 * event templates use for the date, time, venue and registration button.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the Events field group: date, time, venue and the call to action.
 */
function tekseries_blocks_register_event_fields(): void {
	$fields = array(
		array(
			'key'            => 'field_643e98e75f66a',
			'label'          => __( 'Event Date', 'tekseries-blocks' ),
			'name'           => 'event_date',
			'type'           => 'date_picker',
			'instructions'   => __( 'Input the date when the event starts.', 'tekseries-blocks' ),
			'required'       => 1,
			'display_format' => 'F j, Y',
			'return_format'  => 'F j, Y',
			'first_day'      => 1,
		),
		array(
			'key'          => 'field_tekseries_time_label',
			'label'        => __( 'Time', 'tekseries-blocks' ),
			'name'         => 'time_label',
			'type'         => 'text',
			'instructions' => __( 'Start time with its time zone, as visitors should read it, e.g. "11:00 AM WAT".', 'tekseries-blocks' ),
		),
		array(
			'key'          => 'field_tekseries_venue',
			'label'        => __( 'Venue', 'tekseries-blocks' ),
			'name'         => 'venue',
			'type'         => 'text',
			'instructions' => __( 'Where the event takes place, e.g. "Online (Zoom)".', 'tekseries-blocks' ),
		),
		array(
			'key'           => 'field_643e9990a254f',
			'label'         => __( 'CTA Link', 'tekseries-blocks' ),
			'name'          => 'cta_link',
			'type'          => 'link',
			'instructions'  => __( 'Input the event \'Call To Action\' CTA link, e.g. a webinar registration link, etc.', 'tekseries-blocks' ),
			'required'      => 1,
			'return_format' => 'url',
		),
		array(
			'key'          => 'field_643ea0c117ba0',
			'label'        => __( 'CTA Name', 'tekseries-blocks' ),
			'name'         => 'cta_name',
			'type'         => 'text',
			'instructions' => __( 'Input the \'Call To Action\' link name, e.g. \'Click to register\', \'Send email to register\', etc.', 'tekseries-blocks' ),
			'required'     => 1,
			'append'       => '→',
		),
	);

	acf_add_local_field_group(
		array(
			'key'                   => 'group_643e98e5780ba',
			'title'                 => __( 'Events', 'tekseries-blocks' ),
			// Without this, ACF's binding source returns an empty string for the field.
			'fields'                => array_map( static fn( array $field ): array => $field + array( 'allow_in_bindings' => 1 ), $fields ),
			'location'              => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'event',
					),
				),
			),
			'position'              => 'normal',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'show_in_rest'          => 1,
		)
	);
}
add_action( 'acf/include_fields', 'tekseries_blocks_register_event_fields' );
