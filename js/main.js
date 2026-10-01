/**
 * JBJ Manufactura Textil - Main Application Script
 */

import { initProducts, JBJ_CONFIG } from "./products.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar catálogo interactivo
  initProducts();

  // 2. Cargar datos de contacto en elementos del DOM
  populateContactInfo();

  // 3. Menú móvil (Hamburguesa)
  setupMobileMenu();

  // 4. Formulario de contacto interactivo
  setupContactForm();

  // 5. Botón flotante de WhatsApp
  setupWhatsAppFloat();

  // 6. Actualizar año en footer
  const currentYearSpan = document.getElementById("current-year");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});

/**
 * Rellena los datos de contacto configurables en el sitio
 */
function populateContactInfo() {
  const phoneElements = document.querySelectorAll(".jbj-phone");
  phoneElements.forEach((el) => (el.textContent = JBJ_CONFIG.telefono));

  const emailElements = document.querySelectorAll(".jbj-email");
  emailElements.forEach((el) => {
    el.textContent = JBJ_CONFIG.email;
    if (el.tagName === "A") el.href = `mailto:${JBJ_CONFIG.email}`;
  });

  const addressElements = document.querySelectorAll(".jbj-address");
  addressElements.forEach((el) => (el.textContent = JBJ_CONFIG.direccion));

  const hoursElements = document.querySelectorAll(".jbj-hours");
  hoursElements.forEach((el) => (el.textContent = JBJ_CONFIG.horario));
}

/**
 * Menú de navegación responsive para teléfonos móviles
 */
function setupMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
    });
  });
}

/**
 * Configura el botón flotante de WhatsApp
 */
function setupWhatsAppFloat() {
  const waFloat = document.getElementById("whatsapp-float-btn");
  if (!waFloat) return;

  const defaultMsg = encodeURIComponent(
    "¡Hola JBJ! Me contacto desde su página web para solicitar información sobre fabricación de mochilas y catálogo."
  );
  waFloat.href = `https://wa.me/${JBJ_CONFIG.whatsappNumber}?text=${defaultMsg}`;
}

/**
 * Formulario de contacto con redirección asistida a WhatsApp o email
 */
function setupContactForm() {
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("form-nombre")?.value.trim() || "";
    const email = document.getElementById("form-email")?.value.trim() || "";
    const telefono = document.getElementById("form-telefono")?.value.trim() || "";
    const tipo = document.getElementById("form-tipo")?.value || "Consulta General";
    const mensaje = document.getElementById("form-mensaje")?.value.trim() || "";

    if (!nombre || !mensaje) {
      alert("Por favor completa al menos tu nombre y el mensaje de consulta.");
      return;
    }

    // Armar mensaje directo para WhatsApp
    const textoWhatsApp = encodeURIComponent(
      `*Consulta Web JBJ Manufactura*\n` +
      `• *Nombre:* ${nombre}\n` +
      `• *Email:* ${email || "No especificado"}\n` +
      `• *Teléfono:* ${telefono || "No especificado"}\n` +
      `• *Interés:* ${tipo}\n` +
      `• *Mensaje:* ${mensaje}`
    );

    const enlaceWhatsApp = `https://wa.me/${JBJ_CONFIG.whatsappNumber}?text=${textoWhatsApp}`;

    if (formStatus) {
      formStatus.innerHTML = `
        <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <p class="font-bold flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ¡Mensaje preparado con éxito!
          </p>
          <p class="mt-1 text-xs text-emerald-700">Para una respuesta inmediata, te redirigiremos a nuestro canal directo de WhatsApp.</p>
          <a href="${enlaceWhatsApp}" target="_blank" class="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition-colors">
            Enviar ahora por WhatsApp
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
        </div>
      `;
      formStatus.classList.remove("hidden");
    }

    // Abrir automáticamente la ventana de WhatsApp después de 1 segundo
    setTimeout(() => {
      window.open(enlaceWhatsApp, "_blank");
    }, 800);

    contactForm.reset();
  });
}
