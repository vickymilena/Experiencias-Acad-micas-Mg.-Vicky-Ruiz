/* Biblioteca automática AulaEscena | Mg. Vicky Ruiz
   Lee el catálogo local generado durante la publicación en GitHub Pages.
   No solicita datos personales ni utiliza servicios externos. */
(() => {
  'use strict';
  const current = document.currentScript;
  if (!current) return;
  const mode = current.dataset.pagina || '';
  const ruta = (current.dataset.ruta || '').replace(/^\/+|\/+$/g, '');
  const base = new URL('.', current.src);
  const catalogueURL = new URL('catalogo.json', base);

  const displayName = value => (value || '').split('-').map(w => w ? w[0].toLocaleUpperCase('es') + w.slice(1) : '').join(' ');
  const canonical = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const numLabel = count => `${count} ${count === 1 ? 'laboratorio disponible' : 'laboratorios disponibles'}`;
  const el = (tag, classes, text) => {const node = document.createElement(tag); if (classes) node.className = classes; if (text !== undefined) node.textContent = text; return node;};
  const fullCoursePath = (p, a) => `${p.ruta}/${a.slug}`;
  const courseLink = (p, a, isProgramPage) => a.tiene_indice
    ? (isProgramPage ? `${a.slug}/` : new URL(`${fullCoursePath(p,a)}/`, base).href)
    : (isProgramPage ? `../biblioteca.html?asignatura=${encodeURIComponent(fullCoursePath(p,a))}` : new URL(`biblioteca.html?asignatura=${encodeURIComponent(fullCoursePath(p,a))}`, base).href);

  function makeCard(title, description, url, number) {
    const card = el('article', 'card available');
    const badge = el('span', 'state', number === undefined ? 'Disponible' : numLabel(number));
    const h = el('h3', '', title);
    const p = el('p', '', description || 'Experiencia académica interactiva.');
    const link = el('a', 'btn', 'Ingresar →'); link.href = url;
    card.append(badge, h, p, link);
    return card;
  }

  function renderProgram(catalogue) {
    const p = catalogue.programas.find(x => x.ruta === ruta);
    const cards = document.querySelector('.cards');
    if (!p || !cards) return;
    const seen = new Set();
    for (const card of cards.querySelectorAll(':scope > article')) {
      const heading = card.querySelector('h3');
      if (!heading) continue;
      const link = card.querySelector('a.btn');
      const href = link?.getAttribute('href') || '';
      const fromHref = /^(?:\.\/)?([^/?#]+)\/?$/.exec(href);
      const slug = fromHref?.[1] || canonical(heading.textContent);
      const a = p.asignaturas.find(x => x.slug === slug || canonical(x.nombre) === canonical(heading.textContent));
      if (!a) continue;
      seen.add(a.slug);
      card.classList.remove('future'); card.classList.add('available');
      let badge = card.querySelector('.state');
      if (!badge) { badge=el('span', 'state'); card.prepend(badge); }
      badge.textContent = numLabel(a.laboratorios.length);
      for (const item of card.querySelectorAll('.muted')) item.remove();
      if (link) link.href = courseLink(p,a,true);
      else {const next = el('a','btn','Ingresar →');next.href=courseLink(p,a,true);card.append(next);}
    }
    for (const a of p.asignaturas) {
      if (seen.has(a.slug)) continue;
      cards.append(makeCard(a.nombre, 'Laboratorios y actividades de aprendizaje de la asignatura.', courseLink(p,a,true), a.laboratorios.length));
    }
  }

  function renderCourse(catalogue) {
    const parts = ruta.split('/');
    if (parts.length !== 2) return;
    const p = catalogue.programas.find(x => x.ruta === parts[0]);
    const a = p?.asignaturas.find(x => x.slug === parts[1]);
    const cards = document.querySelector('.cards');
    if (!a || !cards) return;
    const seen = new Set();
    for (const card of cards.querySelectorAll(':scope > article')) {
      const href = card.querySelector('a[href]')?.getAttribute('href') || '';
      const m = /^(?:\.\/)?(laboratorio-\d+)\/?(?:index\.html)?(?:[?#].*)?$/.exec(href);
      if (m) seen.add(m[1]);
    }
    for (const lab of a.laboratorios) {
      if (seen.has(lab.carpeta)) continue;
      cards.append(makeCard(lab.titulo,lab.descripcion,`${lab.carpeta}/`));
    }
  }

  function renderGlobal(catalogue) {
    const mount = document.getElementById('catalogo-contenido');
    if (!mount) return;
    const param = new URLSearchParams(location.search).get('asignatura');
    mount.replaceChildren();
    let displayed = 0;
    for (const p of catalogue.programas) {
      for (const a of p.asignaturas) {
        if (param && param !== fullCoursePath(p,a)) continue;
        displayed++;
        const section = el('section', 'grupo');
        const small = el('div','ruta',p.nombre);
        const heading = el('h2','',a.nombre);
        const line = el('p','',numLabel(a.laboratorios.length));
        const grid = el('div','cards');
        for (const lab of a.laboratorios) {
          const link = new URL(`${lab.ruta}/`,base).href;
          grid.append(makeCard(lab.titulo,lab.descripcion,link));
        }
        section.append(small,heading,line,grid);mount.append(section);
      }
    }
    if (!displayed) mount.append(el('p','', 'No se encontraron laboratorios para esta asignatura.'));
  }

  function renderHome(catalogue) {
    const total = catalogue.programas.reduce((n,p) => n + p.asignaturas.reduce((m,a) => m+a.laboratorios.length,0),0);
    const header = document.querySelector('.nav, .nav-links, header .wrap, header nav');
    if (header && !header.querySelector('a[data-biblioteca-link]')) {
      const link = el('a','biblioteca-global-link',`Explorar laboratorios (${total}) →`);
      link.href = new URL('biblioteca.html',base).href;
      link.dataset.bibliotecaLink='si';
      link.style.cssText = 'display:inline-flex;align-items:center;gap:.3em;color:#176B80;font-weight:700;text-decoration:none;padding:8px 12px';
      header.append(link);
    }
  }

  fetch(catalogueURL.href, {cache:'no-store'})
    .then(response => {if (!response.ok) throw new Error('Catálogo no disponible');return response.json();})
    .then(catalogue => {
      if (!Array.isArray(catalogue.programas)) throw new Error('Formato de catálogo incorrecto');
      if (mode === 'programa') renderProgram(catalogue);
      if (mode === 'asignatura') renderCourse(catalogue);
      if (mode === 'general') renderGlobal(catalogue);
      if (mode === 'inicio') renderHome(catalogue);
    })
    .catch(() => {
      if (mode === 'general') {
        const mount = document.getElementById('catalogo-contenido');
        if (mount) mount.textContent='No fue posible cargar el catálogo. Comprueba que GitHub Pages haya terminado de publicar y vuelve a intentarlo.';
      }
      // En las páginas existentes permanecen visibles las tarjetas originales.
    });
})();
