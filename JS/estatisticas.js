/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/estatisticas.js
   GERENCIAMENTO DE ESTATÍSTICAS E DESEMPENHO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initEstatisticasEvents();
});

/* =====================================================
   INICIALIZAÇÃO DOS EVENTOS DE ESTATÍSTICAS
===================================================== */
function initEstatisticasEvents() {
    // Caso haja algum modal ou botão específico de estatísticas futuras
    const statForm = document.getElementById("stat-form");
    if (statForm) {
        statForm.addEventListener("submit", handleStatFormSubmit);
    }
}

/* =====================================================
   RENDERIZAÇÃO DAS ESTATÍSTICAS
===================================================== */
window.renderStatistics = function() {
    const tableBody = document.getElementById("statistics-table-body");
    
    // Elementos dos cards de resumo estatístico
    const statPartidas = document.getElementById("stat-partidas");
    const statGols = document.getElementById("stat-gols");
    const statAssistencias = document.getElementById("stat-assistencias");
    const statVitorias = document.getElementById("stat-vitorias");

    const statistics = window.appState.statistics || [];
    const players = window.appState.players || [];

    // Calcula somatórios gerais com base no estado ou jogadores convocados
    let totalPartidas = 0;
    let totalGols = 0;
    let totalAssistencias = 0;
    let totalVitorias = 0;

    statistics.forEach(s => {
        totalPartidas += Number(s.partidas) || 0;
        totalGols += Number(s.gols) || 0;
        totalAssistencias += Number(s.assistencias) || 0;
        totalVitorias += Number(s.vitorias) || 0;
    });

    if (statPartidas) statPartidas.textContent = totalPartidas;
    if (statGols) statGols.textContent = totalGols;
    if (statAssistencias) statAssistencias.textContent = totalAssistencias;
    if (statVitorias) statVitorias.textContent = totalVitorias;

    // Renderiza a tabela de estatísticas individuais
    if (!tableBody) return;

    // Filtra apenas jogadores convocados ou todos que possuem estatísticas
    const activePlayers = players.filter(p => p.convocado);

    if (activePlayers.length === 0 && statistics.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="table-empty">
                    Nenhuma estatística cadastrada ou jogadores convocados.
                </td>
            </tr>
        `;
        return;
    }

    let html = "";

    // Mapeia estatísticas por jogador
    activePlayers.forEach(player => {
        const stat = statistics.find(s => s.playerId === player.id) || { partidas: 0, gols: 0, assistencias: 0, cartoes: 0 };
        
        let acoesEdicao = "";
        if (window.appState.isAdmin) {
            acoesEdicao = `
                <button onclick="openStatModal('${player.id}')" title="Editar estatísticas" style="background: var(--surface-secondary); border: 1px solid var(--border); padding: 4px 8px; border-radius: 6px; cursor: pointer; font-size: 10px;">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
            `;
        }

        html += `
            <tr>
                <td style="display: flex; align-items: center; gap: 8px;">
                    <strong style="color: var(--red);">${player.numero || '--'}</strong>
                    <span>${player.nome}</span>
                </td>
                <td>${stat.partidas || 0}</td>
                <td>${stat.gols || 0}</td>
                <td>${stat.assistencias || 0}</td>
                <td>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <span>${stat.cartoes || 0}</span>
                        ${acoesEdicao}
                    </div>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
};

/* =====================================================
   ATUALIZAÇÃO DE ESTATÍSTICAS (APENAS LEMOS)
===================================================== */
window.updatePlayerStat = function(playerId, partidas, gols, assistencias, cartoes) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Apenas o Lemos pode atualizar estatísticas.", "error");
        return;
    }

    let stat = window.appState.statistics.find(s => s.playerId === playerId);
    if (stat) {
        stat.partidas = partidas;
        stat.gols = gols;
        stat.assistencias = assistencias;
        stat.cartoes = cartoes;
    } else {
        window.appState.statistics.push({
            playerId: playerId,
            partidas: partidas,
            gols: gols,
            assistencias: assistencias,
            cartoes: cartoes
        });
    }

    window.renderStatistics();
    if (typeof showToast === "function") showToast("Estatísticas atualizadas com sucesso!", "success");
    if (typeof window.addRecentActivity === "function") {
        window.addRecentActivity("Estatísticas de jogadores atualizadas", "fa-chart-line");
    }
};

function handleStatFormSubmit(e) {
    e.preventDefault();
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Acesso restrito ao Lemos.", "error");
        return;
    }
    // Lógica do formulário de estatísticas se houver modal dedicado
}