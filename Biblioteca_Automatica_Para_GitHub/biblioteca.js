
/* Biblioteca automática | Mg. Vicky Ruiz
   Lee catalogo.json generado al publicar en GitHub Pages.
   Conserva las tarjetas existentes y añade solo las que faltan.
*/
(() => {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  const modo = script.dataset.pagina || '';
  const ruta = (script.dataset.ruta || '').replace(/^\/+|\/+$/g, '');
  const base = new URL('.', script.src);
  const urlCatalogo = new URL('catalogo.json', base);

  const normalizar = texto => (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const etiquetaCantidad = n =>
    `${n} ${n === 1 ? 'laboratorio disponible' : 'laboratorios disponibles'}`;

  const crear = (etiqueta, clase, contenido) => {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (contenido !== undefined) nodo.textContent = contenido;
    return nodo;
  };

  const cantidadPrograma = programa =>
    programa.asignaturas.reduce((total, asignatura) =>
      total + asignatura.laboratorios.length, 0);

  const rutaAsignatura = (programa, asignatura) =>
    `${programa.ruta}/${asignatura.slug}`;

  // Reconoce diferentes nombres de carpetas de laboratorios.
  function carpetaLaboratorio(enlace) {
    if (!enlace || /^(?:https?:|mailto:|javascript:|#)/i.test(enlace)) return '';

    const sinParametros = enlace.split(/[?#]/)[0]
      .replace(/^\.\//, '')
      .replace(/\/+$/, '');

    const partes = sinParametros.split('/');

    if (partes.at(-1)?.toLowerCase() === 'index.html') partes.pop();
    if (partes.length !== 1) return '';

    const nombre = partes[0];

    return /^laboratorio[-_]+0*\d+(?:[-_][^/]+)?$/i.test(nombre)
      ? nombre : '';
  }

  function enlaceAsignatura(programa, asignatura, desdePrograma) {
    if (asignatura.tiene_indice) {
      return desdePrograma
        ? `${asignatura.slug}/`
        : new URL(`${rutaAsignatura(programa, asignatura)}/`, base).href;
    }

    const destino = `biblioteca.html?asignatura=${encodeURIComponent(
      rutaAsignatura(programa, asignatura)
    )}`;

    return desdePrograma ? `../${destino}` : new URL(destino, base).href;
  }

  function tarjetaGeneral(titulo, descripcion, enlace, cantidad) {
    const tarjeta = crear('article', 'card available');

    const insignia = crear(
      'span',
      'state',
      cantidad === undefined ? 'Disponible' : etiquetaCantidad(cantidad)
    );

    const encabezado = crear('h3', '', titulo);
    const texto = crear('p', '', descripcion || 'Actividad interactiva de aprendizaje.');
    const boton = crear('a', 'btn', 'Ingresar →');
    boton.href = enlace;

    tarjeta.append(insignia, encabezado, texto, boton);
    return tarjeta;
  }

  // Respeta el diseño del menú de Programación Lineal.
  function tarjetaLaboratorio(laboratorio) {
    const tarjeta = crear('article', 'card');
    const numero = String(laboratorio.numero).padStart(2, '0');

    const insignia = crear(
      'span',
      'tag',
      `Laboratorio ${numero} · Disponible`
    );

    const encabezado = crear('h3', '', laboratorio.titulo);
    const texto = crear('p', '', laboratorio.descripcion);
    const boton = crear('a', 'btn', 'Abrir laboratorio ↗');

    boton.href = `./${encodeURIComponent(laboratorio.carpeta)}/index.html`;

    tarjeta.append(insignia, encabezado, texto, boton);
    return tarjeta;
  }

  function mostrarPrograma(catalogo) {
    const programa = catalogo.programas.find(p => p.ruta === ruta);
    const tarjetas = document.querySelector('.cards');

    if (!programa || !tarjetas) return;

    const encontradas = new Set();

    for (const tarjeta of tarjetas.querySelectorAll(':scope > article')) {
      const encabezado = tarjeta.querySelector('h3');
      if (!encabezado) continue;

      const boton = tarjeta.querySelector('a.btn');
      const href = boton?.getAttribute('href') || '';
      const carpeta = /^(?:\.\/)?([^/?#]+)\/?$/.exec(href)?.[1] || '';

      const asignatura = programa.asignaturas.find(a =>
        a.slug === carpeta ||
        normalizar(a.nombre) === normalizar(encabezado.textContent)
      );

      if (!asignatura) continue;

      encontradas.add(asignatura.slug);
      tarjeta.classList.remove('future');
      tarjeta.classList.add('available');

      let insignia = tarjeta.querySelector('.state');

      if (!insignia) {
        insignia = crear('span', 'state');
        tarjeta.prepend(insignia);
      }

      insignia.textContent = etiquetaCantidad(asignatura.laboratorios.length);

      tarjeta.querySelectorAll('.muted').forEach(n => n.remove());

      if (boton) {
        boton.href = enlaceAsignatura(programa, asignatura, true);
      } else {
        const nuevoBoton = crear('a', 'btn', 'Ingresar →');
        nuevoBoton.href = enlaceAsignatura(programa, asignatura, true);
        tarjeta.append(nuevoBoton);
      }
    }

    for (const asignatura of programa.asignaturas) {
      if (encontradas.has(asignatura.slug)) continue;

      tarjetas.append(tarjetaGeneral(
        asignatura.nombre,
        'Laboratorios y actividades de aprendizaje de la asignatura.',
        enlaceAsignatura(programa, asignatura, true),
        asignatura.laboratorios.length
      ));
    }
  }

  function mostrarAsignatura(catalogo) {
    const partes = ruta.split('/');
    if (partes.length !== 2) return;

    const programa = catalogo.programas.find(p => p.ruta === partes[0]);
    const asignatura = programa?.asignaturas.find(a => a.slug === partes[1]);
    const tarjetas = document.querySelector('.grid, .cards');

    if (!asignatura || !tarjetas) return;

    const existentes = new Set();

    for (const tarjeta of tarjetas.querySelectorAll(':scope > article')) {
      const enlace = tarjeta.querySelector('a[href]')?.getAttribute('href') || '';
      const carpeta = carpetaLaboratorio(enlace);

      if (carpeta) existentes.add(carpeta.toLowerCase());
    }

    for (const laboratorio of asignatura.laboratorios) {
      if (existentes.has(laboratorio.carpeta.toLowerCase())) continue;

      tarjetas.append(tarjetaLaboratorio(laboratorio));
      existentes.add(laboratorio.carpeta.toLowerCase());
    }
  }

  function mostrarBiblioteca(catalogo) {
    const contenedor = document.getElementById('catalogo-contenido');
    if (!contenedor) return;

    const filtro = new URLSearchParams(location.search).get('asignatura');
    contenedor.replaceChildren();

    let cantidadAsignaturas = 0;

    for (const programa of catalogo.programas) {
      for (const asignatura of programa.asignaturas) {
        if (filtro && filtro !== rutaAsignatura(programa, asignatura)) continue;

        cantidadAsignaturas++;

        const seccion = crear('section', 'grupo');
        const rutaTexto = crear('div', 'ruta', programa.nombre);
        const titulo = crear('h2', '', asignatura.nombre);

        const cantidad = crear(
          'p',
          '',
          etiquetaCantidad(asignatura.laboratorios.length)
        );

        const cuadricula = crear('div', 'cards');

        for (const laboratorio of asignatura.laboratorios) {
          const enlace = new URL(`${laboratorio.ruta}/`, base).href;

          cuadricula.append(tarjetaGeneral(
            laboratorio.titulo,
            laboratorio.descripcion,
            enlace
          ));
        }

        seccion.append(rutaTexto, titulo, cantidad, cuadricula);
        contenedor.append(seccion);
      }
    }

    if (!cantidadAsignaturas) {
      contenedor.append(crear(
        'p',
        '',
        'No se encontraron laboratorios para esta asignatura.'
      ));
    }
  }

  function mostrarInicio(catalogo) {
    const total = catalogo.programas.reduce(
      (suma, programa) => suma + cantidadPrograma(programa),
      0
    );

    // Actualiza automáticamente Ingeniería Industrial.
    const programaIndustrial = catalogo.programas.find(p =>
      p.ruta === 'ingenieria-industrial' ||
      normalizar(p.nombre) === 'ingenieria-industrial'
    );

    if (programaIndustrial) {
      const tarjetas = document.querySelectorAll('.catalog article.card');

      for (const tarjeta of tarjetas) {
        const titulo = tarjeta.querySelector('h3');

        if (normalizar(titulo?.textContent) !== 'ingenieria-industrial') {
          continue;
        }

        const insignia = tarjeta.querySelector('.state');

        if (insignia) {
          insignia.textContent = etiquetaCantidad(
            cantidadPrograma(programaIndustrial)
          );
        }
      }
    }

    // Actualiza el texto introductorio de la biblioteca.
    const introduccion = document.querySelector('.section-top > p');

    if (
      introduccion &&
      introduccion.textContent.includes('Laboratorio 1 de Métodos y Tiempos')
    ) {
      introduccion.textContent =
        'Explora experiencias de investigación e Ingeniería Industrial. ' +
        'Esta colección se actualiza con los nuevos laboratorios publicados.';
    }

    // Enlace al catálogo general.
    const navegacion = document.querySelector(
      '.nav-links, .nav, header .wrap'
    );

    if (
      navegacion &&
      !navegacion.querySelector('a[data-biblioteca-link]')
    ) {
      const enlace = crear(
        'a',
        'biblioteca-global-link',
        `Explorar laboratorios (${total}) →`
      );

      enlace.href = new URL('biblioteca.html', base).href;
      enlace.dataset.bibliotecaLink = 'si';

      enlace.style.cssText =
        'color:#176B80;font-weight:700;text-decoration:none';

      navegacion.append(enlace);
    }
  }

  // Carga automática del catálogo generado por GitHub Pages.
  fetch(urlCatalogo.href, { cache: 'no-store' })
    .then(respuesta => {
      if (!respuesta.ok) {
        throw new Error('Catálogo no disponible');
      }
      return respuesta.json();
    })
    .then(catalogo => {
      if (!Array.isArray(catalogo.programas)) {
        throw new Error('El catálogo no tiene el formato esperado');
      }

      if (modo === 'inicio') mostrarInicio(catalogo);
      if (modo === 'programa') mostrarPrograma(catalogo);
      if (modo === 'asignatura') mostrarAsignatura(catalogo);
      if (modo === 'general') mostrarBiblioteca(catalogo);
    })
    .catch(error => {
      console.warn(
        'No se pudo actualizar la biblioteca:',
        error.message
      );

      if (modo === 'general') {
        const contenedor = document.getElementById('catalogo-contenido');

        if (contenedor) {
          contenedor.textContent =
            'No fue posible cargar el catálogo. ' +
            'Verifica la publicación de GitHub Pages.';
        }
      }
    });
})();
