/* =====================================================
   ESPANHA — SITE OFICIAL
   ARQUIVO: JS/supabase.js
   INTEGRAÇÃO E BANCO DE DADOS (SUPABASE)
===================================================== */

// Configurações do Supabase da Espanha
const SUPABASE_URL = "https://bggxytsmzvixnciffcmq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_3qjd1CD2Sx6sYYx7Ul1NAw_xwPcexXB";

let supabaseClient = null;

try {
    if (typeof supabase !== "undefined" && supabase.createClient) {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        console.log("✅ Conectado ao Supabase com sucesso.");
    } else {
        console.warn("⚠️ Biblioteca do Supabase não encontrada globalmente. Operando em modo de dados local.");
    }
} catch (error) {
    console.error("Erro ao inicializar Supabase:", error);
}

// Estado global unificado da aplicação
window.appState = {
    isAdmin: false,
    adminName: "",
    presidentName: "Koee_annaa", // Presidência padrão
    players: [],
    statistics: [],
    seasons: [],
    activities: []
};

/* =====================================================
   CARREGAMENTO E SINCRONIZAÇÃO DE DADOS INICIAIS
===================================================== */
window.fetchSupabaseData = async function() {
    try {
        console.log("🔄 Buscando dados atualizados...");

        if (supabaseClient) {
            // Buscando configurações (Presidência)
            const { data: configData } = await supabaseClient
                .from('configuracoes')
                .select('*')
                .eq('id', 'config_espanha')
                .single();

            if (configData && configData.nome_presidenta) {
                window.appState.presidentName = configData.nome_presidenta;
            }

            // Buscando Jogadores
            const { data: playersData } = await supabaseClient
                .from('jogadores')
                .select('*')
                .order('created_at', { ascending: true });

            if (playersData) {
                window.appState.players = playersData.map(p => ({
                    id: p.id,
                    nome: p.nome,
                    posicao: p.posicao,
                    nacionalidade: p.nacionalidade,
                    status: p.status,
                    convocado: p.convocado,
                    numero: p.numero
                }));
            }

            // Buscando Estatísticas
            const { data: statsData } = await supabaseClient
                .from('estatisticas')
                .select('*');

            if (statsData) {
                window.appState.statistics = statsData.map(s => ({
                    playerId: s.player_id,
                    partidas: s.partidas,
                    gols: s.gols,
                    assistencias: s.assistencias,
                    cartoes: s.cartoes
                }));
            }

            // Buscando Temporadas
            const { data: seasonsData } = await supabaseClient
                .from('temporadas')
                .select('*')
                .order('created_at', { ascending: true });

            if (seasonsData) {
                window.appState.seasons = seasonsData.map(s => ({
                    id: s.id,
                    nome: s.nome,
                    titulos: s.descricao, // Armazena a lista de títulos por linha
                    artilheiro: s.artilheiro,
                    gols: s.gols,
                    assistente: s.assistente,
                    assistencias: s.assistencias,
                    descricao: s.observacoes
                }));
            }
        }

        // Atualiza toda a interface do site
        renderAllSections();

    } catch (error) {
        console.error("Erro na busca do Supabase:", error);
        renderAllSections();
    }
};

/* =====================================================
   RENDERIZAÇÃO INTEGRADA DE TODAS AS ABAS
===================================================== */
function renderAllSections() {
    if (typeof window.updatePainelUI === "function") window.updatePainelUI();
    if (typeof window.renderPlayers === "function") window.renderPlayers();
    if (typeof window.renderStatistics === "function") window.renderStatistics();
    if (typeof window.renderSeasons === "function") window.renderSeasons();
    if (typeof window.renderTrophies === "function") window.renderTrophies();
}

/* =====================================================
   AUTENTICAÇÃO EXCLUSIVA (LEMOS)
===================================================== */
window.checkAdminPermission = function(username, password) {
    if (username.trim().toLowerCase() === "lemos") {
        window.appState.isAdmin = true;
        window.appState.adminName = "Lemos";
        document.body.classList.add("admin-authenticated");

        const loginArea = document.getElementById("admin-login-area");
        const dashboardArea = document.getElementById("admin-dashboard");

        if (loginArea) loginArea.classList.add("hidden");
        if (dashboardArea) dashboardArea.classList.remove("hidden");

        if (typeof showToast === "function") {
            showToast("Bem-vindo de volta, Lemos! Modo administrativo ativado.", "success");
        }
        return true;
    } else {
        if (typeof showToast === "function") {
            showToast("Acesso negado. Apenas o Lemos tem permissão.", "error");
        }
        return false;
    }
};

window.logoutAdmin = function() {
    window.appState.isAdmin = false;
    window.appState.adminName = "";
    document.body.classList.remove("admin-authenticated");

    const loginArea = document.getElementById("admin-login-area");
    const dashboardArea = document.getElementById("admin-dashboard");

    if (loginArea) loginArea.classList.remove("hidden");
    if (dashboardArea) dashboardArea.classList.add("hidden");

    if (typeof showToast === "function") {
        showToast("Sessão administrativa encerrada.", "warning");
    }
};

/* =====================================================
   SISTEMA DE CONVOCAÇÃO (VERDE/VERMELHO - MÁXIMO 12)
===================================================== */
window.toggleConvocacao = function(playerId) {
    if (!window.appState.isAdmin) {
        if (typeof showToast === "function") showToast("Apenas o Lemos pode convocar jogadores.", "error");
        return;
    }

    const player = window.appState.players.find(p => p.id === playerId);
    if (!player) return;

    if (!player.convocado) {
        const convocados = window.appState.players.filter(p => p.convocado);
        if (convocados.length >= 12) {
            if (typeof showToast === "function") {
                showToast("Limite de 12 jogadores convocados atingido!", "warning");
            }
            return;
        }
        player.convocado = true;
        player.numero = convocados.length + 1;
    } else {
        player.convocado = false;
        player.numero = null;

        // Reorganiza a numeração de 1 a 12 dos convocados restantes
        let n = 1;
        window.appState.players.filter(p => p.convocado).forEach(p => {
            p.numero = n++;
        });
    }

    renderAllSections();

    if (typeof showToast === "function") {
        showToast(player.convocado ? `${player.nome} convocado!` : `${player.nome} desconvocado.`, "success");
    }
};