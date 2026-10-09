<?php
/**
 * Event post type and event_type taxonomy.
 *
 * These used to be registered by the Divi child theme. The args match that
 * registration so existing URLs (/events/, /event/{slug}/, /event_type/{slug}/)
 * and REST routes keep working after the theme switch.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the `event` post type.
 */
function tekseries_blocks_register_event_post_type(): void {
	$labels = array(
		'name'                     => __( 'Events', 'tekseries-blocks' ),
		'singular_name'            => __( 'Event', 'tekseries-blocks' ),
		'menu_name'                => __( 'Events', 'tekseries-blocks' ),
		'all_items'                => __( 'All Events', 'tekseries-blocks' ),
		'add_new'                  => __( 'Add new', 'tekseries-blocks' ),
		'add_new_item'             => __( 'Add new Event', 'tekseries-blocks' ),
		'edit_item'                => __( 'Edit Event', 'tekseries-blocks' ),
		'new_item'                 => __( 'New Event', 'tekseries-blocks' ),
		'view_item'                => __( 'View Event', 'tekseries-blocks' ),
		'view_items'               => __( 'View Events', 'tekseries-blocks' ),
		'search_items'             => __( 'Search Events', 'tekseries-blocks' ),
		'not_found'                => __( 'No Events found', 'tekseries-blocks' ),
		'not_found_in_trash'       => __( 'No Events found in trash', 'tekseries-blocks' ),
		'parent_item_colon'        => __( 'Parent Event:', 'tekseries-blocks' ),
		'featured_image'           => __( 'Featured image for this Event', 'tekseries-blocks' ),
		'set_featured_image'       => __( 'Set featured image for this Event', 'tekseries-blocks' ),
		'remove_featured_image'    => __( 'Remove featured image for this Event', 'tekseries-blocks' ),
		'use_featured_image'       => __( 'Use as featured image for this Event', 'tekseries-blocks' ),
		'archives'                 => __( 'Events', 'tekseries-blocks' ),
		'insert_into_item'         => __( 'Insert into Event', 'tekseries-blocks' ),
		'uploaded_to_this_item'    => __( 'Upload to this Event', 'tekseries-blocks' ),
		'filter_items_list'        => __( 'Filter Events list', 'tekseries-blocks' ),
		'items_list_navigation'    => __( 'Events list navigation', 'tekseries-blocks' ),
		'items_list'               => __( 'Events list', 'tekseries-blocks' ),
		'attributes'               => __( 'Events attributes', 'tekseries-blocks' ),
		'name_admin_bar'           => __( 'Event', 'tekseries-blocks' ),
		'item_published'           => __( 'Event published', 'tekseries-blocks' ),
		'item_published_privately' => __( 'Event published privately.', 'tekseries-blocks' ),
		'item_reverted_to_draft'   => __( 'Event reverted to draft.', 'tekseries-blocks' ),
		'item_scheduled'           => __( 'Event scheduled', 'tekseries-blocks' ),
		'item_updated'             => __( 'Event updated.', 'tekseries-blocks' ),
	);

	register_post_type(
		'event',
		array(
			'label'               => __( 'Events', 'tekseries-blocks' ),
			'labels'              => $labels,
			'public'              => true,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => true,
			'show_in_rest'        => true,
			'has_archive'         => 'events',
			'delete_with_user'    => false,
			'exclude_from_search' => false,
			'capability_type'     => 'post',
			'map_meta_cap'        => true,
			'hierarchical'        => false,
			'can_export'          => true,
			'rewrite'             => array(
				'slug'       => 'event',
				'with_front' => false,
			),
			'query_var'           => true,
			'menu_position'       => 6,
			'menu_icon'           => 'dashicons-tickets-alt',
			'supports'            => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'revisions' ),
			'taxonomies'          => array( 'event_type' ),
		)
	);
}

/**
 * Registers the `event_type` taxonomy (Webinar, Workshop, Makers Prize).
 */
function tekseries_blocks_register_event_type_taxonomy(): void {
	$labels = array(
		'name'                       => __( 'Types', 'tekseries-blocks' ),
		'singular_name'              => __( 'Type', 'tekseries-blocks' ),
		'menu_name'                  => __( 'Types', 'tekseries-blocks' ),
		'all_items'                  => __( 'All Types', 'tekseries-blocks' ),
		'edit_item'                  => __( 'Edit Type', 'tekseries-blocks' ),
		'view_item'                  => __( 'View Type', 'tekseries-blocks' ),
		'update_item'                => __( 'Update Type name', 'tekseries-blocks' ),
		'add_new_item'               => __( 'Add new Type', 'tekseries-blocks' ),
		'new_item_name'              => __( 'New Type name', 'tekseries-blocks' ),
		'parent_item'                => __( 'Parent Type', 'tekseries-blocks' ),
		'parent_item_colon'          => __( 'Parent Type:', 'tekseries-blocks' ),
		'search_items'               => __( 'Search Types', 'tekseries-blocks' ),
		'popular_items'              => __( 'Popular Types', 'tekseries-blocks' ),
		'separate_items_with_commas' => __( 'Separate Types with commas', 'tekseries-blocks' ),
		'add_or_remove_items'        => __( 'Add or remove Types', 'tekseries-blocks' ),
		'choose_from_most_used'      => __( 'Choose from the most used Types', 'tekseries-blocks' ),
		'not_found'                  => __( 'No Types found', 'tekseries-blocks' ),
		'no_terms'                   => __( 'No Types', 'tekseries-blocks' ),
		'items_list_navigation'      => __( 'Types list navigation', 'tekseries-blocks' ),
		'items_list'                 => __( 'Types list', 'tekseries-blocks' ),
		'back_to_items'              => __( 'Back to Types', 'tekseries-blocks' ),
	);

	register_taxonomy(
		'event_type',
		array( 'event' ),
		array(
			'label'              => __( 'Types', 'tekseries-blocks' ),
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'hierarchical'       => false,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_nav_menus'  => true,
			'query_var'          => true,
			'rewrite'            => array(
				'slug'       => 'event_type',
				'with_front' => false,
			),
			'show_admin_column'  => true,
			'show_in_rest'       => true,
			'show_tagcloud'      => false,
			'rest_base'          => 'event_type',
			'show_in_quick_edit' => true,
			'sort'               => true,
		)
	);
}

/**
 * Registers every content type this plugin owns.
 */
function tekseries_blocks_register_content_types(): void {
	tekseries_blocks_register_event_post_type();
	tekseries_blocks_register_event_type_taxonomy();
}
add_action( 'init', 'tekseries_blocks_register_content_types' );
