/* @ds-bundle: {"format":4,"namespace":"TekSeries","components":[{"name":"Button"},{"name":"Chip"},{"name":"Eyebrow"},{"name":"NavLink"},{"name":"Icon"},{"name":"IconTile"},{"name":"Pillar"},{"name":"SliderDots"},{"name":"SocialButton"},{"name":"ServiceCard"},{"name":"QuoteCard"},{"name":"TeamCard"},{"name":"StatBar"},{"name":"CtaCard"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function paras(children) {
    if (typeof children === 'string') {
      return children.split(/\n\s*\n/).map(function (t, i) { return h('p', { key: i }, t); });
    }
    return children;
  }

  function Icon(p) {
    var label = p['aria-label'];
    return h('span', {
      className: cx('ts-icon', p.className),
      style: Object.assign({ fontSize: (p.size || 24) + 'px' }, p.color ? { color: p.color } : null, p.style),
      role: label ? 'img' : undefined,
      'aria-label': label,
      'aria-hidden': label ? undefined : true
    }, p.name);
  }

  function Button(p) {
    var variant = p.variant || 'primary';
    var size = p.size || 'lg';
    return h('a', {
      href: p.href || '#',
      className: cx('ts-btn', 'ts-btn--' + variant, 'ts-btn--' + size, p.className),
      style: p.style,
      onClick: p.onClick,
      'aria-label': p['aria-label']
    }, p.icon ? h(Icon, { name: p.icon, size: 20 }) : null, p.children);
  }

  function Chip(p) {
    return h('span', { className: cx('ts-chip', 'ts-chip--' + (p.tone || 'saffron'), p.className), style: p.style },
      p.icon ? h(Icon, { name: p.icon, size: 18 }) : null, p.children);
  }

  function Eyebrow(p) {
    return h('span', { className: cx('ts-eyebrow', 'ts-eyebrow--' + (p.tone || 'coral'), p.className), style: p.style }, p.children);
  }

  function NavLink(p) {
    return h('a', {
      href: p.href || '#',
      className: cx('ts-nav', p.active ? 'ts-nav--active' : null, p.className),
      style: p.style,
      onClick: p.onClick,
      'aria-current': p.active ? 'page' : undefined
    }, p.children);
  }

  function IconTile(p) {
    var s = p.size || 60;
    return h('span', { className: cx('ts-icontile', p.className), style: Object.assign({ width: s + 'px', height: s + 'px' }, p.style) },
      h(Icon, { name: p.name || p.icon, size: Math.round(s / 2) }));
  }

  function Pillar(p) {
    return h('span', { className: cx('ts-pillar', p.className), style: p.style }, h(Icon, { name: p.icon, size: 22 }), p.children);
  }

  function SliderDots(p) {
    var count = p.count || 3;
    var active = p.active || 0;
    var dots = [];
    for (var i = 0; i < count; i++) dots.push(h('span', { key: i, className: cx('ts-dot', i === active ? 'ts-dot--on' : null) }));
    return h('span', { className: cx('ts-dots', p.className), style: p.style, role: 'presentation' }, dots);
  }

  function SocialButton(p) {
    return h('a', { href: p.href || '#', className: cx('ts-social', p.className), style: p.style, 'aria-label': p.label }, p.mark || p.children);
  }

  function ServiceCard(p) {
    return h('article', { className: cx('ts-card', 'ts-service', p.layout === 'stack' ? 'ts-service--stack' : null, p.className), style: p.style },
      h('div', { className: 'ts-service__head' },
        h(IconTile, { name: p.icon || 'co_present' }),
        h('h3', { className: 'ts-service__title' }, p.title),
        p.num ? h('span', { className: 'ts-service__num' }, p.num + ' / ' + (p.total || '04')) : null),
      h('div', { className: 'ts-service__body' }, paras(p.children)));
  }

  function QuoteCard(p) {
    return h('figure', { className: cx('ts-quote', p.className), style: p.style },
      h('blockquote', null, p.children),
      p.source ? h('figcaption', null, p.source) : null);
  }

  function TeamCard(p) {
    return h('div', { className: cx('ts-card', 'ts-team', p.className), style: p.style },
      p.img ? h('img', { className: 'ts-team__img', src: p.img, alt: p.name || '' }) : h('span', { className: 'ts-team__img', 'aria-hidden': true }),
      h('div', { className: 'ts-team__name' }, p.name),
      p.role ? h('div', { className: 'ts-team__role' }, p.role) : null,
      p.children ? h('p', { className: 'ts-team__bio' }, p.children) : null);
  }

  function StatBar(p) {
    return h('div', { className: cx('ts-card', 'ts-stat', p.className), style: p.style },
      h('span', { className: 'ts-stat__value' }, p.value),
      h('div', { className: 'ts-stat__text' },
        h('span', { className: 'ts-stat__title' }, p.title),
        p.subtitle ? h('span', { className: 'ts-stat__sub' }, p.subtitle) : null),
      p.actionLabel ? h(Button, { variant: 'primary', size: 'lg', href: p.href }, p.actionLabel) : null);
  }

  function CtaCard(p) {
    var tone = p.tone || 'saffron';
    return h('div', { className: cx('ts-cta', 'ts-cta--' + tone, p.className), style: p.style },
      p.eyebrow ? h(Eyebrow, { tone: tone === 'plum' ? 'saffron' : 'ink' }, p.eyebrow) : null,
      h('p', { className: 'ts-cta__title' }, p.title),
      p.children,
      p.actionLabel ? h(Button, { variant: tone === 'plum' ? 'accent' : 'dark', size: 'md', href: p.href }, p.actionLabel) : null);
  }

  window.TekSeries = {
    Button: Button, Chip: Chip, Eyebrow: Eyebrow, NavLink: NavLink, Icon: Icon, IconTile: IconTile,
    Pillar: Pillar, SliderDots: SliderDots, SocialButton: SocialButton, ServiceCard: ServiceCard,
    QuoteCard: QuoteCard, TeamCard: TeamCard, StatBar: StatBar, CtaCard: CtaCard
  };
})();
