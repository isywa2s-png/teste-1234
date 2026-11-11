/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/trofeus.js
   VISUALIZAÇÃO E GERENCIAMENTO DA SALA DE TROFÉUS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initTrofeusEvents();
});

/* =====================================================
   INICIALIZAÇÃO DOS EVENTOS DE TROFÉUS
===================================================== */
function initTrofeusEvents() {
    // Como a Sala de Troféus é sincronizada automaticamente pelas temporadas,
    // este espaço gerencia interações visuais ou filtros futuros se necessário.
}

/* =====================================================
   RENDERIZAÇÃO DA SALA DE TROFÉUS (AGRUPADA AUTOMATICAMENTE)
===================================================== */
window.renderTrophies = function() {
    const container = document.getElementById("trophies-container");
    const trophyTotalEl = document.getElementById("trophy-total");
    if (!container) return;

    const seasons = window.appState.seasons || [];
    const mapaTrofeus = {};
    let totalTitulosGeral = 0;

    // Agrupa automaticamente os títulos informados no cadastro de cada temporada
    seasons.forEach(season => {
        if (!season.titulos) return;
        const listaTitulos = season.titulos.split("\n").filter(t => t.trim() !== "");
        listaTitulos.forEach(tName => {
            const nomeCompeticao = tName.trim();
            if (!mapaTrofeus[nomeCompeticao]) {
                mapaTrofeus[nomeCompeticao] = {
                    nome: nomeCompeticao,
                    quantidade: 0,
                    temporadas: []
                };
            }
            mapaTrofeus[nomeCompeticao].quantidade++;
            mapaTrofeus[nomeCompeticao].temporadas.push(season.nome);
            totalTitulosGeral++;
        });
    });

    if (trophyTotalEl) {
        trophyTotalEl.textContent = totalTitulosGeral;
    }

    const keys = Object.keys(mapaTrofeus);
    if (keys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <h3>Nenhum título conquistado</h3>
                <p>Os títulos aparecerão aqui assim que forem registrados nas temporadas (ex: S1, S2...).</p>
            </div>
        `;
        return;
    }

    let html = "";
    keys.forEach(key => {
        const t = mapaTrofeus[key];
        let tagsTemporadas = "";
        t.temporadas.forEach(sName => {
            tagsTemporadas += `<span class="trophy-season-tag">${sName}</span>`;
        });

        html += `
            <div class="trophy-card">
                <div class="trophy-card-icon">
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <h3>${t.nome}</h3>
                <span class="trophy-count">${t.quantidade}</span>
                <span class="trophy-count-label">Vezes Campeão</span>
                <div class="trophy-seasons">
                    ${tagsTemporadas}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};