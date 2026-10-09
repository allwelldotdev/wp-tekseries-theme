<?php
/**
 * Job dashboard (WP Job Manager template override): search and "Add job",
 * then a row per job (title and status, date, views, the main action and a
 * menu with the others), or an empty state, and who is signed in. The menu is
 * WP Job Manager's native <details>; a title opens its statistics dialog
 * (WP Job Manager's script, without jQuery). The class names its script and
 * the action handlers look for are kept.
 *
 * @package TekSeries
 *
 * @var WP_Post[] $jobs                  Jobs on this page.
 * @var array     $job_actions           Actions per job ID, each with name, label and URL.
 * @var int       $max_num_pages         Number of pages.
 * @var array     $job_dashboard_columns Column labels by key.
 * @var string    $search_input          Search term.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_style( 'tekseries-blocks-job-dashboard' );

$tekseries_submit = job_manager_user_can_submit_job_listing() ? job_manager_get_permalink( 'submit_job_form' ) : false;
?>
<div id="job-manager-job-dashboard" class="alignwide jm-dashboard ts-dashboard">
	<div class="ts-dashboard__toolbar">
		<form method="get" action="" class="ts-dashboard__search" role="search">
			<label class="ts-job-field">
				<span class="screen-reader-text"><?php esc_html_e( 'Search your jobs', 'tekseries-blocks' ); ?></span>
				<?php echo tekseries_blocks_icon_svg( 'search' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<input type="search" name="search" placeholder="<?php esc_attr_e( 'Search your jobs', 'tekseries-blocks' ); ?>" value="<?php echo esc_attr( $search_input ); ?>">
			</label>
		</form>
		<?php if ( $tekseries_submit ) : ?>
			<a class="ts-job-button" href="<?php echo esc_url( $tekseries_submit ); ?>">
				<?php echo tekseries_blocks_icon_svg( 'add' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php esc_html_e( 'Add job', 'tekseries-blocks' ); ?>
			</a>
		<?php endif; ?>
	</div>

	<?php if ( ! $jobs ) : ?>
		<div class="ts-job-empty">
			<?php echo tekseries_blocks_icon_svg( 'work_history' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<?php if ( '' !== $search_input ) : ?>
				<p class="ts-job-empty__title">
					<?php
					/* translators: %s: search term. */
					echo esc_html( sprintf( __( 'No jobs match “%s”', 'tekseries-blocks' ), $search_input ) );
					?>
				</p>
				<a class="ts-job-empty__clear" href="<?php echo esc_url( remove_query_arg( 'search' ) ); ?>"><?php esc_html_e( 'Show all your jobs', 'tekseries-blocks' ); ?></a>
			<?php else : ?>
				<p class="ts-job-empty__title"><?php esc_html_e( 'You have no job listings yet', 'tekseries-blocks' ); ?></p>
				<?php if ( $tekseries_submit ) : ?>
					<a class="ts-job-empty__clear" href="<?php echo esc_url( $tekseries_submit ); ?>"><?php esc_html_e( 'Post your first job', 'tekseries-blocks' ); ?></a>
				<?php endif; ?>
			<?php endif; ?>
		</div>
	<?php else : ?>
		<div class="job-manager-jobs ts-dashboard__table" role="table" aria-label="<?php esc_attr_e( 'Your job listings', 'tekseries-blocks' ); ?>">
			<div class="ts-dashboard__head" role="row">
				<?php foreach ( $job_dashboard_columns as $tekseries_key => $tekseries_column ) : ?>
					<span class="<?php echo esc_attr( $tekseries_key ); ?>" role="columnheader"><?php echo esc_html( $tekseries_column ); ?></span>
				<?php endforeach; ?>
				<span class="actions" role="columnheader"><?php esc_html_e( 'Actions', 'tekseries-blocks' ); ?></span>
			</div>
			<?php foreach ( $jobs as $tekseries_job ) : ?>
				<div class="jm-dashboard-job ts-dashboard__row" role="row">
					<?php foreach ( $job_dashboard_columns as $tekseries_key => $tekseries_column ) : ?>
						<div class="jm-dashboard-job-column <?php echo esc_attr( $tekseries_key ); ?>" role="cell">
							<?php do_action( 'job_manager_job_dashboard_column_' . $tekseries_key, $tekseries_job ); ?>
						</div>
					<?php endforeach; ?>
					<div class="jm-dashboard-job-column actions job-dashboard-job-actions" role="cell">
						<?php
						$tekseries_actions = $job_actions[ $tekseries_job->ID ] ?? array();
						do_action( 'job_manager_job_dashboard_column_actions', $tekseries_job, $tekseries_actions );
						?>
						<?php if ( $tekseries_actions ) : ?>
							<details class="jm-ui-actions-menu ts-dashboard__menu">
								<summary aria-label="<?php esc_attr_e( 'More actions', 'tekseries-blocks' ); ?>">
									<?php echo tekseries_blocks_icon_svg( 'more_vert' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
								</summary>
								<div class="jm-ui-action-menu__content">
									<?php foreach ( $tekseries_actions as $tekseries_action ) : ?>
										<a class="jm-dashboard-action job-dashboard-action-<?php echo esc_attr( $tekseries_action['name'] ); ?>" href="<?php echo esc_url( $tekseries_action['url'] ); ?>">
											<?php echo tekseries_blocks_icon_svg( tekseries_blocks_job_action_icon( $tekseries_action['name'] ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
											<?php echo esc_html( $tekseries_action['label'] ); ?>
										</a>
									<?php endforeach; ?>
								</div>
							</details>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<?php get_job_manager_template( 'pagination.php', array( 'max_num_pages' => $max_num_pages ) ); ?>

	<p class="ts-dashboard__user">
		<?php
		/* translators: %s: the signed-in user's name, in bold. */
		echo wp_kses_post( sprintf( __( 'Signed in as %s', 'tekseries-blocks' ), '<strong>' . esc_html( wp_get_current_user()->user_login ) . '</strong>' ) );
		?>
	</p>
</div>
