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
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:heading {"level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color"><?php echo esc_html__( 'Gallery', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'Moments from our camps, workshops and sessions across South East Nigeria.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8","margin":{"top":"var:preset|spacing|4"}}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--4)"><!-- wp:group {"className":"ts-media-chip","style":{"spacing":{"blockGap":"6px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-media-chip"><!-- wp:icon {"icon":"tekseries/photo_library","style":{"dimensions":{"width":"18px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/media-stats","args":{"key":"photos"}}}}} -->
<p></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-media-chip","style":{"spacing":{"blockGap":"6px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-media-chip"><!-- wp:icon {"icon":"tekseries/smart_display","style":{"dimensions":{"width":"18px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/media-stats","args":{"key":"videos"}}}}} -->
<p></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
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
