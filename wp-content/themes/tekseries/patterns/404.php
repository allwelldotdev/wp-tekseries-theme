<?php
/**
 * Title: 404
 * Slug: tekseries/404
 * Inserter: no
 * Description: Content of the 404 template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum","style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:breadcrumbs /-->

<!-- wp:heading {"level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color"><?php echo esc_html__( 'Page not found', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'The page you are looking for has moved or no longer exists. Try a search, or start again from the home page.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:search {"label":"<?php echo esc_html__( 'Search', 'tekseries' ); ?>","showLabel":false,"buttonText":"<?php echo esc_html__( 'Search', 'tekseries' ); ?>","className":"ts-search"} /-->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-accent"} -->
<div class="wp-block-button is-style-accent"><a class="wp-block-button__link wp-element-button" href="/"><?php echo esc_html__( 'Back to the home page', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
