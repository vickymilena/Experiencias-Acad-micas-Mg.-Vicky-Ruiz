#!/usr/bin/env python3
"""Construye el catálogo de laboratorios y enlaza los índices al publicar.
No modifica ni elimina el contenido pedagógico de ningún laboratorio.
No necesita servicios externos ni dependencias de terceros.
"""
from __future__ import annotations
import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

LAB_PATTERN = re.compile(     r"^laboratorio[-_]+0*(\d+)(?:[-_][^/]+)?$",     re.IGNORECASE )
BAD_DIRS = {".git", ".github", "herramientas", "scripts", "recursos", "assets", "node_modules", "__pycache__", ".venv"}

def limpiar(texto: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", texto)).strip()

def slug_titulo(slug: str) -> str:
    return slug.replace("-", " ").title()

def extraer(html_text: str, patron: str) -> str:
    m = re.search(patron, html_text, re.I | re.S)
    return limpiar(m.group(1)) if m else ""

def info_existente(curso: Path) -> dict:
    """Conservar los títulos y descripciones ya creados por la docente."""
    indice = curso / 'index.html'
    if not indice.is_file():
        return {}
    contenido = indice.read_text(encoding='utf-8', errors='replace')
    info = {}
    for bloque in re.findall(r'<article\b[^>]*>(.*?)</article>', contenido, re.I | re.S):
        m = re.search(r'href\s*=\s*["\'](?:\./)?(laboratorio-\d+)(?:/|/index\.html)?["\']', bloque, re.I)
        if not m:
            continue
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

def datos_laboratorio(lab: Path, prev: dict) -> tuple[str,str]:
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
            print(f'Aviso: {archivo} no contiene JSON válido; se usarán los datos disponibles.')
    if not titulo:
        # Leer solamente la cabecera HTML, no bloques grandes de recursos incrustados.
        head = (lab / 'index.html').read_text(encoding='utf-8', errors='replace')[:20000]
        titulo = extraer(head, r'<title[^>]*>(.*?)</title>')
        titulo = re.sub(r'\s*[|—]\s*Mg\.?\s*Vicky Ruiz\s*$', '', titulo, flags=re.I)
    if not titulo:
        titulo = f'Laboratorio {numero}'
    if not descripcion:
        descripcion = 'Actividad interactiva para practicar y aplicar lo aprendido.'
    return titulo,descripcion

def agregar_script(pagina: Path, raiz: Path, modo: str, ruta: str='') -> None:
    contenido = pagina.read_text(encoding='utf-8', errors='replace')
    if 'data-pagina="' + modo + '"' in contenido:
        return
    relativo = '../' * len(pagina.relative_to(raiz).parent.parts)
    atributo = f' data-ruta="{html.escape(ruta, quote=True)}"' if ruta else ''
    src = f'{relativo}biblioteca.js'
    tag = f'<script src="{src}" data-pagina="{modo}"{atributo} defer></script>'
    if re.search(r'</body\s*>', contenido, re.I):
        contenido = re.sub(r'</body\s*>', tag+'\n</body>', contenido, count=1, flags=re.I)
    else:
        contenido += '\n' + tag + '\n'
    pagina.write_text(contenido,encoding='utf-8')

def nueva_pagina(nombre: str, nivel: str, ruta: str, raiz: Path) -> str:
    profundo = '../' * len(Path(ruta).parts)
    if nivel == 'programa':
        enlaces = f'<a href="{profundo}">← Inicio</a>'
        h2 = 'Selecciona una asignatura'
    else:
        enlaces = f'<a href="../">← Asignaturas</a>'
        h2 = 'Laboratorios disponibles'
    return f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(nombre)} | Mg. Vicky Ruiz</title>
<style>:root{{--navy:#112A46;--teal:#176B80;--gold:#D6A84B}}*{{box-sizing:border-box}}body{{font:16px/1.55 Arial,sans-serif;color:#303A46;margin:0;background:#fcfbf8}}header{{padding:30px 5%;background:var(--navy);color:white}}a{{color:var(--teal)}}header a{{color:#f1d084}}main{{max-width:1100px;margin:40px auto;padding:0 20px}}h2,h3{{color:var(--navy)}}.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px}}.card{{padding:25px;border:1px solid #dce5e8;border-top:6px solid var(--teal);background:white;border-radius:16px;display:flex;flex-direction:column;gap:14px}}.card h3,.card p{{margin:0}}.card p{{color:#5b6672}}.btn{{margin-top:auto;display:inline-block;align-self:flex-start;color:white;background:var(--teal);padding:11px 17px;border-radius:8px;text-decoration:none}}.state{{color:#086754;background:#e8f5f2;border-radius:24px;padding:5px 10px;font-size:12px;font-weight:bold;align-self:flex-start}}</style></head><body><header>{enlaces}<h1>{html.escape(nombre)}</h1><p>Experiencias Académicas · Mg. Vicky Ruiz</p></header><main><h2>{h2}</h2><div class="cards"></div></main></body></html>'''

def construir(raiz: Path, salida: Path) -> dict:
    programas=[]
    for programa in sorted(raiz.iterdir(),key=lambda x:x.name):
        if not programa.is_dir() or programa.name.startswith('.') or programa.name in BAD_DIRS:continue
        asignaturas=[]
        for curso in sorted(programa.iterdir(),key=lambda x:x.name):
            if not curso.is_dir() or curso.name.startswith('.') or curso.name in BAD_DIRS:continue
            referencias=info_existente(curso)
            laboratorios=[]
            for lab in sorted(curso.iterdir(),key=lambda x:int(LAB_PATTERN.match(x.name).group(1)) if LAB_PATTERN.match(x.name) else 10**9):
                if not lab.is_dir() or not LAB_PATTERN.match(lab.name) or not (lab/'index.html').is_file():continue
                titulo, descripcion=datos_laboratorio(lab, referencias.get(lab.name,{}))
                laboratorios.append({'numero':int(LAB_PATTERN.match(lab.name).group(1)), 'carpeta':lab.name,'titulo':titulo,'descripcion':descripcion,'ruta':f'{programa.name}/{curso.name}/{lab.name}'})
            if laboratorios:
                asignaturas.append({'slug':curso.name,'nombre':nombre_curso_desde_programa(programa,curso.name),'tiene_indice':True,'laboratorios':laboratorios})
        if asignaturas:
            nombre=extraer((programa/'index.html').read_text(encoding='utf-8',errors='replace'),r'<h1[^>]*>(.*?)</h1>') if (programa/'index.html').is_file() else slug_titulo(programa.name)
            programas.append({'ruta':programa.name,'nombre':nombre,'asignaturas':asignaturas})
    catalogo={'version':1,'actualizado':datetime.now(timezone.utc).isoformat(),'programas':programas}
    salida.write_text(json.dumps(catalogo,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    # Agregar las líneas de automatización SOLAMENTE a la copia publicada por Actions.
    for p in programas:
        pg=raiz/p['ruta'];index_programa=pg/'index.html'
        if not index_programa.is_file():index_programa.write_text(nueva_pagina(p['nombre'],'programa',p['ruta'],raiz),encoding='utf-8')
        agregar_script(index_programa,raiz,'programa',p['ruta'])
        for a in p['asignaturas']:
            curso=pg/a['slug'];pagina_curso=curso/'index.html'
            if not pagina_curso.is_file():pagina_curso.write_text(nueva_pagina(a['nombre'],'asignatura',f'{p["ruta"]}/{a["slug"]}',raiz),encoding='utf-8')
            agregar_script(pagina_curso,raiz,'asignatura',f'{p["ruta"]}/{a["slug"]}')
    index_inicio=raiz/'index.html'
    if index_inicio.is_file():agregar_script(index_inicio,raiz,'inicio')
    print(f'Generados: {len(programas)} programas, {sum(len(p["asignaturas"]) for p in programas)} asignaturas, '
          f'{sum(len(a["laboratorios"]) for p in programas for a in p["asignaturas"])} laboratorios.')
    return catalogo

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--raiz',default='.')
    parser.add_argument('--salida',default='catalogo.json')
    args=parser.parse_args()
    root=Path(args.raiz).resolve()
    construir(root,root/args.salida)
