const KITEMS=[{n:1,a:'Reunir artículos del pedido',type:'O',place:'RE',time:3},{n:2,a:'Verificar los artículos',type:'I',place:'RE',time:1},{n:3,a:'Trasladar el conjunto a empaque',type:'T',place:'EM',from:'RE',time:1},{n:4,a:'Esperar la disponibilidad de bolsa',type:'E',place:'EM',time:2},{n:5,a:'Empacar el conjunto',type:'O',place:'EM',time:2},{n:6,a:'Inspeccionar el paquete',type:'I',place:'EM',time:.5},{n:7,a:'Trasladar el paquete al estante',type:'T',place:'PT',from:'EM',time:.5},{n:8,a:'Almacenar el paquete',type:'A',place:'PT',time:null}];
const SYMBOLS={O:'◯',T:'→',I:'□',E:'ᴅ',A:'▽'};const TYPES={O:'Operación',T:'Transporte',I:'Inspección',E:'Espera',A:'Almacenamiento'};
const EVENTS={
 cap:[
 ['CA-01','Cortar las piezas de cuero','O','CU',10],
 ['CA-02','Inspeccionar dimensiones y forma de las piezas','I','CU',2],
 ['CA-03','Transportar las piezas de cuero hasta costura','T','CO',2,'CU'],
 ['CA-04','Esperar disponibilidad del puesto de costura','E','CO',4],
 ['CA-05','Coser las piezas para formar la capellada','O','CO',15],
 ['CA-06','Inspeccionar puntadas y unión de la capellada','I','CO',3],
 ['CA-07','Transportar la capellada al ensamble','T','EN',2,'CO']
 ],
 sole:[
 ['SU-01','Cortar la suela de la lámina de caucho','O','SU',6],
 ['SU-02','Inspeccionar forma y dimensiones de la suela','I','SU',2],
 ['SU-03','Esperar disponibilidad del equipo de preparación','E','SU',3],
 ['SU-04','Lijar la superficie de unión de la suela','O','SU',5],
 ['SU-05','Transportar la suela al área de ensamble','T','EN',2,'SU'],
 ['SU-06','Esperar la llegada de la capellada','E','EN',20]
 ],
 shoe:[
 ['ZA-01','Aplicar adhesivo a las superficies de unión','O','EN',4],
 ['ZA-02','Prensar la capellada y la suela','O','EN',12],
 ['ZA-03','Esperar disponibilidad del inspector','E','EN',6],
 ['ZA-04','Inspeccionar adherencia y alineación','I','EN',3],
 ['ZA-05','Transportar el zapato al área de acabado','T','AC',2,'EN'],
 ['ZA-06','Pulir y limpiar el zapato','O','AC',8],
 ['ZA-07','Colocar la plantilla interior prefabricada','O','AC',2],
 ['ZA-08','Realizar la inspección final del zapato','I','AC',4],
 ['ZA-09','Transportar el zapato a empaque','T','EM',1,'AC'],
 ['ZA-10','Envolver el zapato con papel protector','O','EM',1],
 ['ZA-11','Introducir el zapato en la caja y cerrar','O','EM',3],
 ['ZA-12','Llevar la caja al almacén y descargar','T','PT',2,'EM'],
 ['ZA-13','Almacenar el zapato terminado','A','PT',null]
 ]
};
const REFERENCE_DISTANCE={'CA-03':9,'CA-07':14,'SU-05':12,'ZA-05':8,'ZA-09':6,'ZA-12':10};
const INDUSTRIAL_ACTIVITY_TOTAL=Object.values(EVENTS).reduce((n,arr)=>n+arr.length,0);
const DOCUMENTED_WAITS=Object.values(EVENTS).flat().filter(e=>e[2]==='E');
const AREAS={CU:'Corte de cuero',CO:'Costura',SU:'Preparación de suela',EN:'Ensamble',AC:'Acabado',EM:'Empaque',PT:'Almacén'};
const PROMPTS={
levantamiento:`Actúa como ingeniero industrial senior especializado en estudio de métodos, distribución de planta y levantamiento de información para diagramas de recorrido. Orienta mi trabajo con rigor. TODAVÍA NO DIBUJES NADA.

Voy a adjuntar uno o varios recursos: fotografía del sitio, plano o croquis, cursograma analítico, tabla de actividades o descripción del proceso. Primero revisa íntegramente lo que adjunto. Identifica la información conocida y PREGUNTA SOLO POR LOS DATOS QUE FALTEN, SIN REPETIR PREGUNTAS YA RESPONDIDAS.

1. DATOS FÍSICOS QUE DEBES COMPROBAR: tipo de espacio; largo y ancho en metros; forma y paredes; puertas, accesos y sus anchos; columnas, obstáculos y zonas restringidas; pasillos; medidas y ubicación de cada puesto o equipo; puntos de recepción y entrega; qué puede moverse y qué debe permanecer fijo. Preferiblemente, utiliza coordenadas (x,y) desde una esquina de referencia. Si te adjunto foto, identifica lo que sea visible, pero no inventes medidas ni posiciones ocultas; pide medidas, croquis o fotos adicionales cuando sean necesarios.
2. DATOS DEL PROCESO: qué se sigue (material, persona o equipo), secuencia de actividades, símbolos ASME (operación, transporte, inspección, espera y almacenamiento), origen/destino de cada transporte, distancias y tiempos conocidos, frecuencia de movimientos y posibles ramas paralelas o rutas diferentes. Si falta una distancia, un origen o un símbolo, señálalo y pregunta.
3. HAZ TODAS LAS PREGUNTAS FALTANTES EN UN SOLO MENSAJE numerado, breve y agrupado por espacio, equipos y proceso. No dibujes hasta que se aclaren las medidas indispensables o hayas explicado qué quedará como esquema.
4. DESPUÉS DE MIS RESPUESTAS, crea una matriz con: N.º | Ruta o componente | Actividad (verbo + objeto) | Símbolo | Área | Origen | Destino | Tiempo (min) | Distancia (m) | Frecuencia | Observaciones. Si existen ramas paralelas, elabora matrices separadas. Conserva la secuencia y no agregues transportes inexistentes. Utiliza «Por medir», «Por confirmar» o «Estimado» en las celdas correspondientes; nunca sustituyas un desconocido por cero.
5. ENTREGA: (a) inventario de puestos con dimensiones y ubicaciones; (b) matriz de recorrido; (c) lista de datos confirmados, estimados y pendientes; (d) inconsistencias del cursograma; (e) mediciones que faltan. Muestra la tabla y, si cuentas con herramientas de creación de archivos, genera Matriz_Recorrido.xlsx para descargar. Si no, entrega tabla copiable.
6. Al finalizar, di explícitamente si los datos permiten un plano a escala o solamente esquemático. NO avances a construirlo sin mi respuesta a las preguntas necesarias.`,
actual:`Actúa como ingeniero industrial senior experto en diagramas de recorrido, distribución en planta y XML nativo editable de Draw.io (diagrams.net). Construye el PLANO Y EL DIAGRAMA DE RECORRIDO ACTUAL (AS-IS) a partir de la matriz que adjunto, el cursograma analítico, medidas, croquis o fotografías. NO hagas un flujograma convencional.

ETAPA 1. Comprueba que cuentas con las dimensiones de la planta, ubicación y tamaño de los puestos, accesos y obstáculos, objeto estudiado, secuencia y origen/destino de transportes. Si algo indispensable falta, pregúntame solo eso ANTES de dibujar. Si la imagen no permite medir, no inventes cifras.
ETAPA 2. Dibuja en VISTA SUPERIOR el contorno de planta, paredes, puertas, columnas, equipos, estaciones, almacenes y pasillos. Asigna códigos A1, A2… Usa una escala constante cuando haya datos suficientes (por ejemplo, 1 m = 20 unidades de dibujo). Si solo hay estimaciones, identifícalo como ESQUEMÁTICO.
ETAPA 3. Coloca en la estación correspondiente CADA actividad numerada del cursograma y su símbolo convencional: ◯ operación; → transporte; □ inspección; D espera; ▽ almacenamiento. Varios símbolos pueden pertenecer al mismo puesto. Mantén los códigos del cursograma; evita superposiciones.
ETAPA 4. Dibuja rutas con flechas por los espacios transitables. Respeta puntos de entrega y recogida; no atravieses paredes ni máquinas. Conserva rutas separadas cuando existan ramas paralelas y crea una vista consolidada si resulta útil. Diferencia rutas mediante colores y marca claramente su sentido. No alteres el plano sin autorización.
ETAPA 5. Mide cada segmento de la ruta usando la escala del plano y presenta la suma de los segmentos: código de transporte, origen, destino, segmentos (m) y total (m). No utilices la distancia en línea recta si hay obstáculos. Si no puedes establecer una medida, escribe «Por medir».
ETAPA 6. Añade un cuadro resumen por símbolo, distancia total, tramos más largos, retrocesos y cruces geométricos. Distingue un cruce de líneas de una congestión demostrada. Señala hasta cinco problemas sustentados en datos disponibles.
ETAPA 7. ENTREGA XML NATIVO DE DRAW.IO, sin comprimir, con <mxfile>, <diagram>, <mxGraphModel> y <mxCell>, identificadores únicos y formas editables (no una imagen estática). Si puedes crear archivos, entrega AS-IS_Recorrido.drawio; si no, explica cómo guardar el XML en un .drawio UTF-8. Verifica la estructura del XML; si no has podido abrirlo en Draw.io, no afirmes que lo probaste. Añade instrucciones breves de apertura y edición.

No inventes actividades, distancias, tiempos, accesos ni condiciones de seguridad. Si hay contradicciones entre foto, matriz y medidas, indícalas y pregunta antes de continuar.`,
mejora:`Actúa como ingeniero industrial senior experto en mejora de métodos, distribución de planta y creación de XML editable en Draw.io. Debes estudiar el diagrama ACTUAL (AS-IS), su cursograma analítico y los datos que adjunto, y construir una propuesta MEJORADA (TO-BE) viable y justificable.

1. ANTES DE CAMBIAR ALGO, revisa el archivo .drawio o XML actual, la matriz, distancias, escala y restricciones. Pregunta lo que falte: equipos fijos, puertas, servicios industriales, ventilación, seguridad, espacio, inspecciones obligatorias, presupuesto cuando aplique y secuencias que no pueden cambiar. No inventes restricciones.
2. Diagnostica transportes extensos, cruces, retrocesos, espacios difíciles y esperas SOLO SI ESTÁN DOCUMENTADAS. Un cruce geométrico no demuestra por sí mismo un conflicto operativo. Distingue observaciones comprobadas de hipótesis.
3. Propón mejoras con criterios de eliminar, combinar, reordenar y simplificar cuando corresponda. Acerca estaciones, reorganiza recorridos o modifica métodos respetando requisitos del proceso. NO elimines inspecciones, pasos necesarios ni transportes sin justificación. Si cambias actividades o secuencia, elabora también el cursograma propuesto. La digitalización de documentos solo aplica a recorridos de información, no sustituye traslados físicos.
4. Dibuja la nueva distribución a la MISMA ESCALA y en el mismo espacio físico del AS-IS. Conserva paredes, puertas y equipos fijos. Representa actividades numeradas, símbolos ASME, flechas y recorridos; destaca en verde las reubicaciones o rutas que cambiaron.
5. Calcula nuevamente las distancias de cada tramo sobre el plano; muestra cada cálculo. Compara en una tabla AS-IS vs TO-BE: actividades por símbolo, número de transportes, distancia total, cruces geométricos comprobables, retrocesos y reducción porcentual = (distancia actual - propuesta) / distancia actual × 100, únicamente si la distancia actual es mayor que cero y las mediciones son comparables. Si conoces frecuencias, incluye además distancia ponderada. No inventes ahorros de tiempo, dinero ni productividad.
6. Para cada cambio indica: qué se movió o modificó, motivo, mejora medible y condición industrial pendiente de verificar. El menor recorrido no certifica por sí solo que la propuesta sea segura o implementable.
7. ENTREGA el XML nativo completo, no comprimido y con objetos editables en Draw.io, más TO-BE_Recorrido.drawio si puedes generar el archivo. Adjunta tabla comparativa, plano mejorado, cursograma propuesto si cambió la secuencia y conclusión técnica. Comprueba coherencia y estructura XML; si no puedes probar el archivo en Draw.io o validar distancias, dilo expresamente.

No sustituyas medidas desconocidas por cifras supuestas sin identificarlas. No conviertas el plano a imagen estática.`,
auditoria:`Actúa como ingeniero industrial senior y auditor académico de diagramas de recorrido. Te adjunto mi cursograma analítico, archivo editable de Draw.io o imágenes del recorrido actual y propuesto, tabla de distancias y mis conclusiones. Evalúa mi trabajo CON EVIDENCIAS, no con suposiciones.

Comprueba: 1. objeto del estudio y alcance; 2. correspondencia de todas las actividades con el cursograma; 3. símbolos y códigos; 4. orígenes, destinos y flechas; 5. separación de rutas paralelas y convergencias; 6. rutas transitables, solo si el plano permite comprobarlo; 7. escala y cálculo por segmentos; 8. validez de la comparación AS-IS/TO-BE; 9. restricciones de puestos y seguridad pendientes; 10. argumentación sin inventar ahorros de tiempo o costos.

Entrégame una tabla con CRITERIO | CORRECTO / REQUIERE CORRECCIÓN / NO VERIFICABLE | EVIDENCIA OBSERVADA | CORRECCIÓN PROPUESTA. Después, presenta hasta cinco hallazgos prioritarios, tres fortalezas y tres preguntas de sustentación. Si no puedes leer un archivo o una medida, dilo y solicita lo necesario. No certifiques un plano real ni me des una calificación definitiva en aspectos que no puedas verificar. Ayúdame a corregir mi trabajo sin sustituir mi razonamiento.`};
