/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/jogadores.js
   GERENCIAMENTO DE JOGADORES, ELENCO E CONVOCAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initJogadoresEvents();
});

/* =====================================================
   INICIALIZAÇÃO DOS EVENTOS DE JOGADORES
===================================================== */
function initJogadoresEvents() {
    // Botão de abrir modal para adicionar jogador (visível apenas para o Lemos)
    const addPlayerBtn = document.getElementById("add-player-btn");
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener("click", () => {
            if (!window.appState.isAdmin) {
                if (typeof showToast === "function") showToast("Apenas o Lemos pode adicionar jogadores.", "error");
                return;
            }
            openPlayerModal();
        });
    }

    // Fechar modais
    const closeButtons = document.querySelectorAll("[data-close-modal='player-modal']");
    closeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = document.getElementById("player-modal");
            if (modal) modal.classList.remove("active");
        });
    });

    // Submissão do formulário de jogador (Salvar / Editar)
    const playerForm = document.getElementById("player-form");
    if (playerForm) {
        playerForm.addEventListener("submit", handlePlayerFormSubmit);
    }

    // Barra de pesquisa e filtro de posições
    const searchInput = document.getElementById("player-search");
    if (searchInput) {
        searchInput.addEventListener("input", filterPlayers);
    }

    const positionFilter = document.getElementById("player-position-filter");
    if (positionFilter) {
        positionFilter.addEventListener("change", filterPlayers);
    }
}

/* =====================================================
   RENDERIZAÇÃO DA LISTA DE JOGADORES E ELENCO
===================================================== */
window.renderPlayers = function() {
    const container = document.getElementById("players-container");
    if (!container) return;

    const players = window.appState.players || [];

    // Atualiza contadores no resumo
    const rosterTotalEl = document.getElementById("roster-total");
    const rosterActiveEl = document.getElementById("roster-active");
    const convocados = players.filter(p => p.convocado);

    if (rosterTotalEl) rosterTotalEl.textContent = players.length;
    if (rosterActiveEl) rosterActiveEl.textContent = convocados.length;

    if (players.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-users"></i>
                </div>
                <h3>Elenco vazio</h3>
                <p>Nenhum jogador cadastrado na seleção ainda.</p>
            </div>
        `;
        return;
    }

    let html = "";

    players.forEach(player => {
        // Se estiver convocado, exibe a numeração oficial (1 a 12), senão exibe traço
        const numeroExibicao = player.convocado && player.numero ? player.numero : "--";
        const nacionalidadeStr = player.nacionalidade || "Espanhola";

        // Botões de convocação: Verde se convocado, Vermelho se não convocado
        let botaoConvocacaoHtml = "";
        if (window.appState.isAdmin) {
            if (player.convocado) {
                botaoConvocacaoHtml = `
                    <button onclick="toggleConvocacao('${player.id}')" title="Desconvocar jogador" style="background: var(--green-soft); color: var(--green); border: 1px solid var(--green); display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700;">
                        <i class="fa-solid fa-check"></i> Convocado
                    </button>
                `;
            } else {
                botaoConvocacaoHtml = `
                    <button onclick="toggleConvocacao('${player.id}')" title="Convocar para o elenco (Máx 12)" style="background: var(--danger-soft); color: var(--danger); border: 1px solid var(--danger); display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700;">
                        <i class="fa-solid fa-xmark"></i> Não convocado
                    </button>
                `;
            }
        } else {
            // Apenas visualização para quem não é o Lemos
            if (player.convocado) {
                botaoConvocacaoHtml = `<span style="background: var(--green-soft); color: var(--green); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800;">Convocado (${numeroExibicao})</span>`;
            } else {
                botaoConvocacaoHtml = `<span style="background: var(--danger-soft); color: var(--danger); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800;">Não convocado</span>`;
            }
        }

        // Ações de editar/excluir (disponíveis apenas para o Lemos)
        let acoesAdminHtml = "";
        if (window.appState.isAdmin) {
            acoesAdminHtml = `
                <div class="player-card-actions">
                    <button onclick="editPlayer('${player.id}')" title="Editar jogador">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-player" onclick="deletePlayer('${player.id}')" title="Excluir jogador">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        }

        html += `
            <div class="player-card" data-name="${player.nome.toLowerCase()}" data-position="${player.posicao}">
                <div class="player-card-header">
                    <span class="player-number">${numeroExibicao}</span>
                    <div class="player-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                </div>

                <div class="player-card-body">
                    <h3>${player.nome}</h3>
                    <span class="player-position">${player.posicao}</span>

                    <div style="margin-bottom: 10px; display: flex; justify-content: center;">
                        ${botaoConvocacaoHtml}
                    </div>

                    <div class="player-details">
                        <div class="player-detail">
                            <strong>${nacionalidadeStr}</strong>
                            <span>Nacionalidade</span>
                        </div>
                        <div class="player-detail">
                            <strong>${player.status || 'Ativo'}</strong>
                            <span>Situação</span>
                        </div>
                    </div>
                </div>

                ${acoesAdminHtml}
            </div>
        `;
    });

    container.innerHTML = html;
};

/* =====================================================
   ABRIR MODAL PARA CRIAR / EDITAR JOGADOR
===================================================== */
function openPlayerModal(playerId = null) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Acesso restrito ao Lemos.", "error");
        return;
    }

    const modal = document.getElementById("player-modal");
    const titleEl = document.getElementById("player-modal-title");
    const form = document.getElementById("player-form");
    
    if (!modal || !form) return;

    form.reset();
    document.getElementById("player-id").value = "";

    if (playerId) {
        titleEl.textContent = "Editar jogador";
        const player = window.appState.players.find(p => p.id === playerId);
        if (player) {
            document.getElementById("player-id").value = player.id;
            document.getElementById("player-name").value = player.nome;
            document.getElementById("player-position").value = player.posicao;
            document.getElementById("player-nationality").value = player.nacionalidade || "";
            document.getElementById("player-status").value = player.status || "Ativo";
        }
    } else {
        titleEl.textContent = "Adicionar jogador";
        document.getElementById("player-nationality").value = "Espanhola";
    }

    modal.classList.add("active");
}

/* =====================================================
   SALVAR JOGADOR (CADASTRO / EDIÇÃO)
===================================================== */
function handlePlayerFormSubmit(e) {
    e.preventDefault();

    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Apenas o Lemos pode salvar alterações.", "error");
        return;
    }

    const id = document.getElementById("player-id").value;
    const nome = document.getElementById("player-name").value.trim();
    const posicao = document.getElementById("player-position").value;
    const nacionalidade = document.getElementById("player-nationality").value.trim() || "Espanhola";
    const status = document.getElementById("player-status").value;

    if (!nome || !posicao) {
        if (typeof showToast === "function") showToast("Preencha todos os campos obrigatórios.", "warning");
        return;
    }

    if (id) {
        // Editando jogador existente
        const player = window.appState.players.find(p => p.id === id);
        if (player) {
            player.nome = nome;
            player.posicao = posicao;
            player.nacionalidade = nacionalidade;
            player.status = status;
            if (typeof showToast === "function") showToast("Jogador atualizado com sucesso!", "success");
            if (typeof window.addRecentActivity === "function") {
                window.addRecentActivity(`Jogador ${nome} atualizado`, "fa-users");
            }
        }
    } else {
        // Criando novo jogador (não convocado por padrão até clicar no botão verde)
        const newPlayer = {
            id: 'player_' + Date.now(),
            nome: nome,
            posicao: posicao,
            nacionalidade: nacionalidade,
            status: status,
            convocado: false,
            numero: null
        };
        window.appState.players.push(newPlayer);
        if (typeof showToast === "function") showToast("Jogador adicionado com sucesso!", "success");
        if (typeof window.addRecentActivity === "function") {
            window.addRecentActivity(`Novo jogador cadastrado: ${nome}`, "fa-user-plus");
        }
    }

    // Fecha o modal e atualiza interface
    const modal = document.getElementById("player-modal");
    if (modal) modal.classList.remove("active");

    window.renderPlayers();
    if (typeof window.updatePainelUI === "function") {
        window.updatePainelUI();
    }
}

/* =====================================================
   EDITAR E EXCLUIR JOGADOR
===================================================== */
window.editPlayer = function(playerId) {
    openPlayerModal(playerId);
};

window.deletePlayer = function(playerId) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Apenas o Lemos pode excluir jogadores.", "error");
        return;
    }

    if (confirm("Tem certeza que deseja excluir este jogador?")) {
        const index = window.appState.players.findIndex(p => p.id === playerId);
        if (index !== -1) {
            const removed = window.appState.players.splice(index, 1)[0];
            
            // Reorganiza a numeração dos convocados restantes
            let idx = 1;
            window.appState.players.filter(p => p.convocado).forEach(p => {
                p.numero = idx++;
            });

            window.renderPlayers();
            if (typeof window.updatePainelUI === "function") window.updatePainelUI();
            if (typeof showToast === "function") showToast("Jogador excluído com sucesso.", "success");
            if (typeof window.addRecentActivity === "function") {
                window.addRecentActivity(`Jogador ${removed.nome} removido`, "fa-trash");
            }
        }
    }
};

/* =====================================================
   FILTRAR E PESQUISAR JOGADORES
===================================================== */
function filterPlayers() {
    const searchInput = document.getElementById("player-search");
    const positionFilter = document.getElementById("player-position-filter");
    
    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedPosition = positionFilter ? positionFilter.value : "";

    const cards = document.querySelectorAll(".player-card");

    cards.forEach(card => {
        const name = card.getAttribute("data-name") || "";
        const position = card.getAttribute("data-position") || "";

        const matchesQuery = name.includes(query);
        const matchesPosition = selectedPosition === "" || position === selectedPosition;

        if (matchesQuery && matchesPosition) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}