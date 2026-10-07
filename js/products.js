/**
 * JBJ - Catálogo de Productos y Confección Textil
 * Gestión de renderizado, búsqueda en tiempo real, filtros y cotizaciones por WhatsApp.
 */

// ============================================================================
// CONFIGURACIÓN DE CONTACTO (Modifica estos valores con tus datos reales)
// ============================================================================
const JBJ_CONFIG = {
  whatsappNumber: "593987939505",
  email: "luiscaranquijbj@hotmail.com",
  telefono: "0987939505",
  direccion: "Lima y Luxemburgo",
  horario: "Lunes a sábado de 8:00 a 18:00 hs",
  empresa: "JBJ"
};

// Hace que la configuración esté disponible globalmente sin importar cómo se cargue el script
if (typeof window !== "undefined") {
  window.JBJ_CONFIG = JBJ_CONFIG;
}

/**
 * Normaliza el número para enlaces de WhatsApp wa.me
 */
function getCleanWhatsAppNumber(rawNumber) {
  let clean = (rawNumber || "").toString().replace(/[^0-9]/g, "");
  // Si empieza con 09 y tiene 10 dígitos (formato celular típico Ecuador), anteponer 593
  if (clean.startsWith("09") && clean.length === 10) {
    clean = "593" + clean.substring(1);
  }
  return clean;
}
if (typeof window !== "undefined") {
  window.getCleanWhatsAppNumber = getCleanWhatsAppNumber;
}

// ============================================================================
// DATOS DE RESPALDO (Garantiza funcionamiento incluso al abrir con doble clic sin servidor local)
// ============================================================================
let productsData = [];

// Elementos del DOM (se obtienen dinámicamente)
let productsGrid = null;
let categoryFiltersContainer = null;
let searchInput = null;
let noResultsMessage = null;
let productModal = null;
let closeModalBtn = null;
let catalogoCount = null;

function resolveDOMElements() {
  productsGrid = document.getElementById("products-grid");
  categoryFiltersContainer = document.getElementById("category-filters");
  searchInput = document.getElementById("search-input");
  noResultsMessage = document.getElementById("no-results");
  productModal = document.getElementById("product-modal");
  closeModalBtn = document.getElementById("close-modal-btn");
  catalogoCount = document.getElementById("catalogo-count");
}

// Estado actual
let currentCategory = "Todas";
let currentSearchQuery = "";
let isInitialized = false;

/**
 * Inicializa el catálogo
 */
async function initProducts() {
  if (isInitialized) return;
  resolveDOMElements();
  try {
    const response = await fetch("./js/data/products.json");
    if (!response.ok) throw new Error("No se pudo cargar products.json");
    productsData = await response.json();
  } catch (error) {
    console.warn("Carga desde fetch falló (típico al abrir por protocolo file://). Usando respaldo local:", error);
    productsData = Array.isArray(window.JBJ_FALLBACK_PRODUCTS) ? window.JBJ_FALLBACK_PRODUCTS : [];
  }

  if (productsData.length === 0) {
    throw new Error("No se pudieron cargar productos del catálogo.");
  }

  setupCategories();
  renderProducts();
  setupSearch();
  setupModalEvents();
  isInitialized = true;
}

if (typeof window !== "undefined") {
  window.initProducts = initProducts;
}

// Auto-ejecución inmediata cuando el DOM esté disponible
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProducts);
} else {
  initProducts();
}

/**
 * Genera dinámicamente los botones de categorías con conteo
 */
function setupCategories() {
  if (!categoryFiltersContainer) return;

  const categories = ["Todas", ...new Set(productsData.map((p) => p.categoria))];

  categoryFiltersContainer.innerHTML = categories
    .map((cat) => {
      const count = cat === "Todas" ? productsData.length : productsData.filter((p) => p.categoria === cat).length;
      const isActive = cat === currentCategory;

      return `
        <button 
          data-category="${cat}"
          class="category-btn px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
            isActive
              ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }">
          <span>${cat}</span>
          <span class="text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-500"}">${count}</span>
        </button>
      `;
    })
    .join("");

  // Event listener para los botones
  const buttons = categoryFiltersContainer.querySelectorAll(".category-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategory = btn.getAttribute("data-category");
      setupCategories(); // re-render botones activos
      renderProducts();
    });
  });
}

/**
 * Filtra y renderiza los productos
 */
function renderProducts() {
  if (!productsGrid) return;

  const filtered = productsData.filter((p) => {
    const matchesCategory = currentCategory === "Todas" || p.categoria === currentCategory;
    const q = currentSearchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  if (catalogoCount) {
    catalogoCount.textContent = String(filtered.length);
  }

  if (filtered.length === 0) {
    productsGrid.innerHTML = "";
    if (noResultsMessage) noResultsMessage.classList.remove("hidden");
    return;
  }

  if (noResultsMessage) noResultsMessage.classList.add("hidden");

  productsGrid.innerHTML = filtered
    .map((product) => {
      const whatsappMsg = encodeURIComponent(
        `¡Hola JBJ! Vengo desde el sitio web y me interesa consultar por la mochila o producto: ${product.nombre} (Ref: ${product.id}). ¿Tienen disponibilidad o lista de precios?`
      );
      const cleanWa = getCleanWhatsAppNumber(JBJ_CONFIG.whatsappNumber);
      const whatsappLink = `https://wa.me/${cleanWa}?text=${whatsappMsg}`;

      return `
        <article class="product-card bg-white rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between group">
          <div>
            <!-- Contenedor Imagen -->
            <div class="relative overflow-hidden aspect-[4/3] bg-slate-100">
              <img 
                src="${product.imagen}" 
                alt="${product.nombre}" 
                loading="lazy" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <!-- Badges -->
              <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <span class="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  ${product.categoria}
                </span>
                ${
                  product.etiqueta
                    ? `<span class="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        ${product.etiqueta}
                       </span>`
                    : ""
                }
              </div>

              <!-- Capacidad / Litros -->
              <span class="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-200/60">
                📦 ${product.capacidad}
              </span>
            </div>

            <!-- Contenido textual -->
            <div class="p-5">
              <h3 class="font-bold text-lg text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                ${product.nombre}
              </h3>
              <p class="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">
                ${product.descripcion}
              </p>

              <!-- Especificaciones rápidas -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-500">
                <span class="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  🧤 ${product.material}
                </span>
              </div>
            </div>
          </div>

          <!-- Pie de tarjeta con Precio y Acciones -->
          <div class="p-5 pt-0 mt-2">
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Precio / Fabricación</span>
              <span class="text-xl font-extrabold text-slate-900">${product.precio}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button 
                onclick="window.openProductModal('${product.id}')"
                class="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                Ver Ficha
              </button>

              <a 
                href="${whatsappLink}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.107.005.25.04.389.376.144.35.49 1.198.533 1.286.044.088.073.19.015.305-.058.115-.087.188-.173.289l-.26.305c-.087.086-.178.18-.076.355.101.174.45 1.745 1.503 1.684.347.155.64.208.732.222.144.022.289-.007.39-.123l.505-.592c.116-.145.246-.116.376-.072.13.043.823.388.968.46.144.072.245.108.281.173.036.065.036.377-.108.782z"/></svg>
                Pedir
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

/**
 * Eventos del buscador en vivo
 */
function setupSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value;
    renderProducts();
  });
}

/**
 * Modal de ficha técnica extendida del producto
 */
window.openProductModal = function (productId) {
  const product = productsData.find((p) => p.id === productId);
  if (!product || !productModal) return;

  const whatsappMsg = encodeURIComponent(
    `¡Hola JBJ! Quisiera cotizar formalmente la confección o compra del producto: ${product.nombre} (Ref: ${product.id}). ¿Qué cantidad mínima manejan y cuáles son los tiempos de entrega?`
  );
  const cleanWa = getCleanWhatsAppNumber(JBJ_CONFIG.whatsappNumber);
  const whatsappLink = `https://wa.me/${cleanWa}?text=${whatsappMsg}`;

  const modalBody = document.getElementById("modal-body");
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Imagen ampliada -->
        <div class="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
          <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover max-h-[400px]">
        </div>

        <!-- Información detallada -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                ${product.categoria}
              </span>
              ${
                product.etiqueta
                  ? `<span class="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">${product.etiqueta}</span>`
                  : ""
              }
            </div>

            <h2 class="text-2xl font-black text-slate-900">${product.nombre}</h2>
            <p class="text-slate-600 text-sm mt-3 leading-relaxed">${product.descripcion}</p>

            <!-- Ficha técnica de manufactura -->
            <div class="mt-5 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">Especificaciones Técnicas</h4>
              <div class="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span class="text-slate-400 block">Material:</span>
                  <span class="font-semibold text-slate-800">${product.material}</span>
                </div>
                <div>
                  <span class="text-slate-400 block">Capacidad:</span>
                  <span class="font-semibold text-slate-800">${product.capacidad}</span>
                </div>
                <div>
                  <span class="text-slate-400 block">Dimensiones:</span>
                  <span class="font-semibold text-slate-800">${product.dimensiones}</span>
                </div>
                <div>
                  <span class="text-slate-400 block">Garantía JBJ:</span>
                  <span class="font-semibold text-emerald-700">12 meses de fábrica</span>
                </div>
              </div>
            </div>

            <!-- Características destacadas -->
            <div class="mt-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Puntos Destacados</h4>
              <ul class="space-y-1.5 text-xs text-slate-700">
                ${product.caracteristicas
                  .map(
                    (c) => `
                  <li class="flex items-start gap-2">
                    <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    <span>${c}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>
          </div>

          <!-- Acciones de compra / cotización -->
          <div class="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
            <div>
              <span class="text-xs text-slate-400 block font-medium">Precio Referencial</span>
              <span class="text-2xl font-black text-slate-900">${product.precio}</span>
            </div>

            <a 
              href="${whatsappLink}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-105">
              <span>Cotizar por WhatsApp</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  productModal.classList.remove("hidden");
  document.body.style.overflow = "hidden"; // Evita scroll de fondo
};

function setupModalEvents() {
  if (!productModal) return;

  const closeModal = () => {
    productModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  // Cerrar al hacer clic en el backdrop
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });

  // Cerrar con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !productModal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

