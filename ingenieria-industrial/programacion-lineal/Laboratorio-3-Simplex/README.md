# Laboratorio virtual 3 | Método Simplex de Maximización (versión 4)

**Programación Lineal | Ingeniería Industrial | Mg. Vicky Ruiz**

## Recorrido pedagógico (11 escenas)

1. ¿Qué es el método simplex? Origen en 1947 con George B. Dantzig, relación con operaciones matriciales y ejemplo de matriz identidad. Registro obligatorio del estudiante.
2. Procedimiento de conversión: holguras para ≤, exceso y artificiales para ≥, artificiales cuando correspondan para =; coeficientes +1, −1, 0 y −M (Gran M en maximización). Alcance de esta práctica.
3. La tabla simplex: Cj, Cb, base, b, Zj, Cj−Zj; columna azul, fila verde, pivote naranja; cómo elegir la razón mínima, el inverso y el opuesto aditivo. Ejemplo numérico de teoría diferente al caso que se resolverá.
4. Cuestionario teórico de siete preguntas con retroalimentación.
5. Caso de la planta de kits: enunciado sin variables asignadas, formulación guiada desde decisiones hasta restricciones.
6. Igualdades: explicación de para qué se necesitan, ejemplos adicionales y dos ecuaciones completas que el estudiante debe escribir y comprobar.
7. Tabla inicial: modelo visible y casillas editables con comprobaciones por fila y columna.
8. Pivoteo del ejemplo: decisión Continuar/Terminar, columna, razón mínima, fila, elemento, operación, inverso, opuesto, filas actualizadas en pantalla, Zj y después Cj−Zj. Historial siempre visible.
9. Evaluación individual con tres productos metalmecánicos y tres recursos, utilizando **el mismo procedimiento interactivo** sin función de revelar soluciones. Redacción obligatoria de interpretación empresarial.
10. Reoptimización de un segundo caso industrial modificando recursos y beneficios.
11. Evidencia final con nombre, ecuaciones escritas, todas las tablas verificadas, operaciones y conclusión personal. Exportación HTML, CSV y guardado en PDF.

## Cómo abrirlo

- Abre `index.html` con Chrome, Edge o Firefox. Funciona sin internet y sin instalar bibliotecas externas.
- Para guardar un **PDF**, al terminar haz clic en **Descargar / guardar en PDF** y selecciona **Guardar como PDF** en el cuadro de impresión del navegador. Se imprimirá únicamente el informe individual, no la interfaz de la aplicación.
- Para obtener también el HTML del informe, usa «Descargar solución en HTML»; este archivo conserva las tablas y cálculos ya comprobados.
- **Descarga antes de cerrar o actualizar**. No existe un sistema de guardado permanente de avances o calificaciones.

## Publicación en GitHub Pages

Sube la carpeta completa `Laboratorio-3-Simplex` con esta estructura:

```text
Laboratorio-3-Simplex/
  index.html
  css/styles.css
  js/app.js
  README.md
```

Por ejemplo, dentro de `Ingenieria-Industrial/Programacion-Lineal/Laboratorio-3-Simplex/`.

## Alcance y limitaciones

- El algoritmo implementado resuelve problemas de **maximización lineal continua** con restricciones **≤**, términos independientes no negativos y variables no negativas. Las formas **≥** o **=** se explican teóricamente, pero los métodos de Gran M y dos fases **no** están implementados en los ejercicios de esta versión.
- Se admiten dos a cuatro variables de decisión y hasta cinco restricciones en el motor; los ejercicios integrados son de dos y tres variables.
- El motor detecta en general el óptimo o un problema no acotado; ante degeneración y ciclos puede aplicar límite de iteraciones. No se debe interpretar como un solucionador universal de programación entera.
- Las tablas se comprueban matemáticamente; la docente debe evaluar la interpretación escrita.
- El nombre y las operaciones permanecen localmente en el navegador durante la sesión. Un archivo local de JavaScript no constituye un sistema de evaluación antifraude.

## Pruebas realizadas

- Recorrido completo en Chromium: registro, cuestionario (7/7), formulación, ecuaciones introducidas y comprobadas, tabla inicial, dos pivoteos guiados y tres pivoteos del ejercicio de evaluación, costos reducidos y selección de finalización.
- Error intencional en el lado derecho de una ecuación: feedback específico en esa restricción y comprobación correcta tras corregir.
- Ejemplo guiado: X1=20, X2=20 y Z=14.000 miles de COP.
- Evaluación metalmecánica: X1=80, X2=60, X3=40, Z=17.400 miles de COP, con los tres recursos usados completamente.
- Informe de prueba en PDF de cinco páginas: contiene tablas 0, 1, 2 y 3 y el historial de operaciones con el nombre de prueba.
- No se ha realizado una prueba manual exhaustiva en todos los navegadores ni una auditoría formal de accesibilidad.
