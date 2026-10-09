<?php
/**
 * Per-post tone and topic icon.
 *
 * Every event and news post owns a tone (one of four brand colours) and a
 * topic icon. Both are post meta, so a post looks the same on its listing
 * card, in "More events" and on its own banner. The Post Tone block reads
 * them; editors change them in the post sidebar.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lists the post types that carry a tone and a topic icon.
 *
 * @return string[]
 */
function tekseries_blocks_tone_post_types(): array {
	return array( 'event', 'post' );
}

/**
 * Lists the tones in cycle order: each new post takes the tone after the newest one's.
 *
 * @return string[]
 */
function tekseries_blocks_tones(): array {
	return array( 'saffron', 'plum', 'ink', 'lilac' );
}

/**
 * Lists the topic icons editors can pick from: a curated subset of the icon collection.
 *
 * @return string[] Icon names, each registered in tekseries_blocks_icon_labels().
 */
function tekseries_blocks_topic_icons(): array {
	return array(
		'auto_stories',
		'badge',
		'celebration',
		'code',
		'construction',
		'co_present',
		'diversity_3',
		'emoji_events',
		'engineering',
		'event',
		'favorite',
		'forum',
		'groups',
		'handshake',
		'hub',
		'language',
		'lightbulb',
		'newspaper',
		'public',
		'record_voice_over',
		'redeem',
		'rocket_launch',
		'school',
		'smart_toy',
		'travel_explore',
		'trending_up',
		'videocam',
		'volunteer_activism',
		'work',
		'work_history',
	);
}

/**
 * Maps event type slugs to the icon a post shows until an editor picks one.
 *
 * @return array<string, string> Term slug => icon name.
 */
function tekseries_blocks_event_type_icons(): array {
	return array(
		'webinar'      => 'videocam',
		'workshop'     => 'co_present',
		'makers-prize' => 'emoji_events',
	);
}

/**
 * Registers the tone and icon meta on every toned post type, editable over REST.
 */
function tekseries_blocks_register_meta(): void {
	$fields = array(
		'tekseries_tone' => array(
			'description' => __( 'Brand tone that colours the post\'s card and banner.', 'tekseries-blocks' ),
			'enum'        => tekseries_blocks_tones(),
			'sanitize'    => 'tekseries_blocks_sanitize_tone',
		),
		'tekseries_icon' => array(
			'description' => __( 'Topic icon shown on the post\'s card and banner.', 'tekseries-blocks' ),
			'enum'        => tekseries_blocks_topic_icons(),
			'sanitize'    => 'tekseries_blocks_sanitize_icon',
		),
	);

	foreach ( tekseries_blocks_tone_post_types() as $post_type ) {
		foreach ( $fields as $key => $field ) {
			register_post_meta(
				$post_type,
				$key,
				array(
					'type'              => 'string',
					'description'       => $field['description'],
					'single'            => true,
					'default'           => '',
					'sanitize_callback' => $field['sanitize'],
					'auth_callback'     => 'tekseries_blocks_can_edit_meta',
					'show_in_rest'      => array(
						// An empty value means "not chosen": the tone is assigned on publish, the icon follows the event type.
						'schema' => array( 'enum' => array_merge( array( '' ), $field['enum'] ) ),
					),
				)
			);
		}
	}
}
add_action( 'init', 'tekseries_blocks_register_meta' );

/**
 * Exposes the icon a post shows when none is picked, for editor previews.
 */
function tekseries_blocks_register_rest_fields(): void {
	register_rest_field(
		tekseries_blocks_tone_post_types(),
		'tekseries_default_icon',
		array(
			'get_callback' => static fn( array $post ): string => tekseries_blocks_default_icon( (int) $post['id'] ),
			'schema'       => array(
				'description' => __( 'Topic icon the post shows when none is picked.', 'tekseries-blocks' ),
				'type'        => 'string',
				'context'     => array( 'view', 'edit' ),
				'readonly'    => true,
			),
		)
	);
}
add_action( 'rest_api_init', 'tekseries_blocks_register_rest_fields' );

/**
 * Lets anyone who can edit the post change its tone and icon.
 *
 * @param bool   $allowed   Whether the user can add the meta. Unused.
 * @param string $meta_key  Meta key. Unused.
 * @param int    $object_id Post ID.
 * @return bool
 */
function tekseries_blocks_can_edit_meta( $allowed, $meta_key, $object_id ): bool {
	return current_user_can( 'edit_post', (int) $object_id );
}

/**
 * Keeps a tone only if it is one of the four, otherwise stores nothing.
 *
 * @param mixed $value Submitted value.
 * @return string
 */
function tekseries_blocks_sanitize_tone( $value ): string {
	$value = is_string( $value ) ? sanitize_key( $value ) : '';
	return in_array( $value, tekseries_blocks_tones(), true ) ? $value : '';
}

/**
 * Keeps an icon only if it is in the curated topic set, otherwise stores nothing.
 *
 * @param mixed $value Submitted value.
 * @return string
 */
function tekseries_blocks_sanitize_icon( $value ): string {
	$value = is_string( $value ) ? sanitize_key( $value ) : '';
	return in_array( $value, tekseries_blocks_topic_icons(), true ) ? $value : '';
}

/**
 * Returns the post's stored tone, or an empty string if it has none yet.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function tekseries_blocks_stored_tone( int $post_id ): string {
	return tekseries_blocks_sanitize_tone( get_post_meta( $post_id, 'tekseries_tone', true ) );
}

/**
 * Returns the tone to render: the stored one, or plum for a post without one.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function tekseries_blocks_get_tone( int $post_id ): string {
	$tone = $post_id ? tekseries_blocks_stored_tone( $post_id ) : '';
	return '' === $tone ? 'plum' : $tone;
}

/**
 * Returns the icon a post shows when no editor has picked one.
 *
 * Events follow their first event type; news and unknown types get a general icon.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function tekseries_blocks_default_icon( int $post_id ): string {
	$post_type = get_post_type( $post_id );
	if ( 'post' === $post_type ) {
		return 'newspaper';
	}

	if ( 'event' === $post_type ) {
		$terms = get_the_terms( $post_id, 'event_type' );
		$icons = tekseries_blocks_event_type_icons();
		if ( is_array( $terms ) ) {
			foreach ( $terms as $term ) {
				if ( isset( $icons[ $term->slug ] ) ) {
					return $icons[ $term->slug ];
				}
			}
		}
	}

	return 'event';
}

/**
 * Returns the icon to render: the editor's pick, or the default for the post.
 *
 * @param int $post_id Post ID.
 * @return string
 */
function tekseries_blocks_get_icon( int $post_id ): string {
	$icon = tekseries_blocks_sanitize_icon( get_post_meta( $post_id, 'tekseries_icon', true ) );
	return '' === $icon ? tekseries_blocks_default_icon( $post_id ) : $icon;
}
