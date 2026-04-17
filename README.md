# BlogVerse

Una SPA (Single Page Application) de blog con CRUD completo construida con HTML5, CSS3 y JavaScript Vanilla ES2022+. Sin frameworks, sin librerías externas.

## API utilizada

[DummyJSON](https://dummyjson.com/posts) — API REST mock que soporta GET, POST, PUT y DELETE de publicaciones.

## Características

- Listado paginado de publicaciones con skeleton loader
- Vista de detalle con 6+ campos por post
- Crear, editar y eliminar publicaciones con validación JS
- Búsqueda por texto + filtro por tag + filtro por usuario (combinables)
- Sección de estadísticas del blog
- Toasts de feedback para todas las acciones
- Routing SPA basado en hash (`#/`, `#/post/:id`, `#/create`, `#/edit/:id`, `#/stats`)
- Diseño responsive: móvil (320px+), tablet (768px+), desktop (1280px+)

## Estructura del proyecto

```
proyecto-blog/
├── index.html
├── .gitignore
├── README.md
├── css/
│   ├── main.css        ← variables CSS y estilos base
│   ├── components.css  ← cards, botones, formularios, toasts
│   └── layout.css      ← navbar, grids, responsive
└── js/
    ├── api.js          ← funciones fetch (GET, POST, PUT, DELETE)
    ├── ui.js           ← manipulación del DOM
    ├── validation.js   ← validaciones puras
    ├── router.js       ← SPA router por hash
    └── main.js         ← punto de entrada e inicialización
```

## Correr localmente

No se requiere ningún paso de build. Abre `index.html` directamente en el navegador **o** sirve los archivos con cualquier servidor estático:

```bash
# Con Python
python -m http.server 3000

# Con Node.js (npx)
npx serve .

# Con VS Code
# Instala la extensión "Live Server" y haz clic en "Go Live"
```

Luego navega a `http://localhost:3000`.

> **Nota:** Los módulos ES6 (`type="module"`) requieren servir los archivos a través de HTTP/HTTPS. Abrir `index.html` con el protocolo `file://` no funcionará en la mayoría de navegadores.

## Integrantes

| Nombre | Rol |
|--------|-----|
|        |     |
|        |     |
|        |     |

## Screenshot

<!-- Agrega aquí una captura de pantalla -->
![Screenshot de la aplicación](screenshot.png)

## URL de despliegue

<!-- URL de GitHub Pages u otro servicio -->
https://
