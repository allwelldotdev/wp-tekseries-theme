# Method column — quote blocks, v1 (archived 2026-10-05)
Setup before the insights redesign: three quote cards (Statista.com 2023, WEF Future of Jobs Report 2025, WEF Job Reset Summit 2020) rendered from a `quotes` array with an `sc-for` loop beside the Method paragraphs. To restore: put each viewport's markup and the `quotes` array back.

## Main.dc.html — markup

```html
<sc-for list="{{ quotes }}" as="q" hint-placeholder-count="3"><figure style="margin:0;background:#FBF7F9;border-radius:20px;padding:22px 24px;display:flex;flex-direction:column;gap:8px"><blockquote style="margin:0;font-size:17px;line-height:1.55;font-weight:500;color:#4A1D5E">{{ q.text }}</blockquote><figcaption style="font-size:14px;font-weight:700;color:#E76F51">{{ q.source }}</figcaption></figure></sc-for>
```

## Main.dc.html — data

```js
      quotes: [
        {text:'“The number of jobs requiring digital skills in Africa is expected to grow in the coming years. According to the forecast, around 28 million and 17 million jobs in Nigeria and Kenya, respectively, would require digital skills by 2030. Such employment opportunities would mainly be in the services sector.”',source:'Statista.com 2023'},
        {text:'“Technology-related roles are the fastest-growing jobs in percentage terms, including Big Data Specialists, Fintech Engineers, AI and Machine Learning Specialists and Software and Application Developers. Green and energy transition roles, including Autonomous and Electric Vehicle Specialists, Environmental Engineers, and Renewable Energy Engineers, also feature within the top fastest-growing roles.”',source:'WEF Future of Jobs Report 2025'},
        {text:'“Africa needs digital skills across the economy, not just the tech sector.”',source:'WEF Job Reset Summit 2020'}],
```

## Tablet.dc.html — markup

```html
<sc-for list="{{ quotes }}" as="q" hint-placeholder-count="3"><figure style="margin:0;background:#FBF7F9;border-radius:18px;padding:20px 22px;display:flex;flex-direction:column;gap:7px"><blockquote style="margin:0;font-size:15px;line-height:1.55;font-weight:500;color:#4A1D5E">{{ q.text }}</blockquote><figcaption style="font-size:13px;font-weight:700;color:#E76F51">{{ q.source }}</figcaption></figure></sc-for>
```

## Tablet.dc.html — data

```js
      quotes: [
        {text:'“The number of jobs requiring digital skills in Africa is expected to grow in the coming years. According to the forecast, around 28 million and 17 million jobs in Nigeria and Kenya, respectively, would require digital skills by 2030. Such employment opportunities would mainly be in the services sector.”',source:'Statista.com 2023'},
        {text:'“Technology-related roles are the fastest-growing jobs in percentage terms, including Big Data Specialists, Fintech Engineers, AI and Machine Learning Specialists and Software and Application Developers. Green and energy transition roles, including Autonomous and Electric Vehicle Specialists, Environmental Engineers, and Renewable Energy Engineers, also feature within the top fastest-growing roles.”',source:'WEF Future of Jobs Report 2025'},
        {text:'“Africa needs digital skills across the economy, not just the tech sector.”',source:'WEF Job Reset Summit 2020'}],
```

## Mobile.dc.html — markup

```html
<sc-for list="{{ quotes }}" as="q" hint-placeholder-count="3"><figure style="margin:0;background:#FBF7F9;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:6px"><blockquote style="margin:0;font-size:14px;line-height:1.55;font-weight:500;color:#4A1D5E">{{ q.text }}</blockquote><figcaption style="font-size:12px;font-weight:700;color:#E76F51">{{ q.source }}</figcaption></figure></sc-for>
```

## Mobile.dc.html — data

```js
      quotes: [
        {text:'“The number of jobs requiring digital skills in Africa is expected to grow in the coming years. According to the forecast, around 28 million and 17 million jobs in Nigeria and Kenya, respectively, would require digital skills by 2030. Such employment opportunities would mainly be in the services sector.”',source:'Statista.com 2023'},
        {text:'“Technology-related roles are the fastest-growing jobs in percentage terms, including Big Data Specialists, Fintech Engineers, AI and Machine Learning Specialists and Software and Application Developers. Green and energy transition roles, including Autonomous and Electric Vehicle Specialists, Environmental Engineers, and Renewable Energy Engineers, also feature within the top fastest-growing roles.”',source:'WEF Future of Jobs Report 2025'},
        {text:'“Africa needs digital skills across the economy, not just the tech sector.”',source:'WEF Job Reset Summit 2020'}],
```
