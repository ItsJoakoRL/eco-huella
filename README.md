# EcoHuella

Aplicacion web para estimar la huella de carbono personal con un flujo de cuestionario, calculo de emisiones anuales y recomendaciones dinamicas de mejora.

## Objetivo del proyecto

EcoHuella busca transformar respuestas simples del usuario en un diagnostico claro de impacto ambiental anual.

El MVP cubre:

- Medicion por categorias: hogar, transporte, alimentacion y residuos.
- Visualizacion de resultado total en toneladas de CO2e por anio.
- Comparacion contra media de referencia nacional.
- Equivalencia aproximada en cantidad de planetas necesarios.
- Recomendaciones accionables segun la categoria de mayor impacto.

## Stack tecnico

- React 19
- Vite 8
- Tailwind CSS 4 (via @tailwindcss/postcss)
- PostCSS + Autoprefixer
- ESLint

## Flujo funcional

La app tiene tres pantallas principales:

1. Landing: presenta la propuesta y habilita inicio.
2. Quiz: recorre preguntas definidas en JSON y guarda respuestas.
3. Dashboard: calcula resultados y muestra recomendaciones.

Las pantallas se enrutan con React Router (ver `src/App.jsx`). Las rutas internas exigen sesion iniciada y terminos aceptados; `/admin` ademas exige rol administrador.

## Modelo de datos

El cuestionario vive en un JSON local y se organiza por modulos.

Cada pregunta define:

- id y texto
- tipo de entrada (select, number, range)
- parametros de calculo (factor, impact_modifier, base_yearly_kg, etc.)

Esto permite ajustar reglas y factores sin cambiar la UI.

## Motor de calculo

El dashboard toma respuestas y calcula emisiones anuales por categoria.

Resumen del enfoque:

- Hogar: electricidad + calefaccion, ajustado por personas y renovables.
- Transporte: distancia semanal, medio principal, ocupacion y vuelos.
- Alimentacion: base anual por dieta, procedencia y desperdicio.
- Residuos: base + consumo, modulado por reciclaje y reparacion.

Luego deriva:

- Total en toneladas de CO2e
- Diferencia porcentual vs media de referencia
- Planetas estimados en base a umbral sostenible

## Estructura principal

```text
src/
	components/
		features/
			LandingPage.jsx
			QuizController.jsx
			QuestionCard.jsx
			ResultsDashboard.jsx
		layout/
			Layout.jsx
	data/
		quizData.js
	utils/
		quizResults.js
	index.css
	App.jsx
	main.jsx
backend/
	shared/
		questions.json
		quizCalculator.js
		terms.js
```

`backend/shared/` lo usan el frontend y el servidor: el calculo de la huella y las preguntas viven ahi (Render solo despliega `backend/`), asi el servidor recalcula con la misma logica que ve el usuario.

## Configuracion de estilos

La app usa tokens custom en Tailwind definidos en tailwind.config.js.

En Tailwind v4, el archivo global incluye:

- @import "tailwindcss";
- @config "../tailwind.config.js";

Esto asegura que utilidades personalizadas como bg-surface y text-on-surface funcionen correctamente.

## Requisitos

- Node.js 20 o superior recomendado
- npm 10 o superior recomendado

## Como ejecutar en local

1. Instalar dependencias:

```bash
npm install
```

2. Levantar entorno de desarrollo:

```bash
npm run dev:all
```

En PowerShell de Windows, si `npm` aparece bloqueado, usar:

```powershell
npm.cmd run dev:all
```

Tambien se puede abrir `start-dev.bat`.

3. Abrir http://localhost:8080/login.

## Scripts disponibles

- npm run dev: inicia solo el frontend con HMR.
- npm run dev:all: inicia frontend y backend juntos.
- npm run build: genera build de produccion.
- npm run preview: previsualiza build local.
- npm run lint: ejecuta analisis estatico.

## Estado actual

- MVP funcional con frontend (React) y backend (Express + MongoDB); ver `SETUP.md` para ejecutarlo.
- Las preguntas y los factores del cuestionario viven en `backend/shared/questions.json` y el calculo en `backend/shared/quizCalculator.js` (el frontend lo usa desde `src/utils/quizResults.js`). Las preguntas y parametros del panel de administracion se guardan en MongoDB pero hoy no alimentan el cuestionario.
- Al guardar una encuesta, el servidor ignora los resultados que manda el navegador y los recalcula a partir de las respuestas.
- La aceptacion de los Terminos y Condiciones se registra en el servidor (fecha y version). Al cambiar el texto hay que subir `TERMS_VERSION` en `backend/shared/terms.js`: todos vuelven a aceptarlos.
- El servidor limita los intentos de login, registro y recuperacion de contrasena (ver `backend/middleware/rateLimit.js`).
- Recuperacion de contrasena sin correo: un administrador puede generar un codigo de 6 digitos para cualquier usuario (Panel de administracion > Usuarios > boton de candado). El usuario lo usa en "Olvidaste tu contrasena?" > "Ya tengo un codigo". Vence a los 60 minutos, sirve una sola vez y admite 5 intentos; solo se muestra al administrador, en la base queda su hash. Util mientras no haya un dominio propio verificado en Resend (con el remitente de prueba solo se entregan mails a la casilla duena de la cuenta de Resend).
- Diseño mobile-first y app instalable (PWA).

## Proximos posibles pasos

- Externalizar factores de emision por version o region.
- Agregar tests unitarios para reglas de calculo.
- Exponer export de reporte (PDF o CSV).

