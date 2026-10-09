<?php
/**
 * TekSeries icon collection.
 *
 * Registers the Material Symbols Rounded icons the design uses as the
 * `tekseries` collection on the WordPress Icon API, so editors can pick them
 * in the Icon block and server code can print them with wp_get_icon().
 * The SVGs live in assets/icons/ (Apache-2.0, see LICENSE.txt there).
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Lists the collection's icon names and their labels.
 *
 * Each name has a matching SVG in assets/icons/. To add an icon, add its
 * Material Symbols name here and run `npm run icons`.
 *
 * @return array<string, string> Icon name => translated label.
 */
function tekseries_blocks_icon_labels(): array {
	return array(
		'add'                  => __( 'Add', 'tekseries-blocks' ),
		'add_business'         => __( 'Add business', 'tekseries-blocks' ),
		'add_photo_alternate'  => __( 'Add photo', 'tekseries-blocks' ),
		'ads_click'            => __( 'Click', 'tekseries-blocks' ),
		'alternate_email'      => __( 'Email address', 'tekseries-blocks' ),
		'apartment'            => __( 'Building', 'tekseries-blocks' ),
		'apps'                 => __( 'All', 'tekseries-blocks' ),
		'arrow_back'           => __( 'Arrow back', 'tekseries-blocks' ),
		'arrow_downward'       => __( 'Arrow downward', 'tekseries-blocks' ),
		'arrow_forward'        => __( 'Arrow forward', 'tekseries-blocks' ),
		'arrow_outward'        => __( 'Arrow outward', 'tekseries-blocks' ),
		'auto_awesome'         => __( 'Sparkles', 'tekseries-blocks' ),
		'auto_stories'         => __( 'Book', 'tekseries-blocks' ),
		'badge'                => __( 'Badge', 'tekseries-blocks' ),
		'balance'              => __( 'Scales', 'tekseries-blocks' ),
		'bookmark'             => __( 'Bookmark', 'tekseries-blocks' ),
		'bookmark_added'       => __( 'Bookmark added', 'tekseries-blocks' ),
		'calendar_month'       => __( 'Calendar', 'tekseries-blocks' ),
		'call'                 => __( 'Phone', 'tekseries-blocks' ),
		'category'             => __( 'Category', 'tekseries-blocks' ),
		'celebration'          => __( 'Celebration', 'tekseries-blocks' ),
		'check'                => __( 'Check', 'tekseries-blocks' ),
		'check_circle'         => __( 'Check circle', 'tekseries-blocks' ),
		'chevron_left'         => __( 'Chevron left', 'tekseries-blocks' ),
		'chevron_right'        => __( 'Chevron right', 'tekseries-blocks' ),
		'close'                => __( 'Close', 'tekseries-blocks' ),
		'code'                 => __( 'Code', 'tekseries-blocks' ),
		'construction'         => __( 'Tools', 'tekseries-blocks' ),
		'content_copy'         => __( 'Copy', 'tekseries-blocks' ),
		'conversion_path'      => __( 'Path', 'tekseries-blocks' ),
		'co_present'           => __( 'Presentation', 'tekseries-blocks' ),
		'corporate_fare'       => __( 'Organisation', 'tekseries-blocks' ),
		'dashboard'            => __( 'Dashboard', 'tekseries-blocks' ),
		'delete'               => __( 'Delete', 'tekseries-blocks' ),
		'directions'           => __( 'Directions', 'tekseries-blocks' ),
		'diversity_3'          => __( 'Community', 'tekseries-blocks' ),
		'edit'                 => __( 'Edit', 'tekseries-blocks' ),
		'edit_note'            => __( 'Edit note', 'tekseries-blocks' ),
		'emoji_events'         => __( 'Trophy', 'tekseries-blocks' ),
		'engineering'          => __( 'Engineering', 'tekseries-blocks' ),
		'error'                => __( 'Error', 'tekseries-blocks' ),
		'event'                => __( 'Event', 'tekseries-blocks' ),
		'event_busy'           => __( 'Event ended', 'tekseries-blocks' ),
		'expand_less'          => __( 'Collapse', 'tekseries-blocks' ),
		'expand_more'          => __( 'Expand', 'tekseries-blocks' ),
		'extension'            => __( 'Puzzle piece', 'tekseries-blocks' ),
		'favorite'             => __( 'Favorite', 'tekseries-blocks' ),
		'format_bold'          => __( 'Bold', 'tekseries-blocks' ),
		'format_italic'        => __( 'Italic', 'tekseries-blocks' ),
		'format_list_bulleted' => __( 'Bulleted list', 'tekseries-blocks' ),
		'format_list_numbered' => __( 'Numbered list', 'tekseries-blocks' ),
		'forum'                => __( 'Forum', 'tekseries-blocks' ),
		'gavel'                => __( 'Gavel', 'tekseries-blocks' ),
		'groups'               => __( 'Groups', 'tekseries-blocks' ),
		'handshake'            => __( 'Handshake', 'tekseries-blocks' ),
		'help'                 => __( 'Help', 'tekseries-blocks' ),
		'history'              => __( 'History', 'tekseries-blocks' ),
		'home'                 => __( 'Home', 'tekseries-blocks' ),
		'home_work'            => __( 'Home and work', 'tekseries-blocks' ),
		'hourglass_top'        => __( 'Hourglass', 'tekseries-blocks' ),
		'how_to_reg'           => __( 'Registered', 'tekseries-blocks' ),
		'hub'                  => __( 'Hub', 'tekseries-blocks' ),
		'info'                 => __( 'Information', 'tekseries-blocks' ),
		'key'                  => __( 'Key', 'tekseries-blocks' ),
		'language'             => __( 'Language', 'tekseries-blocks' ),
		'lightbulb'            => __( 'Light bulb', 'tekseries-blocks' ),
		'link'                 => __( 'Link', 'tekseries-blocks' ),
		'link_off'             => __( 'Unlink', 'tekseries-blocks' ),
		'location_on'          => __( 'Location', 'tekseries-blocks' ),
		'login'                => __( 'Login', 'tekseries-blocks' ),
		'logout'               => __( 'Logout', 'tekseries-blocks' ),
		'mail'                 => __( 'Mail', 'tekseries-blocks' ),
		'menu'                 => __( 'Menu', 'tekseries-blocks' ),
		'more_vert'            => __( 'More', 'tekseries-blocks' ),
		'newspaper'            => __( 'Newspaper', 'tekseries-blocks' ),
		'open_in_full'         => __( 'Open full size', 'tekseries-blocks' ),
		'open_in_new'          => __( 'Open in new tab', 'tekseries-blocks' ),
		'payments'             => __( 'Payments', 'tekseries-blocks' ),
		'photo_camera'         => __( 'Camera', 'tekseries-blocks' ),
		'photo_library'        => __( 'Photo library', 'tekseries-blocks' ),
		'play_arrow'           => __( 'Play', 'tekseries-blocks' ),
		'potted_plant'         => __( 'Plant', 'tekseries-blocks' ),
		'priority_high'        => __( 'Important', 'tekseries-blocks' ),
		'public'               => __( 'Globe', 'tekseries-blocks' ),
		'record_voice_over'    => __( 'Speaker', 'tekseries-blocks' ),
		'redeem'               => __( 'Gift', 'tekseries-blocks' ),
		'redo'                 => __( 'Redo', 'tekseries-blocks' ),
		'report'               => __( 'Report', 'tekseries-blocks' ),
		'rocket_launch'        => __( 'Rocket', 'tekseries-blocks' ),
		'schedule'             => __( 'Schedule', 'tekseries-blocks' ),
		'school'               => __( 'School', 'tekseries-blocks' ),
		'search'               => __( 'Search', 'tekseries-blocks' ),
		'send'                 => __( 'Send', 'tekseries-blocks' ),
		'settings_suggest'     => __( 'Settings', 'tekseries-blocks' ),
		'shield_person'        => __( 'Privacy', 'tekseries-blocks' ),
		'smart_display'        => __( 'Video player', 'tekseries-blocks' ),
		'smart_toy'            => __( 'Robot', 'tekseries-blocks' ),
		'south'                => __( 'Arrow down', 'tekseries-blocks' ),
		'swap_vert'            => __( 'Sort', 'tekseries-blocks' ),
		'swipe'                => __( 'Swipe', 'tekseries-blocks' ),
		'task_alt'             => __( 'Task done', 'tekseries-blocks' ),
		'toc'                  => __( 'Table of contents', 'tekseries-blocks' ),
		'touch_app'            => __( 'Tap', 'tekseries-blocks' ),
		'travel_explore'       => __( 'Explore', 'tekseries-blocks' ),
		'trending_down'        => __( 'Trending down', 'tekseries-blocks' ),
		'trending_up'          => __( 'Trending up', 'tekseries-blocks' ),
		'undo'                 => __( 'Undo', 'tekseries-blocks' ),
		'upload'               => __( 'Upload', 'tekseries-blocks' ),
		'upload_file'          => __( 'Upload file', 'tekseries-blocks' ),
		'verified'             => __( 'Verified', 'tekseries-blocks' ),
		'verified_user'        => __( 'Verified user', 'tekseries-blocks' ),
		'videocam'             => __( 'Video camera', 'tekseries-blocks' ),
		'visibility'           => __( 'Visibility', 'tekseries-blocks' ),
		'volunteer_activism'   => __( 'Volunteer', 'tekseries-blocks' ),
		'work'                 => __( 'Briefcase', 'tekseries-blocks' ),
		'work_history'         => __( 'Work history', 'tekseries-blocks' ),
		'work_off'             => __( 'No work', 'tekseries-blocks' ),
		'zoom_in'              => __( 'Zoom in', 'tekseries-blocks' ),
	);
}

/**
 * Registers the `tekseries` icon collection and its icons.
 */
function tekseries_blocks_register_icons(): void {
	wp_register_icon_collection(
		'tekseries',
		array(
			'label'       => __( 'TekSeries', 'tekseries-blocks' ),
			'description' => __( 'Material Symbols Rounded icons used by the TekSeries design.', 'tekseries-blocks' ),
		)
	);

	$directory = dirname( __DIR__ ) . '/assets/icons/';
	foreach ( tekseries_blocks_icon_labels() as $name => $label ) {
		wp_register_icon(
			'tekseries/' . $name,
			array(
				'label'     => $label,
				'file_path' => $directory . $name . '.svg',
			)
		);
	}
}
add_action( 'init', 'tekseries_blocks_register_icons' );

/**
 * Returns a collection icon as decorative inline SVG (hidden from screen readers).
 *
 * @param string $name Icon name in the collection, without the `tekseries/` prefix.
 * @return string Empty if the icon isn't registered.
 */
function tekseries_blocks_icon_svg( string $name ): string {
	return wp_get_icon( 'tekseries/' . $name, array( 'size' => null ) );
}
