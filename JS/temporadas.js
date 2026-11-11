/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/temporadas.js
   GERENCIAMENTO DE TEMPORADAS, HISTÓRICO E TROFÉUS
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initTemporadasEvents();
});

/* =====================================================
   INICIALIZAÇÃO DOS EVENTOS DE TEMPORADAS
===================================================== */
function initTemporadasEvents() {
    const addSeasonBtn = document.getElementById("add-season-btn");
    if (addSeasonBtn) {
        addSeasonBtn.addEventListener("click", () => {
            if (!window.appState.isAdmin) {
                if (typeof showToast === "function") showToast("Apenas o Lemos pode registrar temporadas.", "error");
                return;
            }
            openSeasonModal();
        });
    }

    const closeButtons = document.querySelectorAll("[data-close-modal='season-modal']");
    closeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = document.getElementById("season-modal");
            if (modal) modal.classList.remove("active");
        });
    });

    const seasonForm = document.getElementById("season-form");
    if (seasonForm) {
        seasonForm.addEventListener("submit", handleSeasonFormSubmit);
    }
}

/* =====================================================
   RENDERIZAÇÃO DAS TEMPORADAS E SALA DE TROFÉUS AUTOMÁTICA
===================================================== */
window.renderSeasons = function() {
    const container = document.getElementById("seasons-container");
    if (!container) return;

    const seasons = window.appState.seasons || [];

    if (seasons.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-calendar-days"></i>
                </div>
                <h3>Nenhuma temporada registrada</h3>
                <p>Quando uma temporada for salva, ela aparecerá aqui.</p>
            </div>
        `;
        renderTrophiesFromSeasons();
        return;
    }

    let html = "";

    seasons.forEach(season => {
        let acoesAdminHtml = "";
        if (window.appState.isAdmin) {
            acoesAdminHtml = `
                <div class="season-card-actions">
                    <button onclick="editSeason('${season.id}')" title="Editar temporada">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button class="delete-season" onclick="deleteSeason('${season.id}')" title="Excluir temporada">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </div>
            `;
        }

        // Processa os títulos (um por linha)
        let titulosHtml = "";
        if (season.titulos && season.titulos.trim() !== "") {
            const listaTitulos = season.titulos.split("\n").filter(t => t.trim() !== "");
            if (listaTitulos.length > 0) {
                titulosHtml = `
                    <div class="season-card-section">
                        <span>Títulos da Temporada</span>
                        <ul class="season-title-list">
                `;
                listaTitulos.forEach(titulo => {
                    titulosHtml += `<li><i class="fa-solid fa-trophy"></i><span>${titulo.trim()}</span></li>`;
                });
                titulosHtml += `</ul></div>`;
            }
        }

        html += `
            <div class="season-card">
                <div class="season-card-header">
                    <div class="season-card-icon">
                        <i class="fa-solid fa-calendar-days"></i>
                    </div>
                    <span class="season-card-year">${season.nome}</span>
                </div>

                <h3>Temporada ${season.nome}</h3>
                <p>${season.descricao || 'Temporada oficial registrada pela seleção.'}</p>

                ${titulosHtml}

                <div class="season-card-section">
                    <span>Destaques Individuais</span>
                    <div class="season-highlight">
                        <div class="season-highlight-item">
                            <span>Artilheiro</span>
                            <strong>${season.artilheiro || 'Não informado'}</strong>
                            <small>${season.gols || 0} gols</small>
                        </div>
                        <div class="season-highlight-item">
                            <span>Assistente</span>
                            <strong>${season.assistente || 'Não informado'}</strong>
                            <small>${season.assistencias || 0} assistências</small>
                        </div>
                    </div>
                </div>

                ${acoesAdminHtml}
            </div>
        `;
    });

    container.innerHTML = html;
    renderTrophiesFromSeasons();
};

/* =====================================================
   SALA DE TROFÉUS (AGRUPAMENTO AUTOMÁTICO)
===================================================== */
function renderTrophiesFromSeasons() {
    const container = document.getElementById("trophies-container");
    const trophyTotalEl = document.getElementById("trophy-total");
    if (!container) return;

    const seasons = window.appState.seasons || [];
    const mapaTrofeus = {};
    let totalTitulosGeral = 0;

    // Agrupa os títulos informados nas temporadas
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
                <p>Os títulos aparecerão aqui assim que forem registrados nas temporadas.</p>
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
}

/* =====================================================
   ABRIR MODAL DE TEMPORADA (CRIAR / EDITAR)
===================================================== */
function openSeasonModal(seasonId = null) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Acesso restrito ao Lemos.", "error");
        return;
    }

    const modal = document.getElementById("season-modal");
    const titleEl = document.getElementById("season-modal-title");
    const form = document.getElementById("season-form");
    
    if (!modal || !form) return;

    form.reset();
    document.getElementById("season-id").value = "";

    if (seasonId) {
        if (titleEl) titleEl.textContent = "Editar temporada";
        const season = window.appState.seasons.find(s => s.id === seasonId);
        if (season) {
            document.getElementById("season-id").value = season.id;
            document.getElementById("season-name").value = season.nome;
            document.getElementById("season-titles").value = season.titulos || "";
            document.getElementById("season-top-scorer").value = season.artilheiro || "";
            document.getElementById("season-goals").value = season.gols || "";
            document.getElementById("season-top-assistant").value = season.assistente || "";
            document.getElementById("season-assists").value = season.assistencias || "";
            document.getElementById("season-description").value = season.descricao || "";
        }
    } else {
        if (titleEl) titleEl.textContent = "Registrar temporada";
        // Sugere o próximo ID (ex: S1, S2...) com base nas temporadas existentes
        const proximoNum = (window.appState.seasons.length || 0) + 1;
        document.getElementById("season-name").value = `S${proximoNum}`;
    }

    modal.classList.add("active");
}

/* =====================================================
   SALVAR TEMPORADA
===================================================== */
function handleSeasonFormSubmit(e) {
    e.preventDefault();

    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Apenas o Lemos pode salvar temporadas.", "error");
        return;
    }

    const id = document.getElementById("season-id").value;
    const nome = document.getElementById("season-name").value.trim();
    const titulos = document.getElementById("season-titles").value.trim();
    const artilheiro = document.getElementById("season-top-scorer").value.trim();
    const gols = document.getElementById("season-goals").value.trim();
    const assistente = document.getElementById("season-top-assistant").value.trim();
    const assistencias = document.getElementById("season-assists").value.trim();
    const descricao = document.getElementById("season-description").value.trim();

    if (!nome) {
        if (typeof showToast === "function") showToast("Informe a identificação da temporada (ex: S1).", "warning");
        return;
    }

    if (id) {
        const season = window.appState.seasons.find(s => s.id === id);
        if (season) {
            season.nome = nome;
            season.titulos = titulos;
            season.artilheiro = artilheiro;
            season.gols = gols;
            season.assistente = assistente;
            season.assistencias = assistencias;
            season.descricao = descricao;

            if (typeof showToast === "function") showToast("Temporada atualizada com sucesso!", "success");
            if (typeof window.addRecentActivity === "function") {
                window.addRecentActivity(`Temporada ${nome} atualizada`, "fa-calendar-days");
            }
        }
    } else {
        const newSeason = {
            id: 'season_' + Date.now(),
            nome: nome,
            titulos: titulos,
            artilheiro: artilheiro,
            gols: gols,
            assistente: assistente,
            assistencias: assistencias,
            descricao: descricao
        };
        window.appState.seasons.push(newSeason);

        if (typeof showToast === "function") showToast("Temporada salva com sucesso!", "success");
        if (typeof window.addRecentActivity === "function") {
            window.addRecentActivity(`Nova temporada registrada: ${nome}`, "fa-calendar-days");
        }
    }

    const modal = document.getElementById("season-modal");
    if (modal) modal.classList.remove("active");

    window.renderSeasons();
    if (typeof window.updatePainelUI === "function") window.updatePainelUI();
}

/* =====================================================
   EDITAR E EXCLUIR TEMPORADA
===================================================== */
window.editSeason = function(seasonId) {
    openSeasonModal(seasonId);
};

window.deleteSeason = function(seasonId) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Apenas o Lemos pode excluir temporadas.", "error");
        return;
    }

    if (confirm("Deseja realmente excluir esta temporada? Os títulos associados a ela serão removidos da Sala de Troféus.")) {
        const index = window.appState.seasons.findIndex(s => s.id === seasonId);
        if (index !== -1) {
            const removed = window.appState.seasons.splice(index, 1)[0];
            window.renderSeasons();
            if (typeof window.updatePainelUI === "function") window.updatePainelUI();
            if (typeof showToast === "function") showToast("Temporada removida com sucesso.", "success");
            if (typeof window.addRecentActivity === "function") {
                window.addRecentActivity(`Temporada ${removed.nome} removida`, "fa-trash");
            }
        }
    }
};