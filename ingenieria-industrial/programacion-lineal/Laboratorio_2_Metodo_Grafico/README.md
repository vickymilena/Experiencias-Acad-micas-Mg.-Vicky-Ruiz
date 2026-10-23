# Laboratorio 2 · Método gráfico de Programación Lineal

**Asignatura:** Programación Lineal · Ingeniería Industrial, tercer semestre.

Aplicación educativa interactiva con nueve escenas: caso empresarial, plano cartesiano, trazado de restricciones, región factible, cuestionario, resolución guiada, graficador editable, ejercicios autónomos y simulador de decisiones empresariales.

## Inicio rápido

1. Extrae el ZIP completo.
2. Abre `index.html` en Chrome, Edge o Firefox, manteniendo en la misma carpeta `styles.css`, `model.js` y `app.js`.
3. También existe una versión *de un solo archivo* (entregada aparte) llamada `Laboratorio_2_Metodo_Grafico.html`, que no necesita otros archivos.

No se requiere instalar programas ni estar conectado a internet. Los cálculos se ejecutan en el navegador. El progreso de escenas completadas se guarda únicamente en el navegador mediante almacenamiento local cuando está disponible; las respuestas escritas no se suben a ningún servidor.

## Publicación en GitHub Pages

Estructura sugerida dentro de tu repositorio:

```text
ingenieria-industrial/
  programacion-lineal/
    laboratorio-02-metodo-grafico/
      index.html
      styles.css
      model.js
      app.js
      README.md
```

En GitHub, entra a la carpeta donde publicarás el laboratorio, usa **Add file → Upload files** y sube juntos `index.html`, `styles.css`, `model.js` y `app.js`. Confirma con **Commit changes**. Si GitHub Pages ya está activado para la rama y carpeta correspondiente, la dirección del laboratorio será del tipo:

`https://TU-USUARIO.github.io/TU-REPOSITORIO/ingenieria-industrial/programacion-lineal/laboratorio-02-metodo-grafico/`

La ruta real depende de la organización de tu repositorio. GitHub Pages abre `index.html` automáticamente cuando visitas esa carpeta.

## Herramientas

- Graficador de dos variables con un máximo de ocho restricciones editables, relaciones ≤, ≥ o =, no negatividad, semiplanos y vértices.
- Cálculo de máximo y mínimo, detección de infactibilidad, de valor objetivo no acotado y de soluciones múltiples.
- Calculadora de cruces de dos rectas con eliminación algebraica.
- Ocho preguntas con pistas y reintentos.
- Dos ejercicios con comprobación de formulación y solución.
- Simulación antes/después con horas, tableros, utilidades unitarias, costo adicional, reoptimización, holguras y evaluación de la decisión.
- Modo guiado y modo desafío, exportación a HTML e impresión de informe.

## Supuestos y límites de uso

- Se trabajan modelos **lineales continuos de dos variables**. `x ≥ 0` y `y ≥ 0` están siempre presentes.
- Las cantidades pueden ser decimales. Para productos indivisibles se requeriría programación entera.
- Los datos empresariales son didácticos; un caso real requeriría verificar consumo de recursos, demanda, costos y supuestos.
- El simulador compara la **utilidad de producción** entre escenarios y descuenta aparte el costo adicional de la modificación. No calcula precios sombra ni rangos formales de sensibilidad.
- Los resultados se calculan con aritmética de punto flotante y tolerancias para errores numéricos. Se muestran redondeos para lectura; pueden aparecer pequeñas diferencias en modelos casi paralelos o muy mal escalados.
- La evaluación del escrito y la calificación oficial corresponden al docente; la aplicación no interpreta automáticamente la calidad de una recomendación.
- Para entradas decimales en el editor, usa punto (`7.2`) si tu navegador no acepta la coma.

## Verificaciones realizadas

- Verificación independiente de los ejemplos didácticos: carpintería inicial `(40,20; Z=2.200.000)` y ampliada `(30,40; Z=2.400.000)`, maximización `(20,30; Z=1.950 miles de COP)`, minimización `(7,2;8,4; Z=384 miles de COP)`.
- Pruebas de casos especiales y validaciones del modelo mediante `node tests.js` (archivo incluido, opcional para el estudiante).
- Comparación de 250 modelos aleatorios con SciPy `linprog`: 0 discrepancias en factibilidad/no acotación y valor objetivo óptimo.
- Pruebas de interacción y navegación de las nueve escenas en navegador Chromium, incluidas vistas estrechas de celular, entradas vacías y actualización de escenarios.

## Archivos

- `index.html`: estructura de las nueve escenas.
- `styles.css`: apariencia y adaptación a dispositivos.
- `model.js`: motor matemático sin dependencias.
- `app.js`: interacción, gráficas, actividades y simulador.
- `tests.js`: pruebas matemáticas para ejecutar con Node.js, si se desea.
- `README.md`: esta guía.
