const themeToggle = document.getElementById('themeToggle');
const body = document.body;
let base_url = 'https://api-restaurante-1-6u7x.onrender.com/'; // seu backend local

// Cores para gráficos
const COLORS = {
    VENDAS: { border: '#2a9d8f', background: 'rgba(42, 157, 143, 0.1)', point: '#2a9d8f', pointBorder: '#ffffff' },
    PERCENTUAL: { border: '#e63946', background: 'rgba(230, 57, 70, 0.1)', point: '#e63946', pointBorder: '#ffffff' }
};

// Perfil
function perfil() {
    const user = localStorage.getItem("usuario");
    document.getElementById("user-avatar").textContent = user;
}

// Notificações (polling dos endpoints de produtos/lotes)
let notificacoesAtuais = [];
let badge = null;
let container = null;
let intervaloNotificacoes = null;

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
        const [lotesResponse, consolidadoResponse] = await Promise.all([
            requisicao(`${base_url}api/produtos/listar-lotes`),
            requisicao(`${base_url}api/produtos/lerTudo`)
        ]);

        // Combina os dados em notificações (exemplo: produtos com quantidade <= 5)
        const notificacoes = [];

        lotesResponse.forEach(lote => {
            if (lote.quantidade <= 5) {
                notificacoes.push({
                    produto: lote.produto?.nome || 'Desconhecido',
                    quantidade: lote.quantidade
                });
            }
        });

        consolidadoResponse.forEach(prod => {
            if (prod.quantidadeAtual <= 5) {
                notificacoes.push({
                    produto: prod.nome || 'Desconhecido',
                    quantidade: prod.quantidadeAtual
                });
            }
        });

        notificacoesAtuais = notificacoes;

        // Atualiza badge e container
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


// Funções auxiliares de datas
function getDataOntem() {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    return ontem.toISOString().split('T')[0];
}

function getDataHoje() {
    return new Date().toISOString().split('T')[0];
}

// KPIs
async function kpis() {
    const dataAnterior = getDataOntem();
    const hoje = getDataHoje();

    const urls = {
        totalMesas: `${base_url}api/caixa/mesas-atendidas?inicio=${hoje}&fim=${hoje}`,
        totalOntem: `${base_url}api/caixa/totalVendas?data=${dataAnterior}`,
        totalVenda: `${base_url}api/caixa/totalVendas?data=${hoje}`,
        totalCliente: `${base_url}api/caixa/totalClientes?data=${hoje}`
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
}

// Requisições
async function requisicao(url) {
    const token = localStorage.getItem("authToken");
    try {
        const response = await fetch(url, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// Gráficos (mini charts)
let miniCharts = [];

function createMiniCharts() {
    const ctx1 = document.getElementById('miniChart1').getContext('2d');
    const miniChart1 = new Chart(ctx1, {
        type: 'line',
        data: { labels: ['', '', '', '', '', ''], datasets: [{ data: [30, 45, 35, 50, 40, 55], borderColor: '#e63946', backgroundColor: 'rgba(230, 57, 70, 0.1)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { y: { display: false }, x: { display: false } } }
    });

    const ctx2 = document.getElementById('miniChart2').getContext('2d');
    const miniChart2 = new Chart(ctx2, {
        type: 'line',
        data: { labels: ['', '', '', '', '', ''], datasets: [{ data: [40, 35, 45, 30, 50, 42], borderColor: '#2a9d8f', backgroundColor: 'rgba(42, 157, 143, 0.1)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { y: { display: false }, x: { display: false } } }
    });

    const ctx3 = document.getElementById('miniChart3').getContext('2d');
    const miniChart3 = new Chart(ctx3, {
        type: 'line',
        data: { labels: ['', '', '', '', '', ''], datasets: [{ data: [25, 30, 28, 35, 32, 38], borderColor: '#e76f51', backgroundColor: 'rgba(231, 111, 81, 0.2)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { y: { display: false }, x: { display: false } } }
    });

    const ctx4 = document.getElementById('miniChart4').getContext('2d');
    const miniChart4 = new Chart(ctx4, {
        type: 'bar',
        data: { labels: ['', '', '', '', '', ''], datasets: [{ data: [20, 35, 25, 40, 30, 45], backgroundColor: '#e9c46a', borderColor: '#e9c46a', borderWidth: 0, borderRadius: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { y: { display: false }, x: { display: false } } }
    });

    miniCharts = [miniChart1, miniChart2, miniChart3, miniChart4];
}

// Tema escuro
themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
    updateChartColors();
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

function updateChartColors() {
    const textColor = getComputedStyle(document.body).getPropertyValue('--text-secondary');
    const gridColor = getComputedStyle(document.body).getPropertyValue('--border');

    if (window.historyChart) {
        window.historyChart.options.scales.y.ticks.color = textColor;
        window.historyChart.options.scales.y.grid.color = gridColor;
        window.historyChart.options.scales.x.ticks.color = textColor;
        window.historyChart.options.scales.y1.ticks.color = textColor;
        window.historyChart.update();
    }

    if (miniCharts) {
        miniCharts.forEach(chart => {
            if (chart) {
                chart.options.scales.y.display = false;
                chart.options.scales.x.display = false;
                chart.update();
            }
        });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    perfil();
    initNotificacoes();
    await kpis();
    createMiniCharts();
});
