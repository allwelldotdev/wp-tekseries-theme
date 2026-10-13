<?php
/**
 * Event fields and news post video fields (ACF).
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
 * Registers the Events field group: date, time, start time, venue and the call
 * to action.
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
			'key'            => 'field_tekseries_start_time',
			'label'          => __( 'Start time', 'tekseries-blocks' ),
			'name'           => 'start_time',
			'type'           => 'time_picker',
			'instructions'   => __( 'When the event starts, in Nigerian time (WAT). The countdown on the event counts down to it. Leave it empty and the countdown shows days only.', 'tekseries-blocks' ),
			'display_format' => 'g:i a',
			'return_format'  => 'H:i:s',
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

/**
 * Registers the "Video" fields of news posts: a switch, then a video file or
 * a YouTube or Vimeo link, and a thumbnail. The Post Video block shows them
 * (includes/post-video.php).
 */
function tekseries_blocks_register_post_video_fields(): void {
	// The file, the link and the thumbnail show once the switch is on.
	$shown = array(
		array(
			array(
				'field'    => 'field_tekseries_video',
				'operator' => '==',
				'value'    => '1',
			),
		),
	);

	acf_add_local_field_group(
		array(
			'key'                   => 'group_tekseries_post_video',
			'title'                 => __( 'Video', 'tekseries-blocks' ),
			'fields'                => array(
				array(
					'key'          => 'field_tekseries_video',
					'label'        => __( 'Show a video', 'tekseries-blocks' ),
					'name'         => 'tekseries_video',
					'type'         => 'true_false',
					'instructions' => __( 'Adds a "Watch the video" card under the post. Visitors open the video without leaving the page.', 'tekseries-blocks' ),
					'ui'           => 1,
				),
				array(
					'key'               => 'field_tekseries_video_file',
					'label'             => __( 'Video file', 'tekseries-blocks' ),
					'name'              => 'tekseries_video_file',
					'type'              => 'file',
					'instructions'      => __( 'A video from the Media Library. It is used before the link when both are set.', 'tekseries-blocks' ),
					'return_format'     => 'id',
					'library'           => 'all',
					'mime_types'        => 'mp4, m4v, webm, mov, ogv',
					'conditional_logic' => $shown,
				),
				array(
					'key'               => 'field_tekseries_video_link',
					'label'             => __( 'Video link', 'tekseries-blocks' ),
					'name'              => 'tekseries_video_link',
					'type'              => 'url',
					'instructions'      => __( 'Or the address of a YouTube or Vimeo video, e.g. https://www.youtube.com/watch?v=… Other sites are not shown.', 'tekseries-blocks' ),
					'conditional_logic' => $shown,
				),
				array(
					'key'               => 'field_tekseries_video_thumbnail',
					'label'             => __( 'Thumbnail', 'tekseries-blocks' ),
					'name'              => 'tekseries_video_thumbnail',
					'type'              => 'image',
					'instructions'      => __( 'The picture on the card. Without one, a video file shows its own poster, and a link shows a plain card.', 'tekseries-blocks' ),
					'return_format'     => 'id',
					'preview_size'      => 'medium',
					'library'           => 'all',
					'conditional_logic' => $shown,
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'post',
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
add_action( 'acf/include_fields', 'tekseries_blocks_register_post_video_fields' );

/**
 * Adapts bound ACF values to the blocks that show them.
 *
 * ACF binds the formatted value. A Date block bound to a date field gets an
 * ISO date in the site's time zone instead of "September 26, 2026": that keeps
 * `<time datetime>` valid and lets the block's own format apply. A link field
 * bound to text shows its address without the scheme, e.g. "bit.ly/WomEngineers".
 *
 * @param mixed    $value          Bound value from ACF.
 * @param array    $source_args    Binding arguments; `key` is the field name or key.
 * @param WP_Block $block          Block being rendered. Unused.
 * @param string   $attribute_name Bound attribute.
 * @return mixed
 */
function tekseries_blocks_acf_binding_value( $value, $source_args, $block, $attribute_name ) {
	$key   = is_array( $source_args ) && isset( $source_args['key'] ) ? (string) $source_args['key'] : '';
	$field = '' === $key ? false : get_field_object( $key, false, false );
	if ( ! is_array( $field ) ) {
		return $value;
	}

	if ( 'date_picker' === $field['type'] && 'datetime' === $attribute_name ) {
		$date = tekseries_blocks_parse_ymd( (string) $field['value'] );
		return $date ? $date->format( DATE_ATOM ) : '';
	}

	if ( 'link' === $field['type'] && 'content' === $attribute_name && is_string( $value ) ) {
		return (string) preg_replace( '#^[a-z]+:(//)?(www\.)?#i', '', $value );
	}

	return $value;
}
add_filter( 'acf/blocks/binding_value', 'tekseries_blocks_acf_binding_value', 10, 4 );
