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
		'core/button'    => array(
			'soft'   => __( 'Soft', 'tekseries' ),
			'dark'   => __( 'Dark', 'tekseries' ),
			'accent' => __( 'Accent', 'tekseries' ),
			'chip'   => __( 'Chip', 'tekseries' ),
			'glass'  => __( 'Glass', 'tekseries' ),
		),
		'core/group'     => array(
			'card'         => __( 'Card', 'tekseries' ),
			'card-plum'    => __( 'Plum card', 'tekseries' ),
			'card-saffron' => __( 'Saffron card', 'tekseries' ),
			'card-lilac'   => __( 'Lilac card', 'tekseries' ),
			'tile'         => __( 'Tile', 'tekseries' ),
			'tile-glass'   => __( 'Tile on plum', 'tekseries' ),
			'tile-frost'   => __( 'Tile on saffron', 'tekseries' ),
		),
		'core/icon'      => array(
			'tile'        => __( 'Tile', 'tekseries' ),
			'deco'        => __( 'Decoration, top', 'tekseries' ),
			'deco-bottom' => __( 'Decoration, bottom', 'tekseries' ),
		),
		'core/image'     => array(
			'avatar' => __( 'Avatar', 'tekseries' ),
			'logo'   => __( 'Logo', 'tekseries' ),
		),
		'core/paragraph' => array(
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
		'core/icon'         => 'icon',
		'core/image'        => 'image',
		'core/navigation'   => 'navigation',
		'core/paragraph'    => 'paragraph',
		'core/social-links' => 'social-links',
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

