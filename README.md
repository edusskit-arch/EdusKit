# EdusKit Beta (Offline) 

EdusKit es una aplicación educativa modular diseñada para funcionar **sin conexión a internet** en equipos con sistemas **Windows, Linux y Android**.  
Su propósito es apoyar a estudiantes y docentes en materias troncales como **Matemáticas, Química, Física e Idiomas**, ofreciendo recursos interactivos accesibles incluso en instituciones con limitaciones tecnológicas.

---

##  Autores

- Raga, Endy (2025). *EdusKit Beta: Aplicación educativa offline.*  
- Guasimucaro, Yanetzy (2025). *EdusKit Beta: Aplicación educativa offline.*  
- García, David (2025). *EdusKit Beta: Aplicación educativa offline.*  
- Hidalgo, Melianny (2025). *EdusKit Beta: Aplicación educativa offline.*  

---

##  Justificación

EdusKit surge como respuesta a la falta de recursos digitales en liceos públicos venezolanos, donde la ausencia de conectividad y equipos modernos limita el aprendizaje.  
La aplicación busca cerrar esa brecha ofreciendo una herramienta **offline** que fortalezca el rendimiento académico y motive a los estudiantes en su proceso formativo.

---

##  Cómo ayudará

- Permite que cualquier estudiante, independientemente de sus condiciones de acceso a internet, pueda reforzar contenidos clave de manera autónoma.  
- Brinda a los docentes un apoyo práctico para la enseñanza y evaluación.  
- Genera un impacto positivo en el rendimiento institucional y nacional.  

---

## Descargas futuras

EdusKit no solo estará disponible como aplicación web, sino que también se podrá **descargar para móviles y PC de escritorio**.  
Esto permitirá instalar la aplicación en dispositivos Android, Windows y Linux, garantizando acceso incluso sin conexión a internet.  
*(La implementación de estas descargas se resolverá en fases posteriores del proyecto.)*

## Post data del editor ;3
 pronto vendra una aplicacion para el uso de moviles y PC´s tanto portatiles como de escritorio. Y será aplicado este Roadmap:

 ##  Roadmap de desarrollo

Fase 1 — Web Beta (Actual)
- Publicación en plataformas gratuitas (Netlify, GitHub Pages).  
- Módulos básicos: Matemáticas, Química, Física e Idiomas.  
- Página inicial con información, autores y galería.  

Fase 2 — Aplicación móvil (finales de diciembre e inicios de enero)
- Conversión a formato APK para Android.  
- Interfaz adaptada a pantallas táctiles.  
- Descarga directa desde repositorio o tienda alternativa.  

Fase 3 — Escritorio (intermediarios de enero y comienzo de febrero)
- Empaquetado para Windows y Linux (instaladores offline).  
- Integración con atajos de teclado y soporte multiusuario.  
- Distribución gratuita para liceos públicos.  

Fase 4 — Expansión y escalabilidad (años posteriores podrian tener esta actualizacióm {no lo garantizo, aunque si llegase a ser posible una ACT. tendria estos modulos})
- Nuevos módulos (Historia, Biología, Lengua y Literatura).  
- Integración con repositorios de contenidos locales.  
- Posible sincronización opcional en línea para estadísticas y mejoras.  
Claro cabe destacar que esto me exige colocar la app/pagina en modo online... ¡¡¡Y SI!!! por su puesto tendra servicios online, ya que esta app/pagina tendra actualizaciones ¨constantes¨ por parte de los autores. Ademas de integracion de Inteligencia artificial creada solo para esta aplicación, esto de modo para guiar y ayudar en el proceso de aprendizaje.

---

## Servidor local y asistente IA (EdusBot)

Se ha añadido un servidor Node.js con un asistente IA integrado llamado `EdusBot`.

Cómo ejecutar (desarrollo)

1. Instala dependencias:

```bash
cd /path/to/EdusKit
npm install
```

2. Arranca el servidor:

```bash
# Ejecuta el servidor (sirve los ficheros y expone /api/ai)
node server.js
# o usando npm
npm start
```

3. Abre en el navegador:

```
http://localhost:8080
```

Uso del asistente (EdusBot)

- En la web encontrarás un panel de chat donde puedes escribir preguntas. Por defecto el servidor responde con mensajes de ejemplo (modo mock).
- Si quieres usar una IA real (OpenAI), exporta tu clave antes de arrancar:

```bash
export OPENAI_API_KEY="sk-..."
node server.js
```

Notas de seguridad

- No incluyas tu clave en el repositorio. Manténla en variables de entorno.
- Las peticiones se proxean a OpenAI si `OPENAI_API_KEY` está presente; el servidor no almacena conversaciones.

Integración con VS Code

- Se agregó una tarea de VS Code (`.vscode/tasks.json`) llamada `serve` que ejecuta `node server.js`.
- Las configuraciones `Launch Chrome` / `Launch Edge` en `.vscode/launch.json` usan esa tarea como `preLaunchTask`, por lo que VS Code arrancará el servidor antes de abrir el navegador para depuración.

Pruebas automáticas y CI

- Se añadió un test sencillo en `tests/ai.test.js` que hace POST a `/api/ai` y verifica que la respuesta contiene un campo `reply`.
- Se añadió un workflow de GitHub Actions en `.github/workflows/ci.yml` que instala dependencias, arranca el servidor y ejecuta `npm test` en pushes/pull requests a `main`.
