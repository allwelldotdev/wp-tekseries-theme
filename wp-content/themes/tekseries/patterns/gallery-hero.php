<?php
/**
 * Title: Gallery: Hero
 * Slug: tekseries/gallery-hero
 * Categories: tekseries-pages
 * Description: Gallery hero with a photo collage.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum","style":{"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:heading {"level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color"><?php echo esc_html__( 'Gallery', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'Moments from our camps, workshops and sessions across South East Nigeria.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"ts-collage","layout":{"type":"default"}} -->
<div class="wp-block-group ts-collage"><!-- wp:image -->
<figure class="wp-block-image"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/home/case-study.jpg' ) ); ?>" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:image -->
<figure class="wp-block-image"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/home/about.jpg' ) ); ?>" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:image -->
<figure class="wp-block-image"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/home/hero.jpg' ) ); ?>" alt=""/></figure>
<!-- /wp:image --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
