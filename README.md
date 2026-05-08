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

La navegacion de estado se controla desde App con una maquina simple de pantallas.

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
		questions.json
	index.css
	App.jsx
	main.jsx
```

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

- MVP funcional.
- Datos y factores embebidos localmente (sin backend).
- Diseño orientado a experiencia editorial y mobile-first.

## Proximos posibles pasos

- Persistir resultados historicos por usuario.
- Externalizar factores de emision por version o region.
- Agregar tests unitarios para reglas de calculo.
- Exponer export de reporte (PDF o CSV).
- Integrar autenticacion y API para seguimiento longitudinal.

