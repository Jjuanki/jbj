/**
 * JBJ - Catálogo de Productos y Confección Textil
 * Gestión de renderizado, búsqueda en tiempo real, filtros y cotizaciones por WhatsApp.
 */

// ============================================================================
// CONFIGURACIÓN DE CONTACTO (Modifica estos valores con tus datos reales)
// ============================================================================
const JBJ_CONFIG = {
  // IMPORTANTE PARA WHATSAPP:
  // Si tu número es de Ecuador (ej: 0987939505), WhatsApp requiere el código de país 593 
  // quitando el 0 inicial: "593987939505". 
  // Si lo dejas con el 0 ("0987939505"), el sistema intentará auto-corregirlo para Ecuador (593).
  whatsappNumber: "593987939505", 
  email: "contacto@jbjmochilas.com",
  telefono: "0987939505",
  direccion: "Lima y Luxemburgo",
  horario: "Lunes a Viernes de 8:00 a 18:00 hs",
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

function resolveDOMElements() {
  productsGrid = document.getElementById("products-grid");
  categoryFiltersContainer = document.getElementById("category-filters");
  searchInput = document.getElementById("search-input");
  noResultsMessage = document.getElementById("no-results");
  productModal = document.getElementById("product-modal");
  closeModalBtn = document.getElementById("close-modal-btn");
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
    console.warn("Carga desde fetch falló (típico al abrir por protocolo file://). Usando catálogo embebido de respaldo:", error);
    // Fallback con productos iniciales
    productsData = [
      {
        id: "jbj-urb-01",
        nombre: "Mochila Urbana JBJ Vanguard 25L",
        categoria: "Urbanas & Casuales",
        descripcion: "Diseñada para el ritmo diario de la ciudad. Confeccionada en tela poliéster 900D impermeable, costuras reforzadas y compartimiento acolchado para notebook de hasta 15.6 pulgadas.",
        material: "Poliéster 900D Ripstop repelente al agua",
        capacidad: "25 Litros",
        dimensiones: "45 x 30 x 16 cm",
        precio: "$32.500",
        destacado: true,
        etiqueta: "Más Vendido",
        imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Compartimiento acolchado para notebook 15.6\"",
          "Bolsillo frontal antirrobo con organizador interno",
          "Espaldar ergonómico con tejido mesh antitranspirante",
          "Cierres reforzados tipo autorreparables"
        ]
      },
      {
        id: "jbj-eje-02",
        nombre: "Mochila Ejecutiva JBJ Pro Executive 28L",
        categoria: "Ejecutivas & Laptop",
        descripcion: "Elegancia, ergonomía y máxima protección para profesionales. Estructura semi-rígida, puerto USB exterior de carga y organizador inteligente para periféricos y documentos.",
        material: "Cordura técnica de alta densidad con detalles en ecocuero",
        capacidad: "28 Litros",
        dimensiones: "48 x 32 x 18 cm",
        precio: "$41.000",
        destacado: true,
        etiqueta: "Línea Premium",
        imagen: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Apertura 180° estilo valija para fácil guardado",
          "Funda interna para laptop 17\" y tablet 11\"",
          "Correa para anclaje a equipaje / carry-on",
          "Bolsillo oculto para pasaporte o billetera"
        ]
      },
      {
        id: "jbj-dep-03",
        nombre: "Bolso Mochila JBJ Sport & Trek 40L",
        categoria: "Deportivas & Viaje",
        descripcion: "El compañero ideal para entrenamientos o viajes de fin de semana. Funciona como bolso de mano o mochila gracias a sus correas ocultables y compartimento aislado para calzado.",
        material: "Lona Oxford 1000D de alta resistencia al desgarro",
        capacidad: "40 Litros",
        dimensiones: "52 x 34 x 22 cm",
        precio: "$38.000",
        destacado: true,
        etiqueta: "Versátil 2 en 1",
        imagen: "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Compartimiento independiente y ventilado para zapatillas",
          "Bolsillo impermeable para ropa húmeda o toallas",
          "Correas acolchadas desmontables y convertibles",
          "Base reforzada con tacos de goma anti-desgaste"
        ]
      },
      {
        id: "jbj-esc-04",
        nombre: "Mochila Escolar Reforzada JBJ Titan 22L",
        categoria: "Escolares & Juveniles",
        descripcion: "Creada para soportar el uso intensivo diario escolar o secundario. Triple costura en puntos de tracción, base doble fondo y soporte lumbar diseñado para cuidar la espalda.",
        material: "Poliéster 600D ultra durable",
        capacidad: "22 Litros",
        dimensiones: "42 x 29 x 15 cm",
        precio: "$26.500",
        destacado: false,
        etiqueta: "Alta Durabilidad",
        imagen: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Base de doble capa de material anti-rozaduras",
          "Detalles reflectivos frontales y laterales de seguridad",
          "Doble bolsillo lateral para botellas de hidratación",
          "Tirantes ergonómicos en 'S' con acolchado grueso"
        ]
      },
      {
        id: "jbj-acc-05",
        nombre: "Cartuchera Organizadora JBJ Double Zip",
        categoria: "Accesorios Textiles",
        descripcion: "Estuche organizador multiuso de manufactura textil reforzada. Ideal para útiles de oficina, herramientas de dibujo o cables y cargadores de viaje.",
        material: "Poliéster texturizado lavable",
        capacidad: "1.5 Litros",
        dimensiones: "22 x 10 x 8 cm",
        precio: "$8.200",
        destacado: false,
        etiqueta: "Accesorio",
        imagen: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Doble compartimento con cierre individual",
          "Interior forrado anti-manchas",
          "Manija lateral de transporte rápido",
          "Tiracierre reforzado ergonómico"
        ]
      },
      {
        id: "jbj-urb-06",
        nombre: "Morral Cruzado JBJ Daily Sling 8L",
        categoria: "Urbanas & Casuales",
        descripcion: "Morral textil tipo bandolera ergonómica para llevar lo esencial: llaves, celular, tablet y libreta. Ajuste ambidiestro para usar al frente o a la espalda.",
        material: "Nylon antidesgarro con recubrimiento mate",
        capacidad: "8 Litros",
        dimensiones: "32 x 20 x 10 cm",
        precio: "$19.800",
        destacado: false,
        etiqueta: "Tendencia",
        imagen: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Correa acolchada intercambiable para hombro izquierdo o derecho",
          "Hebilla de liberación rápida de uso táctico",
          "Bolsillo de seguridad pegado al cuerpo",
          "Forro interior con contraste de color para fácil visibilidad"
        ]
      },
      {
        id: "jbj-eje-07",
        nombre: "Mochila Corporativa JBJ Custom Line 24L",
        categoria: "Ejecutivas & Laptop",
        descripcion: "Ideal para empresas, eventos o dotaciones corporativas. Diseñada con amplio panel frontal limpio, óptimo para bordados o estampados de logos empresariales por mayor.",
        material: "Poliéster Oxford 800D con acabado premium",
        capacidad: "24 Litros",
        dimensiones: "44 x 31 x 15 cm",
        precio: "Consultar por mayor",
        destacado: true,
        etiqueta: "Ventas Corporativas",
        imagen: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Panel listo para personalización y bordado corporativo",
          "Porta notebook 15.6\" con protección en laterales",
          "Descuentos escalonados por volumen de fabricación",
          "Disponible en paleta de colores institucionales"
        ]
      },
      {
        id: "jbj-acc-08",
        nombre: "Neceser Textil JBJ Traveler Washbag",
        categoria: "Accesorios Textiles",
        descripcion: "Organizador de aseo o herramientas con gancho colgador incorporado. Confección textil con interior impermeable fácil de limpiar.",
        material: "Poliéster ripstop con forro de PVC impermeable",
        capacidad: "4 Litros",
        dimensiones: "25 x 18 x 9 cm",
        precio: "$12.400",
        destacado: false,
        etiqueta: "Accesorio",
        imagen: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        caracteristicas: [
          "Gancho metálico giratorio para colgar",
          "Bolsillos de malla transparente con cierre",
          "Tejido exterior resistente a salpicaduras",
          "Costuras selladas en la base"
        ]
      }
    ];
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
                  🧵 ${product.material}
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
