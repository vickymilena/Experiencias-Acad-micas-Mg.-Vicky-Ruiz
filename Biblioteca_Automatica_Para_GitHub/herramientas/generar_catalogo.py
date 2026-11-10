#!/usr/bin/env python3
"""Catálogo automático de Experiencias Académicas.

Reconoce la estructura por asignaturas de Ingeniería Industrial y la estructura
por laboratorios independientes de Finanzas. No cuenta copias anidadas de
laboratorios que quedaron subidas en una carpeta equivocada.

Solo modifica la copia temporal que GitHub Actions publica en GitHub Pages.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

LAB_PATTERN = re.compile(r"^laboratorio[\s_-]+0*(\d+)(?:[\s_-]+[^/]+)?$", re.I)
BAD_DIRS = {'.git', '.github', 'herramientas', 'scripts', 'recursos', 'assets',
            'node_modules', '__pycache__', '.venv', 'laboratorios'}


def limpiar(texto: str) -> str:
    return html.unescape(re.sub(r'<[^>]+>', '', texto)).strip()


def slug_titulo(slug: str) -> str:
    return slug.replace('-', ' ').replace('_', ' ').title()


def extraer(html_text: str, patron: str) -> str:
    m = re.search(patron, html_text, re.I | re.S)
    return limpiar(m.group(1)) if m else ''


def info_existente(curso: Path) -> dict:
    indice = curso / 'index.html'
    if not indice.is_file():
        return {}
    contenido = indice.read_text(encoding='utf-8', errors='replace')
    info = {}
    for bloque in re.findall(r'<article\b[^>]*>(.*?)</article>', contenido, re.I | re.S):
        m = re.search(r'href\s*=\s*["\'](?:\./)?(laboratorio-\d+)(?:/|/index\.html)?["\']', bloque, re.I)
        if m:
            info[m.group(1)] = {
                'titulo': extraer(bloque, r'<h3[^>]*>(.*?)</h3>'),
                'descripcion': extraer(bloque, r'<p[^>]*>(.*?)</p>')
            }
    return info


def nombre_curso_desde_programa(programa: Path, slug: str) -> str:
    indice = programa / 'index.html'
    if not indice.is_file():
        return slug_titulo(slug)
    contenido = indice.read_text(encoding='utf-8', errors='replace')
    for bloque in re.findall(r'<article\b[^>]*>(.*?)</article>', contenido, re.I | re.S):
        if re.search(r'href\s*=\s*["\'](?:\./)?' + re.escape(slug) + r'/["\']', bloque, re.I):
            return extraer(bloque, r'<h3[^>]*>(.*?)</h3>') or slug_titulo(slug)
    return slug_titulo(slug)


def indice_laboratorio(lab: Path) -> Path | None:
    """Índice directo o uno dentro de una única subcarpeta de un laboratorio."""
    indice = lab / 'index.html'
    if indice.is_file():
        return indice
    alternativas = sorted(lab.glob('*/index.html'))
    return alternativas[0] if len(alternativas) == 1 else None


def datos_laboratorio(lab: Path, prev: dict, indice: Path | None = None) -> tuple[str, str]:
    numero = LAB_PATTERN.match(lab.name).group(1)
    titulo = prev.get('titulo') or ''
    descripcion = prev.get('descripcion') or ''
    archivo = lab / 'laboratorio.json'
    if archivo.is_file():
        try:
            data = json.loads(archivo.read_text(encoding='utf-8'))
            titulo = (data.get('titulo') or titulo).strip()
            descripcion = (data.get('descripcion') or descripcion).strip()
        except (ValueError, AttributeError):
            print(f'Aviso: JSON inválido en {archivo}; se usarán otros datos.')
    if not titulo:
        head = (indice or lab / 'index.html').read_text(encoding='utf-8', errors='replace')[:20000]
        titulo = extraer(head, r'<title[^>]*>(.*?)</title>')
        titulo = re.sub(r'\s*[|—]\s*Mg\.?\s*Vicky Ruiz\s*$', '', titulo, flags=re.I)
    return (titulo or f'Laboratorio {numero}',
            descripcion or 'Actividad interactiva para practicar y aplicar lo aprendido.')


def nombres_en_portada(raiz: Path) -> dict[str, str]:
    """Lee los nombres de los laboratorios de Finanzas publicados en portada."""
    indice = raiz / 'index.html'
    if not indice.is_file():
        return {}
    contenido = indice.read_text(encoding='utf-8', errors='replace')
    nombres = {}
    for attrs, interior in re.findall(r'<a\b([^>]*)>(.*?)</a>', contenido, re.I | re.S):
        enlace = re.search(r'href\s*=\s*["\']([^"\']+)["\']', attrs, re.I)
        if not enlace:
            continue
        ruta = html.unescape(enlace.group(1)).split('?', 1)[0].split('#', 1)[0].strip('/')
        if ruta.startswith('finanzas/'):
            nombres[ruta] = limpiar(interior).replace('↗', '').strip()
    return nombres


def asignaturas_finanzas(raiz: Path, programa: Path) -> list[dict]:
    """Cuenta únicamente los laboratorios de primera línea bajo finanzas/.

    Una copia subida dentro de mercado-de-divisas/ no se cuenta por segunda vez.
    La carpeta de portada/curso generada durante Pages tampoco se cuenta.
    """
    nombres = nombres_en_portada(raiz)
    laboratorios = []
    carpetas = sorted((d for d in programa.iterdir() if d.is_dir()
                       and not d.name.startswith('.') and d.name not in BAD_DIRS),
                      key=lambda p: p.name.casefold())
    for carpeta in carpetas:
        indice = indice_laboratorio(carpeta)
        if indice is None:
            continue
        ruta_indice = indice.relative_to(programa).as_posix()
        ruta_publica = f'finanzas/{indice.relative_to(programa).parent.as_posix()}/'
        ruta_raiz = f'finanzas/{carpeta.name}/'
        titulo = nombres.get(ruta_publica) or nombres.get(ruta_raiz)
        if not titulo:
            titulo = extraer(indice.read_text(encoding='utf-8', errors='replace')[:10000],
                             r'<title[^>]*>(.*?)</title>')
            titulo = re.sub(r'\s*[|—]\s*Mg\.?\s*Vicky Ruiz\s*$', '', titulo, flags=re.I)
        if not titulo:
            titulo = slug_titulo(carpeta.name)
        laboratorios.append({
            'numero': len(laboratorios) + 1,
            'carpeta': '..',  # Relativo a finanzas/laboratorios/, índice generado en Pages
            'titulo': titulo,
            'descripcion': 'Aprende mediante explicaciones, casos y actividades interactivas.',
            'ruta': f'finanzas/{ruta_indice.removesuffix("/index.html")}',
            'pagina': ruta_indice,
        })
    if not laboratorios:
        return []
    return [{
        'slug': 'laboratorios',
        'nombre': 'Laboratorios de Finanzas',
        'tiene_indice': True,
        'laboratorios': laboratorios,
    }]


def agregar_script(pagina: Path, raiz: Path, modo: str, ruta: str = '') -> None:
    contenido = pagina.read_text(encoding='utf-8', errors='replace')
    if 'data-pagina="' + modo + '"' in contenido:
        return
    relativo = '../' * len(pagina.relative_to(raiz).parent.parts)
    atributo = f' data-ruta="{html.escape(ruta, quote=True)}"' if ruta else ''
    tag = f'<script src="{relativo}biblioteca.js" data-pagina="{modo}"{atributo} defer></script>'
    if re.search(r'</body\s*>', contenido, re.I):
        contenido = re.sub(r'</body\s*>', tag + '\n</body>', contenido, count=1, flags=re.I)
    else:
        contenido += '\n' + tag + '\n'
    pagina.write_text(contenido, encoding='utf-8')


def nueva_pagina(nombre: str, nivel: str, ruta: str, raiz: Path) -> str:
    profundo = '../' * len(Path(ruta).parts)
    if nivel == 'programa':
        enlaces = f'<a href="{profundo}">← Inicio</a>'
        h2 = 'Selecciona una asignatura'
    else:
        enlaces = '<a href="../">← Asignaturas</a>'
        h2 = 'Laboratorios disponibles'
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(nombre)} | Mg. Vicky Ruiz</title>
<style>:root{{--navy:#112A46;--teal:#176B80;--gold:#D6A84B}}*{{box-sizing:border-box}}body{{font:16px/1.55 Arial,sans-serif;color:#303A46;margin:0;background:#fcfbf8}}header{{padding:30px 5%;background:var(--navy);color:white}}a{{color:var(--teal)}}header a{{color:#f1d084}}main{{max-width:1100px;margin:40px auto;padding:0 20px}}h2,h3{{color:var(--navy)}}.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}}.card{{padding:25px;border:1px solid #dce5e8;border-top:6px solid var(--teal);background:white;border-radius:16px;display:flex;flex-direction:column;gap:14px}}.card h3,.card p{{margin:0}}.card p{{color:#5b6672}}.btn{{margin-top:auto;display:inline-block;align-self:flex-start;color:white;background:var(--teal);padding:11px 17px;border-radius:8px;text-decoration:none}}.state{{color:#086754;background:#e8f5f2;border-radius:24px;padding:5px 10px;font-size:12px;font-weight:bold;align-self:flex-start}}</style></head><body><header>{enlaces}<h1>{html.escape(nombre)}</h1><p>Experiencias Académicas · Mg. Vicky Ruiz</p></header><main><h2>{h2}</h2><div class="cards"></div></main></body></html>'''


def actualizar_contador_finanzas(pagina: Path, numero: int) -> None:
    """Mantiene actualizado el rótulo de Finanzas en la portada publicada.

    El HTML del repositorio no se modifica; solo se actualiza la copia Pages.
    """
    contenido = pagina.read_text(encoding='utf-8', errors='replace')
    patron_tarjeta = r'<article\b[^>]*class=["\'][^"\']*card[^"\']*["\'][^>]*>.*?</article>'
    for coincidencia in re.finditer(patron_tarjeta, contenido, re.I | re.S):
        tarjeta = coincidencia.group(0)
        if not re.search(r'<h3[^>]*>\s*Finanzas\s*</h3>', tarjeta, re.I):
            continue
        reemplazo = re.sub(r'<span\s+class=["\']state(?: future)?["\']>.*?</span>',
                          f'<span class="state">{numero} experiencias disponibles</span>',
                          tarjeta, count=1, flags=re.I | re.S)
        if reemplazo != tarjeta:
            pagina.write_text(contenido[:coincidencia.start()] + reemplazo +
                              contenido[coincidencia.end():], encoding='utf-8')
        break


def construir(raiz: Path, salida: Path) -> dict:
    programas = []
    for programa in sorted(raiz.iterdir(), key=lambda p: p.name.casefold()):
        if not programa.is_dir() or programa.name.startswith('.') or programa.name in BAD_DIRS:
            continue
        if programa.name == 'finanzas':
            asignaturas = asignaturas_finanzas(raiz, programa)
        else:
            asignaturas = []
            for curso in sorted(programa.iterdir(), key=lambda p: p.name.casefold()):
                if not curso.is_dir() or curso.name.startswith('.') or curso.name in BAD_DIRS:
                    continue
                referencias = info_existente(curso)
                laboratorios = []
                for lab in sorted(curso.iterdir(),
                                  key=lambda p: int(LAB_PATTERN.match(p.name).group(1))
                                  if LAB_PATTERN.match(p.name) else 10**9):
                    if not lab.is_dir() or not LAB_PATTERN.match(lab.name):
                        continue
                    indice = indice_laboratorio(lab)
                    if indice is None:
                        continue
                    titulo, descripcion = datos_laboratorio(lab, referencias.get(lab.name, {}), indice)
                    laboratorios.append({
                        'numero': int(LAB_PATTERN.match(lab.name).group(1)),
                        'carpeta': lab.name,
                        'titulo': titulo,
                        'descripcion': descripcion,
                        'ruta': f'{programa.name}/{curso.name}/{lab.name}',
                        'pagina': indice.relative_to(lab).as_posix(),
                    })
                if laboratorios:
                    asignaturas.append({
                        'slug': curso.name,
                        'nombre': nombre_curso_desde_programa(programa, curso.name),
                        'tiene_indice': True,
                        'laboratorios': laboratorios,
                    })
        if asignaturas:
            indice_programa = programa / 'index.html'
            nombre = (extraer(indice_programa.read_text(encoding='utf-8', errors='replace'),
                              r'<h1[^>]*>(.*?)</h1>') if indice_programa.is_file()
                      else slug_titulo(programa.name))
            programas.append({'ruta': programa.name, 'nombre': nombre,
                              'asignaturas': asignaturas})

    catalogo = {'version': 2, 'actualizado': datetime.now(timezone.utc).isoformat(),
                'programas': programas}
    salida.write_text(json.dumps(catalogo, ensure_ascii=False, indent=2) + '\n',
                      encoding='utf-8')

    # Solo se modifica el sitio temporal que GitHub Actions publica.
    for p in programas:
        pg = raiz / p['ruta']
        index_programa = pg / 'index.html'
        if not index_programa.is_file():
            index_programa.write_text(nueva_pagina(p['nombre'], 'programa', p['ruta'], raiz),
                                      encoding='utf-8')
        agregar_script(index_programa, raiz, 'programa', p['ruta'])
        for a in p['asignaturas']:
            curso = pg / a['slug']
            curso.mkdir(parents=True, exist_ok=True)
            pagina_curso = curso / 'index.html'
            if not pagina_curso.is_file():
                pagina_curso.write_text(nueva_pagina(a['nombre'], 'asignatura',
                                                    f'{p["ruta"]}/{a["slug"]}', raiz),
                                          encoding='utf-8')
            agregar_script(pagina_curso, raiz, 'asignatura',
                           f'{p["ruta"]}/{a["slug"]}')
    index_inicio = raiz / 'index.html'
    if index_inicio.is_file():
        cantidad_finanzas = sum(len(a['laboratorios'])
                               for p in programas if p['ruta'] == 'finanzas'
                               for a in p['asignaturas'])
        actualizar_contador_finanzas(index_inicio, cantidad_finanzas)
        agregar_script(index_inicio, raiz, 'inicio')
    print(f'Generados: {len(programas)} programas, '
          f'{sum(len(p["asignaturas"]) for p in programas)} asignaturas, '
          f'{sum(len(a["laboratorios"]) for p in programas for a in p["asignaturas"])} laboratorios.')
    return catalogo


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--raiz', default='.')
    parser.add_argument('--salida', default='catalogo.json')
    args = parser.parse_args()
    root = Path(args.raiz).resolve()
    construir(root, root / args.salida)
