/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/admin.js
   GERENCIAMENTO DE AUTENTICAÇÃO E ADMINISTRAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initAdminEvents();
});

/* =====================================================
   INICIALIZAÇÃO DOS EVENTOS DE ADMINISTRAÇÃO
===================================================== */
function initAdminEvents() {
    // Formulário de login administrativo
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", handleAdminLogin);
    }

    // Botão de logout administrativo
    const logoutBtn = document.getElementById("admin-logout");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (typeof window.logoutAdmin === "function") {
                window.logoutAdmin();
                // Atualiza a renderização para ocultar botões administrativos
                if (typeof window.renderPlayers === "function") window.renderPlayers();
                if (typeof window.renderStatistics === "function") window.renderStatistics();
                if (typeof window.renderSeasons === "function") window.renderSeasons();
                if (typeof window.renderTrophies === "function") window.renderTrophies();
            }
        });
    }

    // Ações dos cards do painel administrativo
    const adminOptionCards = document.querySelectorAll(".admin-option-card[data-admin-action]");
    adminOptionCards.forEach(card => {
        card.addEventListener("click", () => {
            const action = card.getAttribute("data-admin-action");
            handleAdminShortcutAction(action);
        });
    });
}

/* =====================================================
   MANIPULAÇÃO DO LOGIN ADMINISTRATIVO
===================================================== */
function handleAdminLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById("admin-username");
    const passwordInput = document.getElementById("admin-password");
    const errorEl = document.getElementById("admin-login-error");

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (errorEl) errorEl.textContent = "";

    // Verifica se a função global de verificação de permissão existe (no supabase.js ou script.js)
    if (typeof window.checkAdminPermission === "function") {
        const success = window.checkAdminPermission(username, password);
        if (success) {
            usernameInput.value = "";
            passwordInput.value = "";
            
            // Re-renderiza os componentes para exibir os botões de administração
            if (typeof window.renderPlayers === "function") window.renderPlayers();
            if (typeof window.renderStatistics === "function") window.renderStatistics();
            if (typeof window.renderSeasons === "function") window.renderSeasons();
            if (typeof window.renderTrophies === "function") window.renderTrophies();
        } else {
            if (errorEl) {
                errorEl.textContent = "Acesso negado. Apenas o Lemos pode administrar o site.";
            }
        }
    } else {
        // Fallback caso a função global não esteja carregada
        if (username.toLowerCase() === "lemos") {
            window.appState.isAdmin = true;
            window.appState.adminName = "Lemos";
            document.body.classList.add("admin-authenticated");
            
            document.getElementById("admin-login-area")?.classList.add("hidden");
            document.getElementById("admin-dashboard")?.classList.remove("hidden");
            
            if (typeof showToast === "function") showToast("Bem-vindo, Lemos!", "success");
        } else {
            if (errorEl) errorEl.textContent = "Identificação inválida. Apenas o Lemos tem acesso.";
        }
    }
}

/* =====================================================
   ATALHOS DO PAINEL ADMINISTRATIVO
===================================================== */
function handleAdminShortcutAction(action) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Acesso restrito ao Lemos.", "error");
        return;
    }

    switch (action) {
        case "president":
            const presidentModal = document.getElementById("president-modal");
            const presidentEditName = document.getElementById("president-edit-name");
            if (presidentModal && presidentEditName) {
                presidentEditName.value = window.appState.presidentName || "Koee_annaa";
                presidentModal.classList.add("active");
            }
            break;

        case "players":
            // Redireciona para a aba de jogadores e abre o modal de novo jogador
            if (typeof switchSection === "function") switchSection("jogadores");
            setTimeout(() => {
                const addPlayerBtn = document.getElementById("add-player-btn");
                if (addPlayerBtn) addPlayerBtn.click();
            }, 300);
            break;

        case "statistics":
            if (typeof switchSection === "function") switchSection("estatisticas");
            if (typeof showToast === "function") showToast("Clique em 'Editar' diretamente na linha do jogador desejado na tabela abaixo.", "warning");
            break;

        case "seasons":
            if (typeof switchSection === "function") switchSection("temporadas");
            setTimeout(() => {
                const addSeasonBtn = document.getElementById("add-season-btn");
                if (addSeasonBtn) addSeasonBtn.click();
            }, 300);
            break;

        case "trophies":
            if (typeof switchSection === "function") switchSection("trofeus");
            if (typeof showToast === "function") showToast("Os troféus são gerados automaticamente através do cadastro nas temporadas.", "success");
            break;

        default:
            console.warn("Ação administrativa desconhecida:", action);
    }
};