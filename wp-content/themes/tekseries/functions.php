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
 * Asks the browser for the two text fonts early, so the first paint is
 * already set in them and nothing shifts when they arrive. Only the Latin
 * files: the other ranges load when a page needs them.
 *
 * @param array $resources Resources to preload.
 */
function tekseries_preload_fonts( array $resources ): array {
	$fonts = array(
		'schibsted-grotesk/schibsted-grotesk-latin-wght-normal',
		'onest/onest-latin-wght-normal',
	);
	foreach ( $fonts as $font ) {
		$resources[] = array(
			'href'        => get_theme_file_uri( "assets/fonts/{$font}.woff2" ),
			'as'          => 'font',
			'type'        => 'font/woff2',
			'crossorigin' => 'anonymous',
		);
	}
	return $resources;
}
add_filter( 'wp_preload_resources', 'tekseries_preload_fonts' );

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
		'core/video'      => array(
			'frame' => __( 'Photo frame (4:3)', 'tekseries' ),
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
		'core/video'                => 'video',
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
 * Lists the pages that sit under a section of Home in their breadcrumbs.
 *
 * @return array<string, array{label: string, url: string}> Page slug => the section's crumb.
 */
function tekseries_breadcrumb_sections(): array {
	/**
	 * Filters the pages whose breadcrumbs go through a section of Home.
	 *
	 * @param array $sections Page slug => array( 'label' => …, 'url' => … ).
	 */
	return apply_filters(
		'tekseries_breadcrumb_sections',
		array(
			'maker-prize' => array(
				'label' => __( 'What We Do', 'tekseries' ),
				'url'   => home_url( '/#services' ),
			),
		)
	);
}

/**
 * Puts a page listed in tekseries_breadcrumb_sections() under its section
 * (Home / What We Do / Maker Prize), and keeps single news and event
 * breadcrumbs to Home / archive / title.
 *
 * Core adds the post's first term (e.g. "Uncategorized") between the archive
 * and the title for non-hierarchical post types; the design doesn't.
 *
 * @param array $items Breadcrumb items, home first and the current page last.
 */
function tekseries_breadcrumb_items( array $items ): array {
	$section = is_page() ? ( tekseries_breadcrumb_sections()[ (string) get_post_field( 'post_name', get_queried_object_id() ) ] ?? null ) : null;
	if ( $section && count( $items ) >= 2 ) {
		array_splice( $items, 1, 0, array( $section ) );
		return $items;
	}

	if ( ! is_singular( array( 'post', 'event' ) ) || count( $items ) <= 3 ) {
		return $items;
	}
	return array( $items[0], $items[1], end( $items ) );
}
add_filter( 'block_core_breadcrumbs_items', 'tekseries_breadcrumb_items' );

/**
 * Keeps a chevron at both ends of a listing's pagination.
 *
 * Core prints no previous link on the first page and no next link on the
 * last. The design draws a greyed chevron there instead, so the row keeps its
 * shape. It leads nowhere, so assistive technology is not told about it.
 *
 * @param string $block_content Rendered pagination.
 * @param array  $block         Parsed block.
 */
function tekseries_pagination_end_chevrons( string $block_content, array $block ): string {
	if ( ! str_contains( $block['attrs']['className'] ?? '', 'ts-pagination' ) || ! preg_match( '/^\s*<nav\b[^>]*>/', $block_content, $open ) ) {
		return $block_content;
	}
	$close = strrpos( $block_content, '</nav>' );
	if ( false === $close ) {
		return $block_content;
	}

	$ghost = '<span class="ts-pagination__ghost" aria-hidden="true"><span class="wp-block-query-pagination-%s-arrow is-arrow-chevron"></span></span>';
	$first = ! str_contains( $block_content, 'wp-block-query-pagination-previous' );
	$last  = ! str_contains( $block_content, 'wp-block-query-pagination-next' );
	// The end first: adding at the start would move it.
	if ( $last ) {
		$block_content = substr_replace( $block_content, sprintf( $ghost, 'next' ), $close, 0 );
	}
	if ( $first ) {
		$block_content = substr_replace( $block_content, sprintf( $ghost, 'previous' ), strlen( $open[0] ), 0 );
	}
	return $block_content;
}
add_filter( 'render_block_core/query-pagination', 'tekseries_pagination_end_chevrons', 10, 2 );

/**
 * Adds the neighbouring post's date to a previous/next post card.
 *
 * Core's block prints a label and the title; the design has the date under
 * them, inside the link.
 *
 * @param string $block_content Rendered post navigation link.
 * @param array  $block         Parsed block.
 */
function tekseries_post_nav_date( string $block_content, array $block ): string {
	$attrs = $block['attrs'] ?? array();
	$end   = strrpos( $block_content, '</a>' );
	if ( false === $end || ! str_contains( $attrs['className'] ?? '', 'ts-post-nav' ) ) {
		return $block_content;
	}

	// The same neighbour core's block links to.
	$taxonomy = (string) ( $attrs['taxonomy'] ?? '' );
	$in_term  = '' !== $taxonomy;
	$previous = 'previous' === ( $attrs['type'] ?? 'next' );
	$adjacent = get_adjacent_post( $in_term, '', $previous, $in_term ? $taxonomy : 'category' );
	if ( ! $adjacent instanceof WP_Post ) {
		return $block_content;
	}

	$date = sprintf(
		'<time class="ts-post-nav__date" datetime="%1$s">%2$s</time>',
		esc_attr( get_the_date( 'c', $adjacent ) ),
		/* translators: date of the previous or next post, in PHP date format. */
		esc_html( get_the_date( __( 'F j, Y', 'tekseries' ), $adjacent ) )
	);
	return substr_replace( $block_content, $date, $end, 0 );
}
add_filter( 'render_block_core/post-navigation-link', 'tekseries_post_nav_date', 10, 2 );

/**
 * Leaves the lead line out of a legal page's hero when the page has no
 * excerpt of its own.
 *
 * Core's Excerpt block would otherwise make one up from the page's first
 * words.
 *
 * @param string   $block_content Rendered excerpt.
 * @param array    $block         Parsed block.
 * @param WP_Block $instance      Block instance.
 */
function tekseries_legal_lead( string $block_content, array $block, WP_Block $instance ): string {
	if ( ! str_contains( $block['attrs']['className'] ?? '', 'ts-legal-lead' ) ) {
		return $block_content;
	}
	return has_excerpt( $instance->context['postId'] ?? null ) ? $block_content : '';
}
add_filter( 'render_block_core/post-excerpt', 'tekseries_legal_lead', 10, 3 );
