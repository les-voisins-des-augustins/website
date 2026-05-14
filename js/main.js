(async () => {
  function formatDate(isoString) {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('fr-BE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function fillTemplate(template, item) {
    const hasDoc  = item.documentUrl && item.documentUrl.trim() !== '';
    const hasDate = item.date && item.date.trim() !== '';
    return template
      .replaceAll('{{title}}',         item.title)
      .replaceAll('{{text}}',          item.text)
      .replaceAll('{{dateIso}}',       hasDate ? item.date : '')
      .replaceAll('{{dateFormatted}}', hasDate ? formatDate(item.date) : 'À définir')
      .replaceAll('{{documentUrl}}',   hasDoc ? item.documentUrl : '#')
      .replaceAll('{{btnClass}}',      hasDoc ? '' : 'card-btn--disabled');
  }

  const [configRes, templateRes] = await Promise.all([
    fetch('data/config.json'),
    fetch('pages/card.html')
  ]);

  const config   = await configRes.json();
  const template = await templateRes.text();

  document.getElementById('intro-title').innerHTML = config.intro;
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  const imp = config.important;
  if (imp && imp.text && imp.text.trim() !== '') {
    document.getElementById('important-section').removeAttribute('hidden');
    document.getElementById('important-text').innerHTML = imp.text;

    if (imp.date && imp.date.trim() !== '') {
      const impDateEl = document.getElementById('important-date');
      impDateEl.textContent = 'Mis à jour le ' + formatDate(imp.date);
      impDateEl.setAttribute('datetime', imp.date);
      impDateEl.removeAttribute('hidden');
    }

    if (imp.link && imp.link.url && imp.link.label) {
      const linkEl = document.getElementById('important-link');
      linkEl.href        = imp.link.url;
      linkEl.textContent = imp.link.label;
      linkEl.removeAttribute('hidden');
    }
  }

  const newsRes = await fetch('data/news.json');
  const news    = await newsRes.json();

  if (news.length > 0) {
    document.getElementById('news-section').removeAttribute('hidden');
    const grid = document.getElementById('news-grid');

    for (const item of news) {
      const html     = fillTemplate(template, item);
      const fragment = document.createRange().createContextualFragment(html);
      grid.appendChild(fragment);
    }
  }
})();
