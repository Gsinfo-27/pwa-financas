// ==========================
// Variáveis Globais
// ==========================
let paginaAtual = 1;
let itensPorPagina = 25;
let dadosFiltrados = [];
let dadosRecebidos = null;

// ==========================
// Theme Toggle
// ==========================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

body.dataset.theme = savedTheme;
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const newTheme = body.dataset.theme === 'light' ? 'dark' : 'light';
    body.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ==========================
// Navegação
// ==========================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-screen="${screenId}"]`);
    if (activeNav) activeNav.classList.add('active');

    if (screenId === 'estoque') {
        initEstoque();
        ler_tudo();
    }
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const screen = item.dataset.screen;
        if (screen) showScreen(screen);
    });
});

// ==========================
// Inicialização do Estoque
// ==========================
function initEstoque() {
    document.getElementById('category-filter').onchange = filtrarETabela;
    document.getElementById('search-btn').onclick = pesquisarProdutos;
    document.getElementById('refresh-btn').onclick = ler_tudo;
    document.getElementById('export-btn').onclick = exportarDados;

    document.getElementById('items-per-page').onchange = e => {
        itensPorPagina = parseInt(e.target.value);
        paginaAtual = 1;
        preencherTabelaPaginada(dadosFiltrados);
    };

    document.getElementById('prev-btn').onclick = () => mudarPagina(-1);
    document.getElementById('next-btn').onclick = () => mudarPagina(1);

    document.getElementById('search-input').onkeypress = e => {
        if (e.key === 'Enter') pesquisarProdutos();
    };
}

// ==========================
// Requisições
// ==========================
async function requis(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("authToken")}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Erro: ${response.status}`);

        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

// ==========================
// Estoque – Lógica Principal
// ==========================
async function ler_tudo() {
    try {
        const url = `https://api-restaurante-ci00.onrender.com/api/produtos/lerTudo`;
        const response = await requis(url);

        dadosRecebidos = response;
        atualizarCards(response);
        preencherTabelaPaginada(response);
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById("t-view-stok").innerHTML =
            '<tr><td colspan="7" class="loading" style="color: var(--danger);">Erro ao carregar dados</td></tr>';
    }
}

function preencherTabelaPaginada(dados) {
    const tabela = document.getElementById("t-view-stok");

    if (!dados?.length) {
        tabela.innerHTML = '<tr><td colspan="7" class="loading">Nenhum produto encontrado</td></tr>';
        atualizarPaginacao(0);
        return;
    }

    dadosFiltrados = dados;
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const dadosPagina = dados.slice(inicio, inicio + itensPorPagina);

    tabela.innerHTML = dadosPagina.map(produto => `
        <tr>
            <td><strong>${produto.id ?? '-'}</strong></td>
            <td>${produto.nome ?? '-'}</td>
            <td>${produto.categoria ?? '-'}</td>
            <td><strong>${produto.quantidadeAtual ?? 0}</strong></td>
            <td><strong>${(produto.preco ?? 0).toFixed(2)} MT</strong></td>
            <td>
                <span class="status ${produto.quantidadeAtual > 0 ? 'status-stock' : 'status-falta'}">
                    ${produto.quantidadeAtual > 0 ? 'EM STOCK' : 'EM FALTA'}
                </span>
            </td>
            <td class="actions">
                <button class="action-btn edit-btn" onclick="editarProduto(${produto.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="excluirProduto(${produto.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    atualizarPaginacao(dados.length);
}

function atualizarPaginacao(totalItens) {
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    document.getElementById('page-info').textContent = `Página ${paginaAtual} de ${totalPaginas}`;

    document.getElementById('prev-btn').disabled = paginaAtual <= 1;
    document.getElementById('next-btn').disabled = paginaAtual >= totalPaginas;
}

function mudarPagina(delta) {
    const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
    paginaAtual = Math.min(Math.max(1, paginaAtual + delta), totalPaginas);
    preencherTabelaPaginada(dadosFiltrados);
}

// ==========================
// Filtros e Pesquisa
// ==========================
function filtrarETabela() {
    if (!dadosRecebidos) return;

    const filtro = document.getElementById("category-filter").value;
    paginaAtual = 1;

    const dadosParaMostrar = filtro === "todos"
        ? dadosRecebidos
        : dadosRecebidos.filter(p => (p.categoria || '').toLowerCase() === filtro.toLowerCase());

    preencherTabelaPaginada(dadosParaMostrar);
}

function pesquisarProdutos() {
    if (!dadosRecebidos) return;

    const termo = document.getElementById("search-input").value.toLowerCase().trim();
    paginaAtual = 1;

    const dadosParaMostrar = termo === ""
        ? dadosRecebidos
        : dadosRecebidos.filter(p =>
            (p.nome || '').toLowerCase().includes(termo) ||
            (p.categoria || '').toLowerCase().includes(termo) ||
            (p.id || '').toString().includes(termo)
        );

    preencherTabelaPaginada(dadosParaMostrar);
}

// ==========================
// Cards Resumo
// ==========================
function atualizarCards(dados) {
    let soma = 0, itemEmFalta = 0, valorTotal = 0;

    dados.forEach(e => {
        soma += e.quantidadeAtual || 0;
        if (e.quantidadeAtual === 0) itemEmFalta++;
        valorTotal += (e.preco || 0) * (e.quantidadeAtual || 0);
    });

    document.getElementById("total-Item").textContent = soma.toLocaleString();
    document.getElementById("stok-em-falta").textContent = itemEmFalta.toLocaleString();
    document.getElementById("em-valor").textContent =
        valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById("item").textContent = dados.length.toLocaleString();
}

// ==========================
// Ações
// ==========================
function editarProduto(id) {
    alert(`Editar produto: ${id}`);
}

function excluirProduto(id) {
    if (confirm(`Tem certeza que deseja excluir o produto ${id}?`)) {
        alert(`Produto ${id} excluído`);
    }
}

function exportarDados() {
    alert('Exportando dados...');
}

// ==========================
// SSE Simulado
// ==========================
function sse() {
    const alertList = document.getElementById('alert-list');
    const badge = document.getElementById('alert-badge');

    setInterval(() => {
        const alerts = [
            { produto: "Cerveja Heineken", quantidade: Math.floor(Math.random() * 15) },
            { produto: "Vinho Tinto", quantidade: Math.floor(Math.random() * 10) },
            { produto: "Queijo Gouda", quantidade: Math.floor(Math.random() * 8) }
        ].filter(a => a.quantidade < 15);

        badge.textContent = alerts.length;

        alertList.innerHTML = alerts.length === 0
            ? `<div class="list-item">
                   <div class="item-info">
                       <h4>Estoque em dia</h4>
                       <div class="item-desc">Todos os produtos com quantidade suficiente</div>
                   </div>
               </div>`
            : alerts.map(a => `
                <div class="list-item">
                    <div class="item-info">
                        <h4>${a.produto}</h4>
                        <div class="item-desc">Stock: ${a.quantidade} unidades</div>
                    </div>
                    <div class="status status-low">Baixo</div>
                </div>
            `).join('');

    }, 5000);
}

// ==========================
// Utilitários
// ==========================
function recarregar() { location.reload(); }
function tela(tela) { window.location.href = `./${tela}.html`; }

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    sse();
});
