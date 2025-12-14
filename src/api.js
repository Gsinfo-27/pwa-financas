// ==============================
// Configurações iniciais
// ==============================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Cores para gráficos
const COLORS = {
    VENDAS: { border: '#2a9d8f', background: 'rgba(42, 157, 143, 0.1)', point: '#2a9d8f', pointBorder: '#ffffff' },
    PERCENTUAL: { border: '#e63946', background: 'rgba(230, 57, 70, 0.1)', point: '#e63946', pointBorder: '#ffffff' }
};

let notificacoesAtuais = [];
let badge = null;
let container = null;
let intervaloNotificacoes = null;
let miniCharts = [];

// ==============================
// Funções de utilidade
// ==============================
function base_url() {
    return localStorage.getItem("keygen")
}

function perfil() {
    const user = localStorage.getItem("usuario");
    document.getElementById("user-avatar").textContent = user || '';
}

function getDataHoje() {
    return new Date().toISOString().split('T')[0];
}

function getDataOntem() {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    return ontem.toISOString().split('T')[0];
}

// ==============================
// Funções de requisição
// ==============================
async function requisicao(url) {
    const token = localStorage.getItem("authToken");
    try {
        const response = await fetch(url, { 
            method: 'GET', 
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } 
        });
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        return [];
    }
}

// ==============================
// Notificações
// ==============================
function initNotificacoes() {
    container = document.getElementById("notificacoes-container");
    const btn = document.getElementById("btn-notificacoes");

    if (!badge) {
        badge = document.createElement("span");
        badge.id = "badge-notificacoes";
        badge.className = "badge bg-danger position-absolute top-0 start-100 translate-middle";
        badge.textContent = "0";
        btn.appendChild(badge);
    }

    atualizarNotificacoes();
    intervaloNotificacoes = setInterval(atualizarNotificacoes, 10000); // a cada 10s
}

async function atualizarNotificacoes() {
    try {
        const base = base_url();
        const [lotesResponse, consolidadoResponse] = await Promise.all([
            requisicao(`${base}/api/produtos/listar-lotes`),
            requisicao(`${base}/api/produtos/lerTudo`)
        ]);

        const lotes = Array.isArray(lotesResponse) ? lotesResponse : [];
        const produtos = Array.isArray(consolidadoResponse) ? consolidadoResponse : [];

        const notificacoes = [];

        lotes.forEach(lote => {
            if (lote.quantidade <= 5) {
                notificacoes.push({
                    produto: lote.produto?.nome || 'Desconhecido',
                    quantidade: lote.quantidade
                });
            }
        });

        produtos.forEach(prod => {
            if (prod.quantidadeAtual <= 5) {
                notificacoes.push({
                    produto: prod.nome || 'Desconhecido',
                    quantidade: prod.quantidadeAtual
                });
            }
        });

        notificacoesAtuais = notificacoes;
        badge.textContent = notificacoes.length;

        container.innerHTML = "";
        if (notificacoes.length === 0) {
            container.innerHTML = `
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <strong>!</strong> Nenhuma Notificação.
                </div>
            `;
            return;
        }

        notificacoes.forEach(n => {
            container.innerHTML += `
                <div class="category">
                    <span class="category-name">${n.produto}</span><br>
                    <span class="category-value">Quantidade atual: <b>${n.quantidade}</b></span>
                </div>
            `;
        });

    } catch (error) {
        console.error("Erro ao atualizar notificações:", error);
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Erro ao carregar notificações
            </div>
        `;
    }
}

// ==============================
// KPIs
// ==============================
async function kpis() {
    try {
        const base = base_url();
        const hoje = getDataHoje();
        const ontem = getDataOntem();

        const urls = {
            totalMesas: `${base}/api/caixa/mesas-atendidas?inicio=${hoje}&fim=${hoje}`,
            totalOntem: `${base}/api/caixa/totalVendas?data=${ontem}`,
            totalVenda: `${base}/api/caixa/totalVendas?data=${hoje}`,
            totalCliente: `${base}/api/caixa/totalClientes?data=${hoje}`
        };

        const [totalMesa, totalVendasOntem, totalVenda, totalClientes] = await Promise.all([
            requisicao(urls.totalMesas),
            requisicao(urls.totalOntem),
            requisicao(urls.totalVenda),
            requisicao(urls.totalCliente)
        ]);

        document.getElementById("total-vendas").textContent = totalVenda + " Mt";
        document.getElementById("total-mesa").textContent = totalMesa;
        document.getElementById("total-cliente").textContent = totalClientes;
        document.getElementById("total-vendas-ontem").textContent = totalVendasOntem + " Mt";

    } catch (error) {
        console.error("Erro ao carregar KPIs:", error);
    }
}

// ==============================
// Mini Charts
// ==============================
function createMiniCharts() {
    const miniChartConfigs = [
        { id: 'miniChart1', data: [30, 45, 35, 50, 40, 55], color: '#e63946', background: 'rgba(230, 57, 70, 0.1)' },
        { id: 'miniChart2', data: [40, 35, 45, 30, 50, 42], color: '#2a9d8f', background: 'rgba(42, 157, 143, 0.1)' },
        { id: 'miniChart3', data: [25, 30, 28, 35, 32, 38], color: '#e76f51', background: 'rgba(231, 111, 81, 0.2)' },
        { id: 'miniChart4', data: [20, 35, 25, 40, 30, 45], color: '#e9c46a', background: '#e9c46a', type: 'bar' }
    ];

    miniCharts = miniChartConfigs.map(cfg => {
        const ctx = document.getElementById(cfg.id)?.getContext('2d');
        if (!ctx) return null;

        return new Chart(ctx, {
            type: cfg.type || 'line',
            data: {
                labels: ['', '', '', '', '', ''],
                datasets: [{ data: cfg.data, borderColor: cfg.color, backgroundColor: cfg.background, borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { y: { display: false }, x: { display: false } } }
        });
    });
}

// ==============================
// Tema escuro
// ==============================
themeToggle.addEventListener('click', () => {
    const dark = body.classList.toggle('dark-mode');
    themeToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    updateChartColors();
});

function updateChartColors() {
    const textColor = getComputedStyle(body).getPropertyValue('--text-secondary');
    const gridColor = getComputedStyle(body).getPropertyValue('--border');

    miniCharts.forEach(chart => {
        if (!chart) return;
        chart.options.scales.y.display = false;
        chart.options.scales.x.display = false;
        chart.update();
    });
}

// Mantém o tema salvo
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// ==============================
// Inicialização
// ==============================
document.addEventListener('DOMContentLoaded', async () => {
    perfil();
    initNotificacoes();
    await kpis();
    createMiniCharts();
});
