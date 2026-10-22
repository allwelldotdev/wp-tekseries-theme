<?php
/**
 * Test only (mapped into wp-env as a must-use plugin). Prints what GoDaddy's
 * platform plugin prints into the head on live: the same id and, verbatim
 * from tekseries.com on 2026-10-22, the two rules that restyle form fields and
 * submit buttons. The theme must take it out (specs/host-css.spec.ts).
 */

add_action(
	'wp_head',
	static function (): void {
		?>
<style id="wp-site-designer-contrast-fallback">
body .wp-site-blocks input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="image"]):not([type="hidden"]),body .wp-site-blocks textarea,body .wp-site-blocks select{background-color:var(--wp--preset--color--base);color:var(--wp--preset--color--contrast);border:1px solid color-mix(in srgb, var(--wp--preset--color--contrast) 30%, transparent);}
.wp-site-blocks input[type="submit"]:not(.wp-element-button),.wp-site-blocks button[type="submit"]:not(.wp-element-button){background-color:var(--wp--preset--color--accent-2);color:var(--wp--preset--color--base);border-width:0;padding:12px 30px;font-family:inherit;font-size:var(--wp--preset--font-size--medium, 1rem);line-height:inherit;cursor:pointer;}
</style>
		<?php
	},
	99
);
