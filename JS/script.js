/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/script.js
   CONTROLADOR PRINCIPAL DO SISTEMA
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🇪🇸 Inicializando o site oficial da Espanha...");

    // 1. Oculta a tela de carregamento inicial
    setTimeout(() => {
        const loadingScreen = document.getElementById("loading-screen");
        if (loadingScreen) {
            loadingScreen.style.opacity = "0";
            setTimeout(() => loadingScreen.remove(), 400);
        }
    }, 600);

    // 2. Inicialização dos Módulos e Navegação
    initNavigation();
    initMobileSidebar();
    
    // 3. Carregamento de Dados do Supabase
    await loadInitialData();
});

/* =====================================================
   NAVEGAÇÃO ENTRE ABAS
===================================================== */
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item[data-section], [data-go-section]");
    
    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const targetSection = item.getAttribute("data-section") || item.getAttribute("data-go-section");
            
            if (targetSection) {
                switchSection(targetSection);
                closeMobileSidebar();
            }
        });
    });
}

function switchSection(sectionId) {
    const sections = document.querySelectorAll(".page-section");
    const navItems = document.querySelectorAll(".nav-item[data-section]");
    const breadcrumbCurrent = document.getElementById("breadcrumb-current");

    sections.forEach(sec => sec.classList.remove("active"));
    navItems.forEach(nav => nav.classList.remove("active"));

    const targetSec = document.getElementById(`section-${sectionId}`);
    const targetNav = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

    if (targetSec) {
        targetSec.classList.add("active");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (targetNav) {
        targetNav.classList.add("active");
    }

    if (breadcrumbCurrent && targetNav) {
        const textSpan = targetNav.querySelector("span");
        if (textSpan) breadcrumbCurrent.textContent = textSpan.textContent;
    }
}

/* =====================================================
   CONTROLE DO MENU LATERAL (MOBILE - CORRIGIDO)
===================================================== */
function initMobileSidebar() {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebarClose = document.getElementById("sidebar-close");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            sidebar.classList.add("active", "open");
            overlay.classList.add("active");
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener("click", () => {
            closeMobileSidebar();
        });
    }

    if (overlay) {
        overlay.addEventListener("click", () => {
            closeMobileSidebar();
        });
    }
}

function closeMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    if (sidebar) {
        sidebar.classList.remove("active", "open");
    }
    if (overlay) {
        overlay.classList.remove("active");
    }
}

/* =====================================================
   SISTEMA DE NOTIFICAÇÕES (TOAST)
===================================================== */
function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-exclamation";
    if (type === "warning") icon = "fa-triangle-exclamation";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

/* =====================================================
   CARREGAMENTO DE DADOS INICIAIS
===================================================== */
async function loadInitialData() {
    try {
        if (typeof window.fetchSupabaseData === "function") {
            await window.fetchSupabaseData();
        }
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}