/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/painel.js
   GERENCIAMENTO DO PAINEL PRINCIPAL (DASHBOARD)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initPainelEvents();
});

/* =====================================================
   INICIALIZAÇÃO DOS EVENTOS DO PAINEL
===================================================== */
function initPainelEvents() {
    // Formulário de alteração da Presidência no Modal
    const presidentForm = document.getElementById("president-form");
    if (presidentForm) {
        presidentForm.addEventListener("submit", handlePresidentSubmit);
    }
}

/* =====================================================
   ATUALIZAÇÃO GERAL DA INTERFACE DO PAINEL
===================================================== */
window.updatePainelUI = function() {
    renderPresidentCard();
    renderDashboardCards();
    renderRecentActivities();
};

/* =====================================================
   1. RENDERIZAÇÃO DO CARD DA PRESIDENTA
===================================================== */
function renderPresidentCard() {
    const presidentNameEl = document.getElementById("president-name");
    if (!presidentNameEl) return;

    // Obtém o nome da presidenta cadastrado no estado global
    const currentPresident = window.appState.presidentName || "Koee_annaa";
    presidentNameEl.textContent = currentPresident;
}

/* =====================================================
   2. RENDERIZAÇÃO DOS CARDS DO PAINEL (CONTADORES)
===================================================== */
function renderDashboardCards() {
    const totalJogadoresEl = document.getElementById("total-jogadores");
    const totalTitulosEl = document.getElementById("total-titulos");
    const totalTemporadasEl = document.getElementById("total-temporadas");

    // Conta os jogadores convocados que fazem parte do elenco ativo
    const convocadosCount = (window.appState.players || []).filter(p => p.convocado).length;
    
    // Conta o total de títulos registrados nas temporadas
    let trofeusCount = 0;
    (window.appState.seasons || []).forEach(season => {
        if (season.titulos) {
            const lista = season.titulos.split("\n").filter(t => t.trim() !== "");
            trofeusCount += lista.length;
        }
    });

    const temporadasCount = (window.appState.seasons || []).length;

    if (totalJogadoresEl) totalJogadoresEl.textContent = convocadosCount;
    if (totalTitulosEl) totalTitulosEl.textContent = trofeusCount;
    if (totalTemporadasEl) totalTemporadasEl.textContent = temporadasCount;
}

/* =====================================================
   3. REGISTRO E RENDERIZAÇÃO DE ATIVIDADES RECENTES
===================================================== */
window.addRecentActivity = function(description, iconClass = "fa-circle-info") {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!window.appState.activities) {
        window.appState.activities = [];
    }

    window.appState.activities.unshift({
        description: description,
        time: timeFormatted,
        icon: iconClass
    });

    // Mantém no máximo 5 atividades recentes
    if (window.appState.activities.length > 5) {
        window.appState.activities.pop();
    }

    renderRecentActivities();
};

function renderRecentActivities() {
    const container = document.getElementById("recent-activity");
    if (!container) return;

    const activities = window.appState.activities || [];

    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
                <h3>Nenhuma atualização</h3>
                <p>As atualizações do clube aparecerão aqui.</p>
            </div>
        `;
        return;
    }

    let html = '<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">';
    
    activities.forEach(act => {
        html += `
            <li style="display: flex; align-items: center; justify-content: space-between; background: var(--surface-secondary); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                    <i class="fa-solid ${act.icon}" style="color: var(--red); flex-shrink: 0;"></i>
                    <span style="font-size: 11px; font-weight: 600; color: var(--text-primary); overflow-wrap: anywhere;">${act.description}</span>
                </div>
                <small style="font-size: 9px; color: var(--text-muted); font-weight: 700; flex-shrink: 0; margin-left: 10px;">${act.time}</small>
            </li>
        `;
    });

    html += '</ul>';
    container.innerHTML = html;
}

/* =====================================================
   4. MANIPULAÇÃO DA EDIÇÃO DA PRESIDÊNCIA (RESTRITO AO LEMOS)
===================================================== */
function handlePresidentSubmit(e) {
    e.preventDefault();

    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") {
            showToast("Apenas o Lemos tem permissão para alterar a presidenta.", "error");
        }
        return;
    }

    const nameInput = document.getElementById("president-edit-name");
    if (!nameInput) return;

    const newName = nameInput.value.trim();
    if (newName === "") {
        if (typeof showToast === "function") {
            showToast("Informe um nome válido para a presidenta.", "warning");
        }
        return;
    }

    // Atualiza o estado global
    window.appState.presidentName = newName;
    renderPresidentCard();

    // Fecha o modal
    const modal = document.getElementById("president-modal");
    if (modal) modal.classList.remove("active");

    // Adiciona atividade recente e notifica
    window.addRecentActivity(`Presidenta alterada para "${newName}"`, "fa-user-tie");

    if (typeof showToast === "function") {
        showToast("Presidência atualizada com sucesso!", "success");
    }
}