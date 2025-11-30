// Variáveis globais
let paginaAtual = 1;
let itensPorPagina = 25;
let dadosFiltrados = [];
let dadosLotes = null;
let dadosConsolidados = null;
let modoVisualizacao = 'lotes'; // 'lotes' ou 'consolidado'
const base_url='https://api-restaurante-1-6u7x.onrender.com'
// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    init();
    carregarDados();
});

function init() {
    // Eventos
    document.getElementById('view-mode').addEventListener('change', function(e) {
        modoVisualizacao = e.target.value;
        paginaAtual = 1;
        atualizarTabelaComModoSelecionado();
    });
    
    document.getElementById('category-filter').addEventListener('change', filtrarETabela);
    document.getElementById('search-btn').addEventListener('click', pesquisarProdutos);
    document.getElementById('refresh-btn').addEventListener('click', carregarDados);
    document.getElementById('export-btn').addEventListener('click', exportarDados);
    document.getElementById('items-per-page').addEventListener('change', function(e) {
        itensPorPagina = parseInt(e.target.value);
        paginaAtual = 1;
        atualizarTabelaComModoSelecionado();
    });
    document.getElementById('prev-btn').addEventListener('click', () => mudarPagina(-1));
    document.getElementById('next-btn').addEventListener('click', () => mudarPagina(1));
    
    // Enter na pesquisa
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') pesquisarProdutos();
    });
}

async function carregarDados() {
    try {
        // Carrega ambos os datasets
        const [lotesResponse, consolidadoResponse] = await Promise.all([
            requis(`${base_url}/api/produtos/listar-lotes`),
            requis(`${base_url}/api/produtos/lerTudo`)
        ]);

        dadosLotes = lotesResponse;
        dadosConsolidados = consolidadoResponse;
        
        // Atualiza cards com dados consolidados
        atualizarCards(consolidadoResponse);
        
        // Mostra tabela conforme modo selecionado
        atualizarTabelaComModoSelecionado();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.getElementById("t-view-stok").innerHTML = 
            '<tr><td colspan="7" style="text-align: center; padding: 30px; color: #dc3545;">Erro ao carregar dados</td></tr>';
    }
}

function atualizarTabelaComModoSelecionado() {
    if (modoVisualizacao === 'lotes' && dadosLotes) {
        dadosFiltrados = dadosLotes;
        preencherTabelaPaginada(dadosLotes);
    } else if (modoVisualizacao === 'consolidado' && dadosConsolidados) {
        dadosFiltrados = dadosConsolidados;
        preencherTabelaPaginada(dadosConsolidados);
    }
}

function preencherTabelaPaginada(dados) {
    const tabela = document.getElementById("t-view-stok");
    if (!dados || dados.length === 0) {
        tabela.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #666;">Nenhum produto encontrado</td></tr>';
        atualizarPaginacao(0);
        return;
    }

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const dadosPagina = dados.slice(inicio, fim);

    let html = '';
    
    if (modoVisualizacao === 'lotes') {
        html = gerarTabelaLotes(dadosPagina);
    } else {
        html = gerarTabelaConsolidada(dadosPagina);
    }
    
    tabela.innerHTML = html;
    atualizarPaginacao(dados.length);
}

function gerarTabelaLotes(dados) {
    let html = '';
    dados.forEach(l => {
        const produto = l.produto || {};
        const quantidade = l.quantidade || 0;
        const preco = produto.preco || 0;
        const categoria = produto.categoria || '-';
        const nome = produto.nome || '-';
        const id = produto.id || '-';
        const valorTotal = quantidade * preco;
        console.log(l)
        html += `
            <tr>
                <td><strong>${id}</strong></td>
                <td>${nome}</td>
                <td>${categoria}</td>
                <td><strong>${quantidade}</strong></td>
                <td><strong>${preco.toFixed(2)} MT</strong></td>
                <td><strong>${valorTotal.toFixed(2)} MT</strong></td>
                <td>${formatarData(l.dataEntrada)}</td>
                <td><span class="status ${quantidade > 0 ? 'status-stock' : 'status-falta'}">${quantidade > 0 ? 'EM STOCK' : 'EM FALTA'}</span></td>
                <td class="actions">
                    <button class="action-btn edit-btn" onclick="editarProduto(${id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="excluirLote(${l.id})" title="Excluir Lote">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    return html;
}

function gerarTabelaConsolidada(dados) {
    let html = '';
    dados.forEach(produto => {
        const quantidade = produto.quantidadeAtual || 0;
        const preco = produto.preco || 0;
        const valorTotal = quantidade * preco;
        const categoria = produto.categoria || '-';
        const nome = produto.nome || '-';
        const id = produto.id || '-';
        const data=produto.validade||'-'
        html += `
            <tr>
                <td><strong>${id}</strong></td>
                <td>${nome}</td>
                <td>${categoria}</td>
                <td><strong>${quantidade}</strong></td>
                <td><strong>${preco.toFixed(2)} MT</strong></td>
                <td><strong>${valorTotal.toFixed(2)} MT</strong></td> 
                 <td>${formatarData(data)}</td>
                <td><span class="status ${quantidade > 0 ? 'status-stock' : 'status-falta'}">${quantidade > 0 ? 'EM STOCK' : 'EM FALTA'}</span></td>
                <td class="actions">
                    <button class="action-btn edit-btn" onclick="editarProduto(${id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn view-btn" onclick="verLotesProduto(${id})" title="Ver Lotes">
                        <i class="fas fa-list"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    return html;
}

function formatarData(dataString) {
    if (!dataString) return '-';
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    } catch {
        return dataString;
    }
}

function atualizarPaginacao(totalItens) {
    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    document.getElementById('page-info').textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    document.getElementById('prev-btn').disabled = paginaAtual <= 1;
    document.getElementById('next-btn').disabled = paginaAtual >= totalPaginas;
}

function mudarPagina(delta) {
    const totalPaginas = Math.ceil(dadosFiltrados.length / itensPorPagina);
    paginaAtual = Math.min(Math.max(1, paginaAtual + delta), totalPaginas);
    preencherTabelaPaginada(dadosFiltrados);
}

function filtrarETabela() {
    const filtro = document.getElementById("category-filter").value;
    let dadosBase = modoVisualizacao === 'lotes' ? dadosLotes : dadosConsolidados;
    
    if (!dadosBase) return;

    paginaAtual = 1;
    let dadosParaMostrar = [];

    if (filtro === "todos") {
        dadosParaMostrar = dadosBase;
    } else {
        dadosParaMostrar = dadosBase.filter(item => {
            const categoria = modoVisualizacao === 'lotes' 
                ? (item.produto?.categoria || '')
                : (item.categoria || '');
            
            return categoria.toLowerCase() === filtro.toLowerCase();
        });
    }

    dadosFiltrados = dadosParaMostrar;
    preencherTabelaPaginada(dadosParaMostrar);
}

function pesquisarProdutos() {
    const termo = document.getElementById("search-input").value.toLowerCase().trim();
    let dadosBase = modoVisualizacao === 'lotes' ? dadosLotes : dadosConsolidados;
    
    if (!dadosBase) return;

    paginaAtual = 1;
    let dadosParaMostrar = [];

    if (termo === "") {
        dadosParaMostrar = dadosBase;
    } else {
        dadosParaMostrar = dadosBase.filter(item => {
            if (modoVisualizacao === 'lotes') {
                const produto = item.produto || {};
                const nome = (produto.nome || '').toLowerCase();
                const categoria = (produto.categoria || '').toLowerCase();
                const id = (produto.id || '').toString().toLowerCase();
                
                return nome.includes(termo) || categoria.includes(termo) || id.includes(termo);
            } else {
                const nome = (item.nome || '').toLowerCase();
                const categoria = (item.categoria || '').toLowerCase();
                const id = (item.id || '').toString().toLowerCase();
                
                return nome.includes(termo) || categoria.includes(termo) || id.includes(termo);
            }
        });
    }

    dadosFiltrados = dadosParaMostrar;
    preencherTabelaPaginada(dadosParaMostrar);
}

function atualizarCards(dados) {
    let soma = 0;
    let itemEmFalta = 0;
    let valorTotal = 0;

    dados.forEach(e => {
        const quantidade = e.quantidadeAtual || 0;
        soma += quantidade;
        if (quantidade === 0) itemEmFalta++;
        valorTotal += (e.preco || 0) * quantidade;
    });

    document.getElementById("total-Item").textContent = soma.toLocaleString();
    document.getElementById("stok-em-falta").textContent = itemEmFalta.toLocaleString();
    document.getElementById("em-valor").textContent = valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2});
    document.getElementById("item").textContent = dados.length.toLocaleString();
}

async function requis(url) {
    const token = localStorage.getItem("authToken");
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

function editarProduto(id) {
    alert(`Editar produto: ${id}`);
}

function excluirLote(id) {
    if (confirm(`Tem certeza que deseja excluir este lote?`)) {
        alert(`Lote ${id} excluído`);
        // Implementar exclusão do lote
    }
}

function verLotesProduto(id) {
    // Mudar para visualização de lotes e filtrar por este produto
    modoVisualizacao = 'lotes';
    document.getElementById('view-mode').value = 'lotes';
    // Aqui você pode implementar um filtro para mostrar apenas os lotes deste produto
    alert(`Mostrando lotes do produto ${id}`);
}

function exportarDados() {
    const dadosExportar = modoVisualizacao === 'lotes' ? dadosLotes : dadosConsolidados;
    const tipo = modoVisualizacao === 'lotes' ? 'lotes' : 'produtos consolidados';
    alert(`Exportando ${dadosExportar.length} ${tipo}...`);
}

// Função para limpar pesquisa
function limparPesquisa() {
    document.getElementById("search-input").value = "";
    pesquisarProdutos();
}