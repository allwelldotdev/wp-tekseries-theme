<?php
/**
 * Title: Home: Hero
 * Slug: tekseries/home-hero
 * Categories: tekseries-home
 * Description: Slides with the mission statement and calls to action over photos.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:tekseries/hero-carousel {"autoplay":true,"align":"wide","style":{"border":{"radius":"var:preset|border-radius|xl"}}} -->
<!-- wp:cover {"url":"<?php echo esc_url( get_theme_file_uri( 'assets/images/home/hero.jpg' ) ); ?>","focalPoint":{"x":0.5,"y":0.3},"minHeight":600,"minHeightUnit":"px","gradient":"overlay-plum","contentPosition":"center left","style":{"spacing":{"padding":{"top":"var:preset|spacing|hero-y","right":"var:preset|spacing|hero-x","bottom":"var:preset|spacing|hero-y","left":"var:preset|spacing|hero-x"}},"@mobile":{"dimensions":{"minHeight":"auto"},"spacing":{"padding":{"bottom":"var:preset|spacing|56"}}}},"layout":{"type":"constrained","contentSize":"820px","justifyContent":"left"}} -->
<div class="wp-block-cover has-custom-content-position is-position-center-left" style="padding-top:var(--wp--preset--spacing--hero-y);padding-right:var(--wp--preset--spacing--hero-x);padding-bottom:var(--wp--preset--spacing--hero-y);padding-left:var(--wp--preset--spacing--hero-x);min-height:600px"><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( get_theme_file_uri( 'assets/images/home/hero.jpg' ) ); ?>" style="object-position:50% 30%" data-object-fit="cover" data-object-position="50% 30%"/><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim wp-block-cover__gradient-background has-background-gradient has-overlay-plum-gradient-background"></span><div class="wp-block-cover__inner-container"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-chip"} -->
<p class="is-style-chip"><?php echo esc_html__( 'TekSeries is a 501(c)(3) Tax-Exempt Non-Profit Corporation', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color"><?php echo esc_html__( 'Expanding Opportunity, Empowering Our Future', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'Equipping underserved youth with Digital, AI, and Creative Economy Skills.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"blockGap":"var:preset|spacing|12","margin":{"top":"var:preset|spacing|8"}},"@mobile":{"layout":{"orientation":"vertical","justifyContent":"stretch"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--8)"><!-- wp:button {"className":"is-style-accent"} -->
<div class="wp-block-button is-style-accent"><a class="wp-block-button__link wp-element-button" href="/jobs/"><?php echo esc_html__( 'Explore Job Series', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"textColor":"white","className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" href="#about"><?php echo esc_html__( 'Get Involved', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|28","margin":{"top":"var:preset|spacing|12"}},"@mobile":{"spacing":{"blockGap":"var:preset|spacing|16"}}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--12)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/hub","style":{"dimensions":{"width":"22px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body"} -->
<p class="has-white-color has-text-color has-body-font-size" style="font-weight:700"><?php echo esc_html__( 'Share', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/lightbulb","style":{"dimensions":{"width":"22px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body"} -->
<p class="has-white-color has-text-color has-body-font-size" style="font-weight:700"><?php echo esc_html__( 'Create', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/settings_suggest","style":{"dimensions":{"width":"22px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body"} -->
<p class="has-white-color has-text-color has-body-font-size" style="font-weight:700"><?php echo esc_html__( 'Solve', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->

<!-- wp:cover {"url":"<?php echo esc_url( get_theme_file_uri( 'assets/images/home/hero-camp.jpg' ) ); ?>","focalPoint":{"x":0.75,"y":0.65},"minHeight":600,"minHeightUnit":"px","gradient":"overlay-plum","contentPosition":"center left","style":{"spacing":{"padding":{"top":"var:preset|spacing|hero-y","right":"var:preset|spacing|hero-x","bottom":"var:preset|spacing|hero-y","left":"var:preset|spacing|hero-x"}},"@mobile":{"dimensions":{"minHeight":"auto"},"spacing":{"padding":{"bottom":"var:preset|spacing|56"}}}},"layout":{"type":"constrained","contentSize":"820px","justifyContent":"left"}} -->
<div class="wp-block-cover has-custom-content-position is-position-center-left" style="padding-top:var(--wp--preset--spacing--hero-y);padding-right:var(--wp--preset--spacing--hero-x);padding-bottom:var(--wp--preset--spacing--hero-y);padding-left:var(--wp--preset--spacing--hero-x);min-height:600px"><img class="wp-block-cover__image-background" alt="" src="<?php echo esc_url( get_theme_file_uri( 'assets/images/home/hero-camp.jpg' ) ); ?>" style="object-position:75% 65%" data-object-fit="cover" data-object-position="75% 65%"/><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim wp-block-cover__gradient-background has-background-gradient has-overlay-plum-gradient-background"></span><div class="wp-block-cover__inner-container"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-chip"} -->
<p class="is-style-chip"><?php echo esc_html__( '2025 Jr. Rural Camp', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"style":{"typography":{"lineHeight":"1.02"}},"textColor":"white","fontSize":"heading-1"} -->
<h2 class="wp-block-heading has-white-color has-text-color has-heading-1-font-size" style="line-height:1.02"><?php echo esc_html__( 'One Youth Career At A Time', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'Free digital skills workshops for various ages and skill levels.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"blockGap":"var:preset|spacing|12","margin":{"top":"var:preset|spacing|8"}},"@mobile":{"layout":{"orientation":"vertical","justifyContent":"stretch"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--8)"><!-- wp:button {"className":"is-style-accent"} -->
<div class="wp-block-button is-style-accent"><a class="wp-block-button__link wp-element-button" href="/events/"><?php echo esc_html__( 'Explore Events', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"textColor":"white","className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" href="/gallery/"><?php echo esc_html__( 'View Gallery', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|28","margin":{"top":"var:preset|spacing|12"}},"@mobile":{"spacing":{"blockGap":"var:preset|spacing|16"}}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--12)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/hub","style":{"dimensions":{"width":"22px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body"} -->
<p class="has-white-color has-text-color has-body-font-size" style="font-weight:700"><?php echo esc_html__( 'Share', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/lightbulb","style":{"dimensions":{"width":"22px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body"} -->
<p class="has-white-color has-text-color has-body-font-size" style="font-weight:700"><?php echo esc_html__( 'Create', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/settings_suggest","style":{"dimensions":{"width":"22px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body"} -->
<p class="has-white-color has-text-color has-body-font-size" style="font-weight:700"><?php echo esc_html__( 'Solve', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->
<!-- /wp:tekseries/hero-carousel -->
