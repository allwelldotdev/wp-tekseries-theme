<?php
/**
 * TekSeries theme setup.
 *
 * Block themes get core theme supports automatically; this file stays light
 * (stylesheets, block styles, pattern categories and similar setup only).
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads the global stylesheet on the front end.
 */
function tekseries_enqueue_styles(): void {
	wp_enqueue_style(
		'tekseries-global',
		get_theme_file_uri( 'assets/css/global.css' ),
		array(),
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'tekseries_enqueue_styles' );

/**
 * Registers the theme's block style variations.
 *
 * The style data lives in theme.json (`styles.blocks.*.variations`), which
 * keeps responsive and hover states working; core only applies it to
 * variations registered here. Button's `outline` is core's own style.
 */
function tekseries_register_block_styles(): void {
	$styles = array(
		'core/button'     => array(
			'soft'   => __( 'Soft', 'tekseries' ),
			'dark'   => __( 'Dark', 'tekseries' ),
			'accent' => __( 'Accent', 'tekseries' ),
			'chip'   => __( 'Chip', 'tekseries' ),
			'glass'  => __( 'Glass', 'tekseries' ),
		),
		'core/group'      => array(
			'card'         => __( 'Card', 'tekseries' ),
			'card-plum'    => __( 'Plum card', 'tekseries' ),
			'card-saffron' => __( 'Saffron card', 'tekseries' ),
			'card-lilac'   => __( 'Lilac card', 'tekseries' ),
			'hero-plum'    => __( 'Plum hero', 'tekseries' ),
			'tile'         => __( 'Tile', 'tekseries' ),
			'tile-glass'   => __( 'Tile on plum', 'tekseries' ),
			'tile-frost'   => __( 'Tile on saffron', 'tekseries' ),
		),
		'core/icon'       => array(
			'tile'        => __( 'Tile', 'tekseries' ),
			'deco'        => __( 'Decoration, top', 'tekseries' ),
			'deco-bottom' => __( 'Decoration, bottom', 'tekseries' ),
		),
		'core/image'      => array(
			'avatar' => __( 'Avatar', 'tekseries' ),
			'logo'   => __( 'Logo', 'tekseries' ),
		),
		'core/post-terms' => array(
			'badge' => __( 'Badge', 'tekseries' ),
		),
		'core/paragraph'  => array(
			'eyebrow' => __( 'Eyebrow', 'tekseries' ),
			'chip'    => __( 'Chip', 'tekseries' ),
			'stat'    => __( 'Stat', 'tekseries' ),
			'pull'    => __( 'Pull statement', 'tekseries' ),
		),
	);

	foreach ( $styles as $block_name => $variations ) {
		foreach ( $variations as $name => $label ) {
			register_block_style(
				$block_name,
				array(
					'name'  => $name,
					'label' => $label,
				)
			);
		}
	}
}
add_action( 'init', 'tekseries_register_block_styles' );

/**
 * Loads the same stylesheet in the editor canvas.
 */
function tekseries_editor_styles(): void {
	add_editor_style( 'assets/css/global.css' );
}
add_action( 'after_setup_theme', 'tekseries_editor_styles' );

/**
 * Loads per-block stylesheets only on pages that use the block, after core's
 * own styles for it, on the front end and in the editor.
 */
function tekseries_enqueue_block_styles(): void {
	$blocks = array(
		'core/breadcrumbs'          => 'breadcrumbs',
		'core/buttons'              => 'buttons',
		'core/cover'                => 'cover',
		'core/group'                => 'group',
		'core/icon'                 => 'icon',
		'core/image'                => 'image',
		'core/navigation'           => 'navigation',
		'core/paragraph'            => 'paragraph',
		'core/post-content'         => 'post-content',
		'core/post-excerpt'         => 'post-excerpt',
		'core/post-navigation-link' => 'post-navigation-link',
		'core/post-terms'           => 'post-terms',
		'core/query-pagination'     => 'query-pagination',
		'core/read-more'            => 'read-more',
		'core/search'               => 'search',
		'core/social-links'         => 'social-links',
		'fluentfom/guten-block'     => 'fluentform',
		'tekseries/post-tone'       => 'post-tone',
	);

	foreach ( $blocks as $block_name => $file ) {
		wp_enqueue_block_style(
			$block_name,
			array(
				'handle' => "tekseries-block-{$file}",
				'src'    => get_theme_file_uri( "assets/css/blocks/{$file}.css" ),
				'path'   => get_theme_file_path( "assets/css/blocks/{$file}.css" ),
				'ver'    => wp_get_theme()->get( 'Version' ),
			)
		);
	}
}
add_action( 'init', 'tekseries_enqueue_block_styles' );

/**
 * Registers the inserter categories for the theme's patterns.
 */
function tekseries_register_pattern_categories(): void {
	register_block_pattern_category(
		'tekseries-home',
		array( 'label' => __( 'TekSeries: Home', 'tekseries' ) )
	);
	register_block_pattern_category(
		'tekseries-pages',
		array( 'label' => __( 'TekSeries: Pages', 'tekseries' ) )
	);
}
add_action( 'init', 'tekseries_register_pattern_categories' );

/**
 * Marks header and filter links to the current page as current.
 *
 * Core only does this for links that store a post or term ID; ours are
 * relative URLs so they work on any domain. An exact path match gets
 * aria-current="page"; on a single event or news post, the Events or News
 * link is marked as the current section.
 *
 * @param string $block_content Rendered navigation link.
 * @param array  $block         Parsed block.
 */
function tekseries_mark_current_nav_link( string $block_content, array $block ): string {
	$url = $block['attrs']['url'] ?? '';
	if ( '' === $url || str_contains( $url, '#' ) || str_contains( $block_content, 'current-menu-item' ) ) {
		return $block_content;
	}

	global $wp;
	$link    = untrailingslashit( (string) wp_parse_url( $url, PHP_URL_PATH ) );
	$current = untrailingslashit( (string) wp_parse_url( home_url( '/' . $wp->request ), PHP_URL_PATH ) );
	$section = match ( true ) {
		is_singular( 'event' ) => '/events',
		is_singular( 'post' )  => '/news',
		default                => null,
	};

	$is_page    = $link === $current;
	$is_section = ! $is_page && null !== $section && untrailingslashit( (string) wp_parse_url( home_url( $section ), PHP_URL_PATH ) ) === $link;
	if ( ! $is_page && ! $is_section ) {
		return $block_content;
	}

	$processor = new WP_HTML_Tag_Processor( $block_content );
	if ( $processor->next_tag( 'li' ) ) {
		$processor->add_class( 'current-menu-item' );
	}
	if ( $is_page && $processor->next_tag( 'a' ) ) {
		$processor->set_attribute( 'aria-current', 'page' );
	}
	return $processor->get_updated_html();
}
add_filter( 'render_block_core/navigation-link', 'tekseries_mark_current_nav_link', 10, 2 );

/**
 * Keeps single news and event breadcrumbs to Home / archive / title.
 *
 * Core adds the post's first term (e.g. "Uncategorized") between the archive
 * and the title for non-hierarchical post types; the design doesn't.
 *
 * @param array $items Breadcrumb items, home first and the current page last.
 */
function tekseries_breadcrumb_items( array $items ): array {
	if ( ! is_singular( array( 'post', 'event' ) ) || count( $items ) <= 3 ) {
		return $items;
	}
	return array( $items[0], $items[1], end( $items ) );
}
add_filter( 'block_core_breadcrumbs_items', 'tekseries_breadcrumb_items' );
