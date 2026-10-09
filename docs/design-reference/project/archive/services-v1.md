# What We Do — services blocks, v1 (archived 2026-10-05)
Setup before the Three Pillars redesign: four service cards (Workshops, Seed Investments, Sponsorships & Maker’s Prize, Job Series) rendered from a `services` data array with an `sc-for` loop. Desktop card = 2 columns (320px title column with icon tile, title and "NN / 04" counter; paragraphs on the right); responsive rule at ≤1100px stacks it. To restore: paste each viewport's markup back in place of the pillars section and put the `services` array back into renderVals().

## Main.dc.html — markup

```html
  <section id="services" data-r="gutter anchor" style="padding:48px max(56px,calc((100% - 1440px)/2));display:flex;flex-direction:column;gap:20px">
    <h2 data-r="h2" style="margin:0 0 8px;font-family:'Schibsted Grotesk',sans-serif;font-size:54px;font-weight:800;letter-spacing:-.03em;color:#4A1D5E">What We Do</h2>
    <sc-for list="{{ services }}" as="s" hint-placeholder-count="4">
      <article data-r="service" style="background:#fff;border:1px solid #EADFE6;border-radius:28px;padding:36px 40px;display:grid;grid-template-columns:320px 1fr;gap:40px;font-size:17px;line-height:1.7;color:#3D2A47" style-hover="border-color:#F4A261">
        <div style="display:flex;flex-direction:column;gap:16px"><span style="width:60px;height:60px;border-radius:20px;background:#F1E6EE;display:grid;place-items:center;color:#4A1D5E"><span class="ms" style="font-size:30px">{{ s.icon }}</span></span><h3 style="margin:0;font-family:'Schibsted Grotesk',sans-serif;font-size:32px;font-weight:700;letter-spacing:-.02em;color:#4A1D5E;line-height:1.1">{{ s.title }}</h3><span style="font-size:15px;font-weight:700;color:#E76F51">{{ s.num }} / 04</span></div>
        <div style="display:flex;flex-direction:column;gap:12px"><sc-for list="{{ s.paras }}" as="p" hint-placeholder-count="2"><p style="margin:0">{{ p }}</p></sc-for></div>
      </article>
    </sc-for>
  </section>
```

## Main.dc.html — data

```js
      services: [
        {num:'01',title:'Workshops',icon:'co_present',paras:[
          'Our services are modelled on interactive webinars, live workshops in urban and rural locations, with select local and foreign technology experts and enthusiasts.',
          'These include free introductory workshops in basic digital literacy, functional device use and internet communication; entry level coding for the elementary to secondary school segment, starting with junior building blocks.',
          'Intermediate digital skills for Undergrads, Graduates and Workers on in demand coding series, Web design & Development, Mobile Application Design, Cybersecurity and Cloud Computing.',
          'Upskilling Workshops for Developers, Workers, Practitioners; In continuing education programs, Certifications and Ideation.']},
        {num:'02',title:'Seed Investments',icon:'potted_plant',paras:[
          'Recognising the ever present funding challenge for startups, we continue to scout for impactful entities to invest in or syndicate funding for. We are resolved to make seed investments in stricly viable solutions and help kick start concepts we believe can evolve into mass appeal enterprises.']},
        {num:'03',title:'Sponsorships & Maker’s Prize',icon:'emoji_events',paras:[
          'We have established a program to sponsor promising, but underserved founders to some of the top business accelerator programs. In addition, TekSeries will be organizing an inaugural annual Maker’s Prize. This prize will reward the best Solution Innovation of the year, voted for on crowd sourced basis. This Prize is expected to be sponsored by a rotation of notable local and foreign corporations on an annual basis.']},
        {num:'04',title:'Job Series',icon:'work',paras:[
          'Current data courtesy of Nigeria’s own National Bureau of Statistics, indicates the Youth unemployment rate in Nigeria is at all time high of 42.5%, with under employment at 21.5%. Clearly, this challenge deserves the urgency of now and can only be met by the collective contributions of the public and private sector.',
          'In this regard, we partner with sister organizations to feature employers in need of interns to advanced level tech and related industry workers. The Internships are expected to be a gateway into building potentially long term industry and entrepreneurial careers.',
          'Our Job Series portal will afford employers the ability to post openings for free. Applicants can also create free profiles, post the CVs and Resumes, perform free job searches and attend periodic interview, assessment and CV workshops.']}],
```

## Tablet.dc.html — markup

```html
  <section id="services" style="padding:40px 24px;display:flex;flex-direction:column;gap:18px">
    <h2 style="margin:0 0 6px;font-family:'Schibsted Grotesk',sans-serif;font-size:36px;font-weight:800;letter-spacing:-.03em;color:#4A1D5E">What We Do</h2>
    <sc-for list="{{ services }}" as="s" hint-placeholder-count="4">
      <article style="background:#fff;border:1px solid #EADFE6;border-radius:24px;padding:28px;display:grid;grid-template-columns:1fr;gap:22px;font-size:16px;line-height:1.65;color:#3D2A47" style-hover="border-color:#F4A261">
        <div style="display:flex;flex-direction:column;gap:14px"><span style="width:54px;height:54px;border-radius:18px;background:#F1E6EE;display:grid;place-items:center;color:#4A1D5E"><span class="ms" style="font-size:27px">{{ s.icon }}</span></span><h3 style="margin:0;font-family:'Schibsted Grotesk',sans-serif;font-size:26px;font-weight:700;letter-spacing:-.02em;color:#4A1D5E;line-height:1.12">{{ s.title }}</h3><span style="font-size:14px;font-weight:700;color:#E76F51">{{ s.num }} / 04</span></div>
        <div style="display:flex;flex-direction:column;gap:11px"><sc-for list="{{ s.paras }}" as="p" hint-placeholder-count="2"><p style="margin:0">{{ p }}</p></sc-for></div>
      </article>
    </sc-for>
  </section>
```

## Tablet.dc.html — data

```js
      services: [
        {num:'01',title:'Workshops',icon:'co_present',paras:[
          'Our services are modelled on interactive webinars, live workshops in urban and rural locations, with select local and foreign technology experts and enthusiasts.',
          'These include free introductory workshops in basic digital literacy, functional device use and internet communication; entry level coding for the elementary to secondary school segment, starting with junior building blocks.',
          'Intermediate digital skills for Undergrads, Graduates and Workers on in demand coding series, Web design & Development, Mobile Application Design, Cybersecurity and Cloud Computing.',
          'Upskilling Workshops for Developers, Workers, Practitioners; In continuing education programs, Certifications and Ideation.']},
        {num:'02',title:'Seed Investments',icon:'potted_plant',paras:[
          'Recognising the ever present funding challenge for startups, we continue to scout for impactful entities to invest in or syndicate funding for. We are resolved to make seed investments in stricly viable solutions and help kick start concepts we believe can evolve into mass appeal enterprises.']},
        {num:'03',title:'Sponsorships & Maker’s Prize',icon:'emoji_events',paras:[
          'We have established a program to sponsor promising, but underserved founders to some of the top business accelerator programs. In addition, TekSeries will be organizing an inaugural annual Maker’s Prize. This prize will reward the best Solution Innovation of the year, voted for on crowd sourced basis. This Prize is expected to be sponsored by a rotation of notable local and foreign corporations on an annual basis.']},
        {num:'04',title:'Job Series',icon:'work',paras:[
          'Current data courtesy of Nigeria’s own National Bureau of Statistics, indicates the Youth unemployment rate in Nigeria is at all time high of 42.5%, with under employment at 21.5%. Clearly, this challenge deserves the urgency of now and can only be met by the collective contributions of the public and private sector.',
          'In this regard, we partner with sister organizations to feature employers in need of interns to advanced level tech and related industry workers. The Internships are expected to be a gateway into building potentially long term industry and entrepreneurial careers.',
          'Our Job Series portal will afford employers the ability to post openings for free. Applicants can also create free profiles, post the CVs and Resumes, perform free job searches and attend periodic interview, assessment and CV workshops.']}],
```

## Mobile.dc.html — markup

```html
  <section id="services" style="padding:32px 16px;display:flex;flex-direction:column;gap:16px">
    <h2 style="margin:0 0 4px;font-family:'Schibsted Grotesk',sans-serif;font-size:28px;font-weight:800;letter-spacing:-.03em;color:#4A1D5E">What We Do</h2>
    <sc-for list="{{ services }}" as="s" hint-placeholder-count="4">
      <article style="background:#fff;border:1px solid #EADFE6;border-radius:22px;padding:22px 20px;display:grid;grid-template-columns:1fr;gap:18px;font-size:15px;line-height:1.6;color:#3D2A47" style-hover="border-color:#F4A261">
        <div style="display:flex;flex-direction:column;gap:12px"><span style="width:48px;height:48px;border-radius:16px;background:#F1E6EE;display:grid;place-items:center;color:#4A1D5E"><span class="ms" style="font-size:24px">{{ s.icon }}</span></span><h3 style="margin:0;font-family:'Schibsted Grotesk',sans-serif;font-size:22px;font-weight:700;letter-spacing:-.02em;color:#4A1D5E;line-height:1.15">{{ s.title }}</h3><span style="font-size:13px;font-weight:700;color:#E76F51">{{ s.num }} / 04</span></div>
        <div style="display:flex;flex-direction:column;gap:10px"><sc-for list="{{ s.paras }}" as="p" hint-placeholder-count="2"><p style="margin:0">{{ p }}</p></sc-for></div>
      </article>
    </sc-for>
  </section>
```

## Mobile.dc.html — data

```js
      services: [
        {num:'01',title:'Workshops',icon:'co_present',paras:[
          'Our services are modelled on interactive webinars, live workshops in urban and rural locations, with select local and foreign technology experts and enthusiasts.',
          'These include free introductory workshops in basic digital literacy, functional device use and internet communication; entry level coding for the elementary to secondary school segment, starting with junior building blocks.',
          'Intermediate digital skills for Undergrads, Graduates and Workers on in demand coding series, Web design & Development, Mobile Application Design, Cybersecurity and Cloud Computing.',
          'Upskilling Workshops for Developers, Workers, Practitioners; In continuing education programs, Certifications and Ideation.']},
        {num:'02',title:'Seed Investments',icon:'potted_plant',paras:[
          'Recognising the ever present funding challenge for startups, we continue to scout for impactful entities to invest in or syndicate funding for. We are resolved to make seed investments in stricly viable solutions and help kick start concepts we believe can evolve into mass appeal enterprises.']},
        {num:'03',title:'Sponsorships & Maker’s Prize',icon:'emoji_events',paras:[
          'We have established a program to sponsor promising, but underserved founders to some of the top business accelerator programs. In addition, TekSeries will be organizing an inaugural annual Maker’s Prize. This prize will reward the best Solution Innovation of the year, voted for on crowd sourced basis. This Prize is expected to be sponsored by a rotation of notable local and foreign corporations on an annual basis.']},
        {num:'04',title:'Job Series',icon:'work',paras:[
          'Current data courtesy of Nigeria’s own National Bureau of Statistics, indicates the Youth unemployment rate in Nigeria is at all time high of 42.5%, with under employment at 21.5%. Clearly, this challenge deserves the urgency of now and can only be met by the collective contributions of the public and private sector.',
          'In this regard, we partner with sister organizations to feature employers in need of interns to advanced level tech and related industry workers. The Internships are expected to be a gateway into building potentially long term industry and entrepreneurial careers.',
          'Our Job Series portal will afford employers the ability to post openings for free. Applicants can also create free profiles, post the CVs and Resumes, perform free job searches and attend periodic interview, assessment and CV workshops.']}],
```

## Main.dc.html — responsive rule (inside @media (max-width:1100px))

```css
  [data-r~="service"]{grid-template-columns:1fr!important;padding:28px!important}
```
