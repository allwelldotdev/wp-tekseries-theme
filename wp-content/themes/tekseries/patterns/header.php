<?php
/**
 * Title: Header
 * Slug: tekseries/header
 * Inserter: no
 *
 * Content of the header template part, kept in a pattern so its strings translate.
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"className":"ts-header","style":{"border":{"bottom":{"color":"var:preset|color|line","style":"solid","width":"1px"}}},"backgroundColor":"white","layout":{"type":"constrained"}} -->
<div class="wp-block-group ts-header has-white-background-color has-background" style="border-bottom-color:var(--wp--preset--color--line);border-bottom-style:solid;border-bottom-width:1px"><!-- wp:group {"align":"wide","className":"ts-header__bar","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignwide ts-header__bar"><!-- wp:site-logo {"width":64} /-->

<!-- wp:navigation {"overlayMenu":"never","metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"ts-nav-primary","ariaLabel":"<?php echo esc_attr__( 'Main', 'tekseries' ); ?>"} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Who We Are', 'tekseries' ); ?>","url":"/#about","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'What We Do', 'tekseries' ); ?>","url":"/#services","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'News', 'tekseries' ); ?>","url":"/news/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Events', 'tekseries' ); ?>","url":"/events/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Gallery', 'tekseries' ); ?>","url":"/gallery/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Team', 'tekseries' ); ?>","url":"/#team","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Contact', 'tekseries' ); ?>","url":"/contact/","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation -->

<!-- wp:buttons {"metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"ts-header__ctas","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|8"}}}} -->
<div class="wp-block-buttons ts-header__ctas"><!-- wp:button {"className":"is-style-soft","style":{"spacing":{"padding":{"top":"12px","right":"18px","bottom":"12px","left":"18px"}}},"fontSize":"body-s"} -->
<div class="wp-block-button is-style-soft"><a class="wp-block-button__link has-body-s-font-size has-custom-font-size wp-element-button" href="/jobs/" style="padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px"><?php echo esc_html__( 'Job Series', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"spacing":{"padding":{"top":"12px","right":"18px","bottom":"12px","left":"18px"}}},"fontSize":"body-s"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-body-s-font-size has-custom-font-size wp-element-button" href="/submit-job/" style="padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px"><?php echo esc_html__( 'Post A Job', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:navigation {"overlayMenu":"always","icon":"menu","overlayBackgroundColor":"white","overlayTextColor":"plum","metadata":{"blockVisibility":{"viewport":{"desktop":false}}},"className":"ts-nav-compact","ariaLabel":"<?php echo esc_attr__( 'Menu', 'tekseries' ); ?>"} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Who We Are', 'tekseries' ); ?>","url":"/#about","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'What We Do', 'tekseries' ); ?>","url":"/#services","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'News', 'tekseries' ); ?>","url":"/news/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Events', 'tekseries' ); ?>","url":"/events/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Gallery', 'tekseries' ); ?>","url":"/gallery/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Team', 'tekseries' ); ?>","url":"/#team","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Contact', 'tekseries' ); ?>","url":"/contact/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:buttons {"className":"ts-nav-compact__ctas","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|8"}}}} -->
<div class="wp-block-buttons ts-nav-compact__ctas"><!-- wp:button {"className":"is-style-soft","style":{"spacing":{"padding":{"top":"12px","right":"18px","bottom":"12px","left":"18px"}}},"fontSize":"body-s"} -->
<div class="wp-block-button is-style-soft"><a class="wp-block-button__link has-body-s-font-size has-custom-font-size wp-element-button" href="/jobs/" style="padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px"><?php echo esc_html__( 'Job Series', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"style":{"spacing":{"padding":{"top":"12px","right":"18px","bottom":"12px","left":"18px"}}},"fontSize":"body-s"} -->
<div class="wp-block-button"><a class="wp-block-button__link has-body-s-font-size has-custom-font-size wp-element-button" href="/submit-job/" style="padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px"><?php echo esc_html__( 'Post A Job', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->
<!-- /wp:navigation --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
