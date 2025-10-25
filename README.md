# Diagnóstico de Ciberseguridad para PyMEs

Pequeña aplicación web (HTML/CSS/JS) para evaluar la madurez de ciberseguridad de una PyME y generar una hoja de ruta práctica.

Contenido del repositorio

- `diagnostico_ciberseguridad.html` — Página principal (abrir en el navegador). Contiene la UI y plantillas descargables.
- `styles.css` — Estilos extraídos para la página.
- `frameworkData.js` — Fuente de verdad con el mapeo NIST + 56 controles IG1 (resumen).
- `main.js` — Lógica cliente: flujo del cuestionario, persistencia, generación de resultados y hoja de ruta.

Cómo usar (local)

1. Abra el archivo `diagnostico_ciberseguridad.html` en su navegador (arrastre el archivo al navegador o use "Abrir archivo").
2. Complete opcionalmente los datos de la empresa (empleados, facturación en CLP, sitio, herramientas de almacenamiento). Si desea que la consultoría reciba los resultados, indique su email en "Email de su consultoría".
3. Presione "Comenzar Diagnóstico" y responda las preguntas con Sí / No / No estoy seguro.
4. Puede usar "Volver" para revisar la pregunta anterior.
5. La aplicación guarda el progreso automáticamente y también puede usar "Guardar progreso" y "Cargar progreso".
6. Al finalizar verá la puntuación, el estado por control y una hoja de ruta con pasos prácticos.
7. Opciones de export:
   - "Descargar resultados (JSON)": guarda un archivo .json con el detalle del diagnóstico.
   - "Imprimir / Exportar PDF": abre una vista optimizada y el diálogo de impresión para guardar como PDF.
   - "Enviar a consultoría": abre el cliente de correo local (mailto:) prellenado con un resumen y la lista de controles pendientes. NOTA: el archivo JSON no se adjunta por limitación técnica del cliente de correo; descargue el JSON y adjúntelo manualmente si lo desea.
   - Tema: Use el botón "Modo oscuro" / "Modo claro" en la cabecera para alternar el tema; la preferencia se recordará en su navegador.

Limitaciones y notas técnicas

- La herramienta es 100% cliente (sin servidor). La opción "Enviar a consultoría" usa `mailto:` para abrir el cliente de correo del usuario y no envía datos automáticamente a servidores.
- El guardado utiliza `localStorage` del navegador: los datos quedan en el equipo y navegador donde se ejecutó. No hay sincronización entre dispositivos.
- La exportación a PDF depende del diálogo de impresión del navegador y de que las ventanas emergentes no estén bloqueadas.
- Si necesita envío automático por correo (sin abrir el cliente), necesitaríamos un endpoint de envío (SMTP / API) en servidor. Podemos integrar esa opción si nos proporciona un endpoint seguro y credenciales (recomendado usar un servicio de email con token y HTTPS).

Siguientes mejoras sugeridas

- Añadir import de progreso desde un archivo JSON (para reanudar desde otro equipo).
- Mejorar la plantilla de correo (adjuntar el JSON automáticamente mediante backend seguro).
- Añadir tests automáticos y validación de datos de entrada.

Contacto y soporte

Si desea que revise o personalice la plantilla de correo, integre envío automático o adapte los controles IG1 a su industria, indíquelo y lo planificamos.

---
Versión: 1.0 — Fecha: 2025-10-25
