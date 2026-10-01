# 🎒 JBJ Manufactura Textil - Sitio Web Oficial & Catálogo de Mochilas

Sitio web corporativo y catálogo interactivo de productos desarrollado para la empresa de manufactura textil **JBJ**, especializado en mochilas urbanas, ejecutivas, escolares y accesorios de alta resistencia.

Preparado para publicarse de forma gratuita en **GitHub Pages** y ser accesible por cualquier persona mediante enlace público.

---

## 🚀 Características Principales

- **Diseño Moderno e Industrial**: Estética orientada a manufactura textil con paleta sobria, tipografía Plus Jakarta Sans y Tailwind CSS.
- **Catálogo Interactivo**:
  - Buscador en tiempo real por modelo, capacidad (ej. *25L*) o materiales.
  - Filtros dinámicos por categoría con contador de productos.
  - Ficha técnica en modal interactivo con detalles de confección, materiales y fotos ampliadas.
- **Integración con WhatsApp**:
  - Botón flotante siempre visible con animación de pulso.
  - Botón "Pedir por WhatsApp" en cada tarjeta que abre el chat con el nombre exacto de la mochila seleccionada.
  - Formulario de contacto que genera automáticamente el mensaje estructurado para WhatsApp.
- **100% Compatible con GitHub Pages**: Sin necesidad de compilar Node.js; ligero, ultra rápido y optimizado para móviles.

---

## 📁 Estructura del Proyecto

```text
testAntigravity/
├── index.html                  # Página principal y estructura semántica
├── css/
│   └── styles.css              # Efectos, botón flotante y estilos adicionales
├── js/
│   ├── main.js                 # Inicialización, menú móvil y formulario
│   ├── products.js             # Lógica de renderizado, buscador y modal
│   └── data/
│       └── products.json       # Base de datos editable de productos
├── .github/
│   └── workflows/
│       └── deploy.yml          # Despliegue automático a GitHub Pages
└── README.md                   # Esta guía
```

---

## 🛠️ ¿Cómo Personalizar los Datos?

### 1. Cambiar los datos de contacto y WhatsApp
Abre el archivo [js/products.js](file:///c:/Users/juanc/Downloads/testAntigravity/js/products.js) y edita las primeras líneas:

```javascript
export const JBJ_CONFIG = {
  // Tu número de WhatsApp con código de país (sin +, ni espacios, ni guiones)
  // Ej: Argentina: "5491112345678", México: "5215512345678", etc.
  whatsappNumber: "5491199998888", 
  email: "contacto@jbjmochilas.com",
  telefono: "+54 (11) 4567-8900",
  direccion: "Parque Industrial Textil, Sector 4, Lote 12",
  horario: "Lunes a Viernes de 8:00 a 17:30 hs",
  empresa: "JBJ Manufactura Textil"
};
```

### 2. Agregar o Modificar Mochilas y Productos
Abre el archivo [js/data/products.json](file:///c:/Users/juanc/Downloads/testAntigravity/js/data/products.json). Cada producto tiene esta estructura:

```json
{
  "id": "jbj-urb-01",
  "nombre": "Mochila Urbana JBJ Vanguard 25L",
  "categoria": "Urbanas & Casuales",
  "descripcion": "Descripción del producto...",
  "material": "Poliéster 900D Ripstop repelente al agua",
  "capacidad": "25 Litros",
  "dimensiones": "45 x 30 x 16 cm",
  "precio": "$32.500",
  "destacado": true,
  "etiqueta": "Más Vendido",
  "imagen": "https://url-de-tu-foto.jpg",
  "caracteristicas": [
    "Compartimiento acolchado para notebook 15.6\"",
    "Espaldar ergonómico con tejido mesh"
  ]
}
```

---

## 🌐 ¿Cómo Subir la Página a GitHub y Activar GitHub Pages?

Sigue estos sencillos pasos para publicar tu sitio en internet y obtener el enlace público:

### Paso 1: Crear un nuevo repositorio en GitHub
1. Inicia sesión en [GitHub.com](https://github.com).
2. Haz clic en el botón verde **"New"** (o ve a `github.com/new`).
3. Asigna un nombre al repositorio (por ejemplo: `jbj-web` o `jbj-mochilas`).
4. Selecciona que sea **Public** (Público).
5. **No** marques la casilla de "Add a README file" (ya tenemos uno preparado).
6. Haz clic en **Create repository**.

### Paso 2: Subir el código desde tu terminal (PowerShell o Git Bash)
Abre la terminal en la carpeta de este proyecto (`testAntigravity`) y ejecuta:

```powershell
# 1. Inicializar git en la carpeta
git init

# 2. Agregar todos los archivos
git add .

# 3. Guardar el primer commit
git commit -m "Lanzamiento web JBJ con catálogo de mochilas"

# 4. Asegurar que la rama principal se llame main
git branch -M main

# 5. Conectar con tu repositorio de GitHub (reemplaza TU-USUARIO y TU-REPO)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# 6. Subir los archivos a GitHub
git push -u origin main
```

### Paso 3: Activar GitHub Pages
1. En tu repositorio de GitHub, ve a la pestaña **Settings** (Configuración) en la parte superior.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En **Build and deployment > Source**, tienes dos opciones:
   - **Opción recomendada (automática)**: Selecciona **GitHub Actions**. El archivo `.github/workflows/deploy.yml` que dejamos listo se encargará de todo.
   - **Opción tradicional**: Selecciona **Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`, luego pulsa **Save**.
4. ¡Listo! En 1 a 2 minutos, GitHub te mostrará en pantalla el enlace público:
   `https://TU-USUARIO.github.io/TU-REPO/`

Cualquier persona que entre a ese link podrá ver el catálogo completo de JBJ y contactarte al WhatsApp.
