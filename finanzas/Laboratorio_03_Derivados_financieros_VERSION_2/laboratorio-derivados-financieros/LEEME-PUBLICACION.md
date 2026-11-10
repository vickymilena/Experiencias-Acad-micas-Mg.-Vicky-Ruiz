# Escuela de Finanzas desde Cero — Derivados financieros

**Laboratorio interactivo de Forward, Futuros, Opciones Call y Put y Swaps**

## Contenido del paquete

- `index.html`: página principal del laboratorio.
- `styles.css`: identidad visual y adaptación a computador/celular.
- `app.js`: 13 escenas, textos, datos, casos, calculadoras, actividades, comprobaciones, guardado y recuperación.
- `exports.js`: exportación a PDF, Word y alternativa de impresión.
- `vendor/jszip.min.js`: biblioteca local para crear archivos Word válidos; licencia incluida.

No se necesitan servicios externos para ejecutar cálculos, registrar respuestas o generar archivos de Word/PDF. El acceso a recursos externos y el uso de una IA independiente sí necesitan conexión.

## Publicación en GitHub Pages

1. Descarga y descomprime el ZIP.
2. Sube **la carpeta `laboratorio-derivados-financieros` con todos sus archivos y subcarpeta `vendor`** al repositorio GitHub donde se publican los laboratorios. Mantén los nombres originales de los archivos.
3. Si el repositorio ya tiene GitHub Pages activo, el laboratorio abrirá en una dirección con la estructura `https://USUARIO.github.io/REPOSITORIO/laboratorio-derivados-financieros/`.
4. Si aún no está activo, habilítalo en **Settings → Pages**, desde la rama y carpeta que correspondan al repositorio.
5. Si tu índice general de laboratorios no crea vínculos automáticamente, añade un enlace a la carpeta nueva.

**Atención al consecutivo:** actualmente la aplicación usa **Laboratorio 03 como valor provisional**. Antes de publicar, verifica cuál es el número real dentro de tu malla y modifica en `app.js` la línea `const LAB_NUMBER = '03';`. Ese número alimenta la navegación, la portada, el encabezado y los nombres de los archivos exportados.

## Cómo funciona para el estudiante

El estudiante registra su nombre completo en la primera pantalla. El laboratorio conserva respuestas y avance con almacenamiento local del navegador. Los simuladores permiten modificar variables y las cinco misiones de Confecciones Horizonte requieren análisis, cálculos y recomendaciones independientes.

Los botones de descarga generan **Word (.docx)** y **PDF (.pdf)** con el nombre del estudiante, consecutivo, fechas y trabajo registrado. El informe parcial identifica contenidos pendientes. Para teléfonos se ofrecen también botones **Compartir Word**, **Compartir PDF** y **Imprimir / Guardar como PDF**, que funcionan según las capacidades del navegador.

La opción **Descargar respaldo JSON** conserva un archivo editable con el progreso; **Recuperar progreso** restaura ese respaldo en otro dispositivo. El documento Word/PDF no sirve para restaurar el formulario.

La interfaz no solicita cuentas ni claves de IA: contiene prompts universales para copiar al asistente de preferencia del estudiante. El asesor de coberturas integrado funciona mediante reglas educativas, no mediante un modelo de IA conectado.

## Casos incluidos

- **Ejemplo guiado completo:** Don Carlos (fábrica de arepas) y Don Mario (cultivo de maíz), con forward, futuros, call, put y swap.
- **Caso integrador completo:** Confecciones Horizonte S.A.S. con cinco operaciones independientes: máquina importada, algodón, colorantes importados, exportaciones y préstamo.
- **Preguntas y evaluación:** retroalimentación, pistas, validación numérica y reflexión crítica con IA.

## Comprobaciones técnicas realizadas

- Revisión sintáctica de JavaScript.
- Cálculos de control de los cinco retos empresariales en un navegador automatizado.
- Generación y validación de archivos `.docx` y `.pdf` con nombre y contenido de un estudiante ficticio.
- Apertura del documento Word con un procesador compatible y comprobación del encabezado y de los saltos de página.
- Prueba de generación de Word/PDF con vista de navegador de escritorio y con emulación de pantalla móvil de 390 px, sin desplazamiento horizontal no deseado.
- Comprobación del funcionamiento de la calculadora y de las fórmulas de los simuladores.

## Comprobaciones pendientes antes de usarlo con estudiantes

- Prueba **en teléfonos Android y iPhone reales** (Chrome y Safari), especialmente la ubicación del archivo descargado, los permisos y la opción de compartir/guardar.
- Comprobación del guardado local al cerrar y reabrir **la dirección GitHub Pages**, y de la recuperación desde un respaldo JSON entre dos dispositivos.
- Confirmación del número real de laboratorio y su vínculo en el índice general del repositorio.
- Validación académica final de redacción, tiempos de clase y criterios docentes.

**Nota:** el cuestionario y el solucionario de práctica son parte del código JavaScript que se ejecuta en el navegador. Esto permite aprendizaje autónomo y corrección, pero no es adecuado como examen sumativo supervisado que requiera ocultar con seguridad la clave de respuestas.

**Mg. Vicky Ruiz** · Escuela de Finanzas desde Cero

## Actualización 2.0: videos y mapas visuales

- El laboratorio conserva las trece escenas y las cinco misiones completas.
- Es obligatorio subir la carpeta `media/` con los **cuatro videos MP4**, respetando el nombre de los archivos. Los reproductores los buscan localmente; no dependen de YouTube ni de internet cuando todos los archivos están presentes.
- El video de forward se encuentra **antes de su definición**; el de futuros **al iniciar la escena de futuros**; el de opciones **antes del caso Call**; el de swaps **tras su definición inicial**.
- El cuadro comparativo completo tiene desplazamiento horizontal en móviles; las demás escenas y mapas mentales se adaptan a la anchura de pantalla.
- **Derechos de distribución:** antes de subir el repositorio público confirme que tiene autorización para redistribuir los cuatro archivos de video. El hecho de que un archivo se haya entregado para crear el laboratorio no acredita una licencia de publicación pública.
- Como las referencias externas y la disponibilidad de los navegadores pueden cambiar, revisar la reproducción MP4 y las descargas Word/PDF en un dispositivo Android y en un iPhone físico.
