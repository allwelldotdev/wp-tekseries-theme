// TekSeries New — window.TekSeries. React 18 components; styles in components/bundle.css.
import type { ReactNode, CSSProperties, MouseEventHandler } from 'react';

interface Base { className?: string; style?: CSSProperties; }

/** Pill button. lg = 14/26px 17px (hero, stat bar); md = 12/22px 16px (cards); sm = 10/18px 16px (header). */
export interface ButtonProps extends Base { variant?: 'primary' | 'soft' | 'dark' | 'accent' | 'outline'; size?: 'sm' | 'md' | 'lg'; href?: string; icon?: string; onClick?: MouseEventHandler; 'aria-label'?: string; children?: ReactNode; }
export declare function Button(p: ButtonProps): JSX.Element;

/** Pill label, e.g. the hero's non-profit badge. */
export interface ChipProps extends Base { tone?: 'saffron' | 'lilac'; icon?: string; children?: ReactNode; }
export declare function Chip(p: ChipProps): JSX.Element;

/** Uppercase section label. coral on white, saffron on plum, ink on saffron. */
export interface EyebrowProps extends Base { tone?: 'coral' | 'saffron' | 'ink'; children?: ReactNode; }
export declare function Eyebrow(p: EyebrowProps): JSX.Element;

/** Header navigation pill; lilac background on hover and when active. */
export interface NavLinkProps extends Base { href?: string; active?: boolean; onClick?: MouseEventHandler; children?: ReactNode; }
export declare function NavLink(p: NavLinkProps): JSX.Element;

/** Material Symbols Rounded glyph by ligature name (hub, lightbulb, work…). */
export interface IconProps extends Base { name: string; size?: number; color?: string; 'aria-label'?: string; }
export declare function Icon(p: IconProps): JSX.Element;

/** Lilac rounded square holding an icon; 60px by default. */
export interface IconTileProps extends Base { name: string; size?: number; }
export declare function IconTile(p: IconTileProps): JSX.Element;

/** Saffron icon + white bold label, used on plum (Share / Create / Solve). */
export interface PillarProps extends Base { icon: string; children?: ReactNode; }
export declare function Pillar(p: PillarProps): JSX.Element;

/** Hero carousel indicator; active dot is a 28px saffron pill. */
export interface SliderDotsProps extends Base { count?: number; active?: number; }
export declare function SliderDots(p: SliderDotsProps): JSX.Element;

/** 44px circular social link for plum grounds. */
export interface SocialButtonProps extends Base { mark: string; label: string; href?: string; }
export declare function SocialButton(p: SocialButtonProps): JSX.Element;

/** Service row: icon tile, title and number on the left, paragraphs on the right. Children as a string split on blank lines. */
export interface ServiceCardProps extends Base { title: string; icon?: string; num?: string; total?: string; layout?: 'row' | 'stack'; children?: ReactNode; }
export declare function ServiceCard(p: ServiceCardProps): JSX.Element;

/** Blush quote block with coral source. */
export interface QuoteCardProps extends Base { source?: string; children?: ReactNode; }
export declare function QuoteCard(p: QuoteCardProps): JSX.Element;

/** Team member card with 104px avatar in a saffron ring; children = bio. */
export interface TeamCardProps extends Base { name: string; role?: string; img?: string; children?: ReactNode; }
export declare function TeamCard(p: TeamCardProps): JSX.Element;

/** Full-width stat: big number, title and subtitle, primary button. */
export interface StatBarProps extends Base { value: string; title: string; subtitle?: string; actionLabel?: string; href?: string; }
export declare function StatBar(p: StatBarProps): JSX.Element;

/** Call-to-action card (saffron, or plum). */
export interface CtaCardProps extends Base { tone?: 'saffron' | 'plum'; eyebrow?: string; title: string; actionLabel?: string; href?: string; children?: ReactNode; }
export declare function CtaCard(p: CtaCardProps): JSX.Element;
