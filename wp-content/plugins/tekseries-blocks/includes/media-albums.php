<?php
/**
 * Media albums.
 *
 * The gallery shows only the photos and videos an editor has put in an album:
 * a `media_album` term on the attachment. Nothing else in the Media Library
 * (job logos, page images) can reach it. Each album carries the year its media
 * are from (`tekseries_year`), which the gallery's year filter uses; the upload
 * date can't say, because old photos were uploaded years later.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the `media_album` taxonomy and the album year.
 */
function tekseries_blocks_register_media_albums(): void {
	$labels = array(
		'name'                       => __( 'Albums', 'tekseries-blocks' ),
		'singular_name'              => __( 'Album', 'tekseries-blocks' ),
		'menu_name'                  => __( 'Albums', 'tekseries-blocks' ),
		'all_items'                  => __( 'All Albums', 'tekseries-blocks' ),
		'edit_item'                  => __( 'Edit Album', 'tekseries-blocks' ),
		'update_item'                => __( 'Update Album', 'tekseries-blocks' ),
		'add_new_item'               => __( 'Add new Album', 'tekseries-blocks' ),
		'new_item_name'              => __( 'New Album name', 'tekseries-blocks' ),
		'search_items'               => __( 'Search Albums', 'tekseries-blocks' ),
		'popular_items'              => __( 'Popular Albums', 'tekseries-blocks' ),
		'separate_items_with_commas' => __( 'Separate Albums with commas', 'tekseries-blocks' ),
		'add_or_remove_items'        => __( 'Add or remove Albums', 'tekseries-blocks' ),
		'choose_from_most_used'      => __( 'Choose from the most used Albums', 'tekseries-blocks' ),
		'not_found'                  => __( 'No Albums found', 'tekseries-blocks' ),
		'no_terms'                   => __( 'No Albums', 'tekseries-blocks' ),
		'items_list_navigation'      => __( 'Albums list navigation', 'tekseries-blocks' ),
		'items_list'                 => __( 'Albums list', 'tekseries-blocks' ),
		'back_to_items'              => __( 'Back to Albums', 'tekseries-blocks' ),
	);

	register_taxonomy(
		'media_album',
		array( 'attachment' ),
		array(
			'label'                 => __( 'Albums', 'tekseries-blocks' ),
			'labels'                => $labels,
			// Public only so the Media Library offers the field in a file's
			// details (core skips non-public taxonomies there). No archive,
			// no query var, no menu or sitemap entry.
			'public'                => true,
			'publicly_queryable'    => false,
			'hierarchical'          => false,
			'show_ui'               => true,
			'show_in_nav_menus'     => false,
			'show_tagcloud'         => false,
			'show_admin_column'     => true,
			'show_in_rest'          => true,
			'rewrite'               => false,
			'query_var'             => false,
			// Core's default counts an attachment only through a published
			// parent post; gallery files are mostly unattached.
			'update_count_callback' => '_update_generic_term_count',
		)
	);

	register_term_meta(
		'media_album',
		'tekseries_year',
		array(
			'type'              => 'integer',
			'description'       => __( 'Year the album’s photos and videos are from.', 'tekseries-blocks' ),
			'single'            => true,
			'default'           => 0,
			'sanitize_callback' => 'absint',
			'auth_callback'     => static fn( $allowed, $meta_key, $term_id ): bool => current_user_can( 'edit_term', (int) $term_id ),
			'show_in_rest'      => true,
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_media_albums' );

/**
 * Returns an album's year, or 0 when none is set.
 *
 * @param int $term_id Album ID.
 * @return int
 */
function tekseries_blocks_album_year( int $term_id ): int {
	return absint( get_term_meta( $term_id, 'tekseries_year', true ) );
}

/**
 * Prints the Year field's input and help text.
 *
 * @param int $year Saved year, 0 for none.
 */
function tekseries_blocks_album_year_input( int $year ): void {
	?>
	<input type="number" name="tekseries_year" id="tekseries-year" min="1990" max="2100" step="1" value="<?php echo $year ? esc_attr( (string) $year ) : ''; ?>" aria-describedby="tekseries-year-description">
	<p class="description" id="tekseries-year-description"><?php esc_html_e( 'The year these photos and videos are from. The gallery’s year filter uses it.', 'tekseries-blocks' ); ?></p>
	<?php
}

/**
 * Adds the Year field to the "Add new Album" form.
 */
function tekseries_blocks_album_year_add_field(): void {
	?>
	<div class="form-field term-year-wrap">
		<label for="tekseries-year"><?php esc_html_e( 'Year', 'tekseries-blocks' ); ?></label>
		<?php tekseries_blocks_album_year_input( 0 ); ?>
	</div>
	<?php
}
add_action( 'media_album_add_form_fields', 'tekseries_blocks_album_year_add_field' );

/**
 * Adds the Year field to the "Edit Album" form.
 *
 * @param WP_Term $term Album being edited.
 */
function tekseries_blocks_album_year_edit_field( WP_Term $term ): void {
	?>
	<tr class="form-field term-year-wrap">
		<th scope="row"><label for="tekseries-year"><?php esc_html_e( 'Year', 'tekseries-blocks' ); ?></label></th>
		<td><?php tekseries_blocks_album_year_input( tekseries_blocks_album_year( $term->term_id ) ); ?></td>
	</tr>
	<?php
}
add_action( 'media_album_edit_form_fields', 'tekseries_blocks_album_year_edit_field' );

/**
 * Saves the Year field of the album forms.
 *
 * Runs for every way an album is created or edited; only the wp-admin forms
 * post the field, and core has checked their nonce and capability by then.
 *
 * @param int $term_id Album ID.
 */
function tekseries_blocks_save_album_year( int $term_id ): void {
	// phpcs:ignore WordPress.Security.NonceVerification.Missing -- core verified the term form's nonce before firing this hook.
	if ( ! isset( $_POST['tekseries_year'] ) || ! current_user_can( 'edit_term', $term_id ) ) {
		return;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Missing -- as above.
	$year = absint( wp_unslash( $_POST['tekseries_year'] ) );
	if ( $year ) {
		update_term_meta( $term_id, 'tekseries_year', $year );
	} else {
		delete_term_meta( $term_id, 'tekseries_year' );
	}
}
add_action( 'created_media_album', 'tekseries_blocks_save_album_year' );
add_action( 'edited_media_album', 'tekseries_blocks_save_album_year' );
