import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outPath = path.join(
  root,
  process.env.ECOHUELLA_DOCX_OUT || "Documentacion_EcoHuella.docx",
);

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const questions = readJson("backend/shared/questions.json");

const now = new Date();
const formattedDate = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
}).format(now);

const modules = questions.modules.map((module) => ({
  id: module.id,
  label: module.label,
  count: module.questions.length,
  questions: module.questions.map((question) => ({
    id: question.id,
    type: question.type,
    text: question.text,
  })),
}));

const screenshots = [
  ["01-login.png", "Pantalla de inicio de sesion", "Acceso de usuarios registrados a la plataforma."],
  ["02-registro.png", "Pantalla de registro", "Carga de datos iniciales para crear una cuenta y mejorar la precision del diagnostico."],
  ["03-inicio.png", "Vista inicial", "Presentacion del diagnostico ambiental y acceso a los recorridos principales."],
  ["04-encuestas.png", "Selector de encuestas", "Eleccion de recorridos por eje ambiental: huella general, agua y desayuno."],
  ["05-dashboard.png", "Dashboard de resultados", "Visualizacion de huella estimada, consumo de agua, desglose y recomendaciones."],
  ["06-admin.png", "Panel administrativo", "Gestion de usuarios, preguntas y parametros desde una cuenta con permisos."],
].map(([filename, title, description], index) => ({
  filename,
  title,
  description,
  relId: `rIdImg${index + 1}`,
  target: `media/${filename}`,
  path: path.join(root, "doc-assets", "screenshots", filename),
}));

const serviceAreas = [
  ["Autenticacion y perfil", "Permite registro, inicio de sesion, consulta y actualizacion de perfil, recuperacion de contrasena y cierre de sesion."],
  ["Encuestas", "Organiza los recorridos de preguntas y evita que un mismo usuario repita una encuesta ya completada."],
  ["Resultados", "Recibe las respuestas, guarda el resultado calculado y permite consultar el historial de evaluaciones."],
  ["Administracion", "Habilita a usuarios con rol administrador a gestionar preguntas, parametros y cuentas."],
  ["Salud del sistema", "Incluye puntos de verificacion para confirmar que la API responde y que la base de datos esta conectada."],
];

const stories = [
  ["Usuario visitante", "Registrarse o iniciar sesion", "Acceder a una cuenta personal y mantener sus resultados vinculados a su perfil."],
  ["Usuario autenticado", "Aceptar terminos y condiciones", "Continuar el uso de la aplicacion con consentimiento informado."],
  ["Usuario autenticado", "Completar una encuesta ambiental", "Responder preguntas de hogar, transporte, alimentacion y residuos para calcular su huella."],
  ["Usuario autenticado", "Completar encuesta de agua", "Registrar habitos semanales vinculados al uso de agua."],
  ["Usuario autenticado", "Completar encuesta de desayuno", "Conocer el impacto estimado de habitos de desayuno."],
  ["Usuario autenticado", "Consultar dashboard", "Visualizar resultados, comparaciones, planetas necesarios, consumo de agua e historial."],
  ["Usuario autenticado", "Actualizar perfil", "Mantener datos personales, ubicacion, objetivo sustentable y avatar."],
  ["Administrador", "Gestionar preguntas", "Crear, editar, activar o eliminar preguntas del cuestionario."],
  ["Administrador", "Gestionar parametros", "Actualizar factores y parametros de calculo de emisiones."],
  ["Administrador", "Gestionar usuarios", "Consultar usuarios, actualizar datos y administrar roles."],
];

const risks = [
  ["Pruebas y validacion", "Antes de un uso institucional amplio conviene incorporar pruebas formales sobre autenticacion, calculo de resultados, permisos y flujos principales."],
  ["Gestion de claves", "Las claves de acceso, conexion a base de datos y correo deben mantenerse fuera del codigo y administrarse mediante variables de entorno seguras."],
  ["Accesos permitidos", "En produccion se recomienda limitar el acceso de la API al dominio oficial de la aplicacion."],
  ["Politica de datos", "La aplicacion trabaja con informacion de perfil y respuestas de encuesta, por lo que se recomienda formalizar criterios de privacidad, conservacion y eliminacion."],
  ["Factores ambientales", "Los factores usados para estimar impacto deben validarse con fuentes institucionales o bibliografia aprobada si se requiere precision academica formal."],
];

const xmlEscape = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const para = (text = "", opts = {}) => {
  const style = opts.style ? `<w:pStyle w:val="${opts.style}"/>` : "";
  const align = opts.align ? `<w:jc w:val="${opts.align}"/>` : "";
  const spacing = `<w:spacing w:before="${opts.before ?? 0}" w:after="${opts.after ?? 120}" w:line="${opts.line ?? 276}" w:lineRule="auto"/>`;
  const keep = opts.keepNext ? "<w:keepNext/>" : "";
  const pPr = `<w:pPr>${style}${align}${keep}${spacing}</w:pPr>`;
  const bold = opts.bold ? "<w:b/>" : "";
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : "";
  const size = opts.size ? `<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>` : "";
  return `<w:p>${pPr}<w:r><w:rPr>${bold}${color}${size}</w:rPr><w:t xml:space="preserve">${xmlEscape(text)}</w:t></w:r></w:p>`;
};

const heading = (text, level = 1) => para(text, { style: `Heading${level}`, keepNext: true, after: level === 1 ? 140 : 100 });

const bullet = (text) =>
  `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:t xml:space="preserve">- ${xmlEscape(text)}</w:t></w:r></w:p>`;

const pageBreak = () => '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

const imageBlock = (shot) => {
  const cx = 5669280;
  const cy = 3937000;
  return [
    para(shot.title, { bold: true, color: "1F6B4D", after: 80, keepNext: true }),
    `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="80"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${shot.relId.replace("rIdImg", "")}" name="${xmlEscape(shot.title)}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="${xmlEscape(shot.filename)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${shot.relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`,
    para(shot.description, { color: "607D6B", size: 20, after: 220 }),
  ].join("");
};

const cell = (content, width, opts = {}) => {
  const fill = opts.fill ? `<w:shd w:fill="${opts.fill}"/>` : "";
  const color = opts.color ? `<w:color w:val="${opts.color}"/>` : "";
  const bold = opts.bold ? "<w:b/>" : "";
  const align = opts.align ? `<w:jc w:val="${opts.align}"/>` : "";
  const paragraphs = Array.isArray(content) ? content : [content];
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${fill}<w:vAlign w:val="center"/><w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar></w:tcPr>${paragraphs
    .map((item) => `<w:p><w:pPr>${align}<w:spacing w:after="40" w:line="250" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${bold}${color}</w:rPr><w:t xml:space="preserve">${xmlEscape(item)}</w:t></w:r></w:p>`)
    .join("")}</w:tc>`;
};

const table = (headers, rows, widths) => {
  const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join("");
  const headerRow = `<w:tr>${headers.map((header, index) => cell(header, widths[index], { fill: "1F6B4D", color: "FFFFFF", bold: true })).join("")}</w:tr>`;
  const bodyRows = rows
    .map((row, rowIndex) => `<w:tr>${row.map((value, index) => cell(value, widths[index], { fill: rowIndex % 2 === 0 ? "F6FAF7" : "FFFFFF" })).join("")}</w:tr>`)
    .join("");
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblLook w:firstRow="1" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${headerRow}${bodyRows}</w:tbl>`;
};

const callout = (title, body) =>
  `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="8" w:color="B9DDA0"/><w:left w:val="single" w:sz="24" w:color="1F6B4D"/><w:bottom w:val="single" w:sz="8" w:color="B9DDA0"/><w:right w:val="single" w:sz="8" w:color="B9DDA0"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="9000"/></w:tblGrid><w:tr>${cell([title, body], 9000, { fill: "EFF7F1", bold: false })}</w:tr></w:tbl>`;

const toc = [
  "1. Resumen ejecutivo",
  "2. Alcance funcional",
  "3. Historias de usuario",
  "4. Arquitectura e infraestructura",
  "5. Modelo de datos",
  "6. API y servicios",
  "7. Seguridad",
  "8. Operacion y despliegue",
  "9. Riesgos, pendientes y recomendaciones",
  "10. Detalle de encuestas",
];

const docBody = [
  para("EcoHuella", { style: "Title", align: "center", after: 80 }),
  para("Documentacion tecnica y funcional de la aplicacion", { style: "Subtitle", align: "center", after: 420 }),
  table(
    ["Campo", "Detalle"],
    [
      ["Proyecto", "EcoHuella"],
      ["Tipo de documento", "Informe de documentacion de aplicacion"],
      ["Fecha", formattedDate],
      ["Destinatario", "Coordinacion academica y equipo evaluador"],
      ["Objetivo", "Explicar el desarrollo, las historias de usuario, la infraestructura, la documentacion funcional y los aspectos de seguridad de la aplicacion."],
    ],
    [2600, 6200],
  ),
  para("", { after: 180 }),
  callout(
    "Proposito del documento",
    "Este documento resume el estado actual de la aplicacion EcoHuella para que el equipo de coordinacion pueda interiorizarse en su funcionamiento, arquitectura, alcance, infraestructura y controles de seguridad implementados."
  ),
  pageBreak(),
  heading("Indice", 1),
  ...toc.map((item) => bullet(item)),
  pageBreak(),
  heading("1. Resumen ejecutivo", 1),
  para("EcoHuella es una aplicacion web educativa orientada a que una persona pueda reconocer y estimar su impacto ambiental cotidiano. La propuesta se apoya en encuestas simples que traducen habitos de vida en resultados comprensibles, como huella de carbono, consumo estimado de agua, comparaciones contra referencias generales y recomendaciones de mejora."),
  para("El sistema no se limita a mostrar un formulario: organiza un recorrido completo. El usuario crea una cuenta, acepta las condiciones de uso, responde encuestas tematicas, visualiza un tablero con resultados e historial, y recibe sugerencias para reducir su impacto. A su vez, el equipo administrador cuenta con herramientas para gestionar usuarios, preguntas y parametros de calculo."),
  para("La aplicacion fue pensada como una solucion full stack: una interfaz web para la experiencia del usuario, una API que concentra la logica de acceso y persistencia, y una base de datos que conserva usuarios, resultados y configuraciones administrables. Esta separacion permite explicar, mantener y escalar cada parte del sistema de manera ordenada."),
  heading("2. Alcance funcional", 1),
  bullet("Registro, login, cierre de sesion y recuperacion de contrasena por codigo enviado por correo."),
  bullet("Aceptacion de terminos y condiciones por usuario autenticado."),
  bullet("Encuesta ambiental general: hogar, transporte, alimentacion y residuos."),
  bullet("Encuesta de consumo de agua: lavarropas, riego y lavado de auto."),
  bullet("Encuesta de desayuno: bebida, alimento principal, origen y desperdicio."),
  bullet("Dashboard con huella total, desglose por categoria, comparacion contra media, planetas estimados, consumo de agua e historial."),
  bullet("Panel administrador para gestion de usuarios, preguntas y parametros de emision."),
  heading("Modulos de encuesta", 2),
  table(
    ["Modulo", "Etiqueta", "Cantidad de preguntas"],
    modules.map((module) => [module.id, module.label, String(module.count)]),
    [2600, 4200, 2200],
  ),
  heading("Evidencia visual de la aplicacion", 2),
  para("A continuacion se incorporan capturas representativas de las pantallas principales para facilitar la comprension visual del sistema durante la revision."),
  ...screenshots.flatMap((shot, index) => [
    index > 0 && index % 2 === 0 ? pageBreak() : "",
    imageBlock(shot),
  ]),
  heading("3. Historias de usuario", 1),
  table(["Actor", "Historia", "Valor esperado"], stories, [1900, 3100, 4300]),
  heading("4. Arquitectura e infraestructura", 1),
  para("La solucion se organiza bajo un modelo cliente-servidor. La capa cliente corresponde a la aplicacion web que utiliza el usuario desde el navegador. La capa servidor recibe las solicitudes, valida accesos, aplica reglas de negocio y comunica la informacion con la base de datos. Esta division permite separar la experiencia visual de la logica sensible del sistema."),
  table(
    ["Componente", "Responsabilidad dentro del sistema"],
    [
      ["Interfaz web", "Presenta las pantallas de login, registro, encuestas, dashboard, perfil, terminos y administracion. Es la parte visible de la aplicacion."],
      ["Servicio de comunicacion", "Conecta la interfaz con el servidor y agrega automaticamente la credencial del usuario cuando corresponde."],
      ["Servidor / API", "Centraliza las solicitudes del sistema: autenticacion, autorizacion, resultados, preguntas, parametros y usuarios."],
      ["Base de datos", "Guarda usuarios, respuestas, resultados, preguntas y parametros de calculo para que la informacion no dependa solo del navegador."],
      ["Servicio de correo", "Permite enviar codigos de recuperacion de contrasena al correo registrado del usuario."],
      ["Entorno de despliegue", "Separa frontend, backend y base de datos para facilitar publicacion, mantenimiento y monitoreo."],
    ],
    [2600, 6400],
  ),
  heading("Criterio de organizacion", 2),
  para("La estructura del proyecto separa componentes visuales, servicios, contexto de autenticacion, datos de encuesta, utilidades de calculo y modulo administrativo. En el backend se separan modelos, controladores, rutas, middleware y configuracion de base de datos. Esta organizacion facilita que el equipo pueda explicar que hace cada bloque sin mezclar responsabilidades."),
  heading("Infraestructura prevista", 2),
  para("Para una publicacion accesible por internet, el frontend puede alojarse como sitio web estatico, el backend como servicio web y la base de datos como servicio administrado en la nube. Esta division permite actualizar la interfaz sin modificar la base de datos, mantener protegidas las credenciales del servidor y revisar el estado de la API mediante rutas de salud."),
  heading("5. Modelo de datos", 1),
  table(
    ["Coleccion / modelo", "Campos principales", "Descripcion"],
    [
      ["User", "name, username, email, password, role, perfil, avatar, resetPasswordToken", "Usuarios registrados. Incluye rol user/admin y datos personales opcionales."],
      ["QuizResult", "userId, answers, results, metadata, completedAt", "Resultados de encuestas por usuario con valores calculados y metadatos del recorrido."],
      ["Question", "id, module, text, type, options, parameters, order, active", "Banco administrable de preguntas y opciones."],
      ["EmissionParameter", "category, parameters, region, version, active", "Parametros de calculo por categoria ambiental."],
    ],
    [2100, 3600, 3600],
  ),
  heading("Calculo de resultados", 2),
  para("El calculo principal se ejecuta a partir de las respuestas del usuario y de factores definidos para cada categoria. Luego se guarda un resultado normalizado para que pueda consultarse desde el historial del usuario."),
  bullet("Hogar: electricidad, calefaccion, cantidad de personas y uso de energia renovable."),
  bullet("Transporte: medio principal, distancia semanal, vuelos y ocupacion del vehiculo."),
  bullet("Alimentacion: tipo de dieta, procedencia de alimentos y desperdicio semanal."),
  bullet("Residuos: reciclaje, frecuencia de compras y reparacion/segunda mano."),
  bullet("Agua: estimacion anual en litros y metros cubicos segun habitos semanales."),
  heading("6. API y servicios", 1),
  para("La API funciona como intermediaria entre la interfaz y la base de datos. Su objetivo es evitar que el navegador acceda directamente a informacion sensible y concentrar en el servidor las reglas de autenticacion, autorizacion y persistencia."),
  table(["Area de servicio", "Funcion principal"], serviceAreas, [2800, 6200]),
  para("Las operaciones se agrupan por responsabilidad: autenticacion, preguntas, parametros, resultados y usuarios. Las acciones administrativas requieren permisos especiales, mientras que las acciones personales solo pueden ejecutarse sobre los datos del usuario autenticado."),
  heading("7. Seguridad", 1),
  table(
    ["Control", "Implementacion actual"],
    [
      ["Autenticacion", "El sistema identifica al usuario mediante un token emitido al iniciar sesion."],
      ["Autorizacion", "Las rutas protegidas verifican que exista un usuario valido y las rutas administrativas exigen rol administrador."],
      ["Contrasenas", "Las contrasenas se guardan protegidas mediante hash y se comparan sin exponer el valor original."],
      ["Recuperacion", "La recuperacion de contrasena utiliza un codigo temporal enviado al correo registrado."],
      ["Datos sensibles", "La contrasena no se devuelve en las respuestas del sistema y se mantiene excluida de consultas comunes."],
      ["Validaciones", "Los modelos de datos controlan campos obligatorios, formatos, roles permitidos y limites razonables."],
      ["Disponibilidad", "El backend cuenta con rutas de salud para confirmar si el servicio y la base de datos estan disponibles."],
      ["Configuracion", "Las claves y datos de conexion se gestionan fuera del codigo mediante variables de entorno."],
    ],
    [2500, 6500],
  ),
  heading("Observaciones de seguridad", 2),
  para("La base implementada cubre controles relevantes para un MVP academico. Para una publicacion institucional se recomienda endurecer configuraciones productivas, revisar CORS, exigir secretos fuertes y documentar tratamiento de datos personales."),
  heading("8. Operacion y despliegue", 1),
  para("La operacion de la aplicacion contempla dos escenarios: desarrollo local para trabajo del equipo y despliegue en la nube para acceso publico o demostraciones. En desarrollo, el equipo ejecuta la interfaz y el servidor en la misma maquina. En produccion, cada parte se aloja como servicio independiente."),
  table(
    ["Escenario", "Descripcion"],
    [
      ["Desarrollo local", "Permite al equipo probar cambios de interfaz, backend y base de datos antes de publicarlos."],
      ["Carga inicial de datos", "El sistema dispone de un proceso para crear usuarios de prueba, preguntas y parametros iniciales."],
      ["Frontend publicado", "La interfaz puede alojarse como sitio web accesible desde navegador."],
      ["Backend publicado", "La API puede alojarse como servicio web independiente encargado de procesar solicitudes."],
      ["Base de datos cloud", "La informacion puede persistirse en una base administrada para facilitar disponibilidad y mantenimiento."],
      ["Monitoreo basico", "Las rutas de salud permiten verificar si el servicio esta activo y si existe conexion a la base de datos."],
    ],
    [2700, 6300],
  ),
  heading("Criterios operativos", 2),
  para("Para operar la aplicacion de manera responsable se deben proteger las credenciales, separar ambientes de prueba y produccion, mantener controlado el acceso administrador y documentar cualquier cambio realizado sobre preguntas o parametros de calculo."),
  heading("9. Riesgos, pendientes y recomendaciones", 1),
  table(["Tema", "Situacion observada", "Recomendacion"], risks, [1900, 3900, 3300]),
  heading("10. Detalle de encuestas", 1),
  para("Las encuestas se dividen por ejes de analisis para que el usuario no responda un formulario extenso y desordenado. Cada bloque apunta a un aspecto concreto del impacto ambiental cotidiano."),
  heading("Preguntas incluidas", 2),
  ...modules.flatMap((module) => [
    heading(module.label, 3),
    table(
      ["Pregunta"],
      module.questions.map((question) => [question.text]),
      [9000],
    ),
  ]),
  heading("Cierre", 1),
  para("La aplicacion EcoHuella cuenta con una base funcional completa para presentacion academica y revision tecnica. El sistema cubre el circuito de usuarios, cuestionarios, calculo de impacto, persistencia de resultados y administracion. Para avanzar a un entorno institucional definitivo, se recomienda completar pruebas automatizadas, endurecer configuracion productiva, formalizar politicas de datos y validar factores de emision con fuentes aprobadas."),
].join("");

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${docBody}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
      <w:cols w:space="708"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos" w:cs="Aptos"/><w:sz w:val="22"/><w:color w:val="263238"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="1F6B4D"/><w:sz w:val="56"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:qFormat/><w:rPr><w:color w:val="607D6B"/><w:sz w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/></w:pPr><w:rPr><w:b/><w:color w:val="1F6B4D"/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="100"/></w:pPr><w:rPr><w:b/><w:color w:val="296654"/><w:sz w:val="26"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="180" w:after="80"/></w:pPr><w:rPr><w:b/><w:color w:val="4A6F58"/><w:sz w:val="23"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>
  <w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="6" w:color="D9E6DD"/><w:left w:val="single" w:sz="6" w:color="D9E6DD"/><w:bottom w:val="single" w:sz="6" w:color="D9E6DD"/><w:right w:val="single" w:sz="6" w:color="D9E6DD"/><w:insideH w:val="single" w:sz="4" w:color="D9E6DD"/><w:insideV w:val="single" w:sz="4" w:color="D9E6DD"/></w:tblBorders><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
</w:styles>`;

const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const documentRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  ${screenshots.map((shot) => `<Relationship Id="${shot.relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${shot.target}"/>`).join("\n  ")}
</Relationships>`;

const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Documentacion EcoHuella</dc:title>
  <dc:subject>Documentacion tecnica y funcional</dc:subject>
  <dc:creator>Equipo EcoHuella</dc:creator>
  <cp:lastModifiedBy>Equipo EcoHuella</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now.toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now.toISOString()}</dcterms:modified>
</cp:coreProperties>`;

const appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Word</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <Company>EcoHuella</Company>
</Properties>`;

const files = new Map([
  ["[Content_Types].xml", contentTypesXml],
  ["_rels/.rels", relsXml],
  ["docProps/core.xml", coreXml],
  ["docProps/app.xml", appXml],
  ["word/document.xml", documentXml],
  ["word/_rels/document.xml.rels", documentRelsXml],
  ["word/styles.xml", stylesXml],
]);

for (const shot of screenshots) {
  files.set(`word/${shot.target}`, fs.readFileSync(shot.path));
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

const crc32 = (buffer) => {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
};

const dosDateTime = (date) => {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2)) & 0x1f);
  const dosDate =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0xf) << 5) |
    (date.getDate() & 0x1f);
  return { time, dosDate };
};

const u16 = (value) => {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
};

const u32 = (value) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
};

const makeZip = (entries) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, dosDate } = dosDateTime(now);

  for (const [name, content] of entries) {
    const nameBuffer = Buffer.from(name, "utf8");
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(time),
      u16(dosDate),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuffer.length),
      u16(0),
      nameBuffer,
    ]);
    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(time),
      u16(dosDate),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBuffer.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuffer,
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralDir = Buffer.concat(centralParts);
  const localData = Buffer.concat(localParts);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(entries.size),
    u16(entries.size),
    u32(centralDir.length),
    u32(localData.length),
    u16(0),
  ]);

  return Buffer.concat([localData, centralDir, end]);
};

fs.writeFileSync(outPath, makeZip(files));
console.log(outPath);
