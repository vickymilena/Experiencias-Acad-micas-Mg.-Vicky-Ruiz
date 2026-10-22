# Laboratorio 01 — Introducción a la Programación Lineal y Formulación de Modelos

## Archivos
- `index.html`: las nueve escenas y actividades.
- `styles.css`: estilos adaptables a móviles y computadores.
- `app.js`: validación matemática, preguntas, gráficas, simulador e informe.

## Abrirlo
Abre `index.html` con Chrome, Edge o Firefox. No necesita internet ni instalaciones.

## Publicar en GitHub Pages
En el repositorio existente, entra primero en la carpeta `ingeniería-industrial` (con tilde). Dentro sube la carpeta `programacion-lineal` descomprimida. La dirección del laboratorio en GitHub Pages terminará en `/ingeniería-industrial/programacion-lineal/laboratorio-01-introduccion/`. La portada del curso está en `programacion-lineal/index.html` y enlaza al laboratorio. Mantén juntos los tres archivos y respeta las mayúsculas/minúsculas. Los directorios pueden renombrarse, pero conserva `index.html`, `app.js` y `styles.css`.

## Notas pedagógicas
- La escena 1 plantea una decisión; la 2 explica fundamentos; la 3 identifica variables, objetivo, restricciones y no negatividad desde un texto; la 4 contiene siete preguntas con reintentos; la 5 construye un modelo; la 6 simula y grafica; la 7 propone formulación independiente de minimización; la 8 interpreta y recomienda; la 9 descarga evidencia.
- La comprobación de argumentaciones escritas es orientativa (palabras clave), no análisis semántico ni calificación docente.
- El simulador trabaja en dos dimensiones, con variables continuas, demanda máxima no negativa y región acotada. Calcula intersecciones de rectas, descarta puntos inviables y evalúa los vértices factibles. No es un solucionador genérico de programación lineal de N dimensiones.
- La comparación con el escenario original recalcula ambas soluciones; no supone constante el precio sombra.
- No se incluye Gauss-Jordan ni simplex: requieren laboratorios posteriores y no son prerrequisitos de formulación.
- El progreso se guarda opcionalmente en localStorage del navegador. No se envían datos personales a servidores.
- Los datos de las empresas son supuestos didácticos y no corresponden a empresas reales.

## Pruebas recomendadas
1. Caso original: la producción óptima debe ser 30 kg de tradicionales y 10 kg de integrales, con margen $410.000, preparación 50 h y horno 90 h.
2. Escenario de 60 h preparación (manteniendo 90 h de horno): el óptimo debe cambiar a 15 kg tradicionales y 20 kg integrales, margen $415.000.
3. Propuesta 30 kg tradicionales y 20 kg integrales: debe marcar inviabilidad (70 h preparación y 120 h horno).
4. Caso café: Min Z = 2000x + 3000y, x+y≥40, x≤30, y≤35, 0,5x+y≤30; solución x=30 kg, y=10 kg, costo $90.000.
5. Se deben rechazar entradas vacías, negativas, textos no numéricos o límites fuera de rango y ofrecer retroalimentación antes de revelar la solución.
