// armazem.js - JavaScript específico para desktop (Versão Corrigida)

// ========== VARIÁVEIS GLOBAIS DESKTOP ==========
let DOM = {};
let produtoEditando = null;

// ========== INICIALIZAÇÃO DESKTOP ==========
function initDesktop() {
    console.log('Inicializando app...');
    
    try {
        // Elementos do formulário desktop
        DOM.id = document.getElementById('idProduto');
        DOM.codInterno = document.getElementById('codInterno');
        DOM.codBarras = document.getElementById('codBarras');
        DOM.descricao = document.getElementById('descricao');
        DOM.categoria = document.getElementById('categoria');
        DOM.categoriaFiltro = document.getElementById('category-filter');
        DOM.quantPeso = document.getElementById('quantPeso');
        DOM.custo = document.getElementById('custo');
        DOM.encargos = document.getElementById('encargos');
        DOM.precoVenda = document.getElementById('precoVenda');
        DOM.tempoValidade = document.getElementById('tempoValidade');
        DOM.periodoValidade = document.getElementById('periodoValidade');
        DOM.anoValidade = document.getElementById('anoValidade');
        DOM.tipoUnidade = document.getElementById('tipoUnidade');

        // Botões desktop
        DOM.btnAdicionar = document.getElementById('adicionar');
        DOM.btnLimpar = document.getElementById('limpar');
        DOM.btnEliminar = document.getElementById('eliminar');
        DOM.btnEditar = document.getElementById('edit-stoke');
       
        DOM.btnVer = document.getElementById('ver');

        // Tabela desktop
        DOM.tabela = document.getElementById('tabelaProdutos');
        DOM.totalValue = document.getElementById('totalValue');
        DOM.searchInput = document.getElementById('searchInput');

        // Elementos de paginação desktop
        DOM.dush = document.getElementById('dush');
        DOM.plus = document.getElementById('plus');
        DOM.inicioItens = document.getElementById('inicioItens');
        DOM.fimItens = document.getElementById('fimItens');
        DOM.totalItens = document.getElementById('totalItens');

        console.log('Desktop DOM inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('Erro ao inicializar DOM:', error);
        return false;
    }
}

// ========== FUNÇÕES DE FORMULÁRIO ==========
function limparFormularioDesktop() {
    if (DOM.id) DOM.id.value = '';
    if (DOM.codInterno) DOM.codInterno.value = '';
    if (DOM.codBarras) DOM.codBarras.value = '';
    if (DOM.descricao) DOM.descricao.value = '';
    if (DOM.categoria) DOM.categoria.selectedIndex = 0;
    if (DOM.quantPeso) DOM.quantPeso.value = '';
    if (DOM.custo) DOM.custo.value = '';
    if (DOM.encargos) DOM.encargos.value = '';
    if (DOM.tempoValidade) DOM.tempoValidade.value = '2';
    if (DOM.periodoValidade) DOM.periodoValidade.selectedIndex = 0;
    if (DOM.anoValidade) DOM.anoValidade.value = new Date().getFullYear().toString();
    if (DOM.tipoUnidade) DOM.tipoUnidade.selectedIndex = 0;
    if (DOM.precoVenda) DOM.precoVenda.value = '';

    produtoEditando = null;
    if (DOM.btnAdicionar) DOM.btnAdicionar.textContent = 'Adicionar Stock';
}

function preencherFormularioDesktop(produto) {
    if (DOM.id) DOM.id.value = produto.id || 0;
    if (DOM.codInterno) DOM.codInterno.value = produto.condigoInterno || '';
    if (DOM.codBarras) DOM.codBarras.value = produto.codigoBarras || '';
    if (DOM.descricao) DOM.descricao.value = produto.nome || '';
    if (DOM.categoria) DOM.categoria.value = produto.categoria || '';
    if (DOM.quantPeso) DOM.quantPeso.value = produto.quantidadeAtual || '';
    if (DOM.custo) DOM.custo.value = produto.custoUnitario || '';
    if (DOM.encargos) DOM.encargos.value = produto.encargos || '';

    if (produto.validade && DOM.tempoValidade && DOM.periodoValidade && DOM.anoValidade) {
        const [ano, mes, dia] = produto.validade.split('-');
        DOM.tempoValidade.value = dia || '2';
        DOM.periodoValidade.value = mes || '01';
        DOM.anoValidade.value = ano || new Date().getFullYear().toString();
    }

    if (DOM.precoVenda) DOM.precoVenda.value = produto.preco || '';
    if (DOM.tipoUnidade) DOM.tipoUnidade.value = produto.unidade || '';
    
    produtoEditando = produto;
    if (DOM.btnAdicionar) DOM.btnAdicionar.textContent = 'Atualizar Stock';
}

// ========== FUNÇÕES DE PRODUTOS ==========
async function adicionarProdutoDesktop() {
    const camposObrigatorios = [DOM.descricao, DOM.custo, DOM.quantPeso];
    if (!window.commons.validarCamposObrigatorios(camposObrigatorios)) {
        window.commons.mostrarNotificacao("Preencha os campos obrigatórios!", "warning");
        return;
    }

    const produto = {
        id: produtoEditando ? produtoEditando.id : undefined,
        cont:parseInt( DOM.id?.value || 0),
        codInterno: DOM.codInterno?.value || '',
        codBarras: DOM.codBarras?.value || '',
        descricao: DOM.descricao?.value || '',
        categoria: DOM.categoria?.value || '',
        unidade: DOM.tipoUnidade?.value || '',
        quantidade: parseFloat(DOM.quantPeso?.value) || 0,
        custo: parseFloat(DOM.custo?.value) || 0,
        precoVenda: parseFloat(DOM.precoVenda?.value) || 0,
        encargos: parseFloat(DOM.encargos?.value) || 0,
        validade: window.commons.formatarDataValidade(
            DOM.tempoValidade?.value || '2',
            DOM.periodoValidade?.value || '01',
            DOM.anoValidade?.value || new Date().getFullYear().toString()
        ),
        observacao: "entrada",
        usuario: localStorage.getItem("usuario") || "admin"
    };

    try {console.log(produto)
           
        await window.commons.enviarProdutoServidor(produto);
        await carregarProdutosDesktop();
        limparFormularioDesktop();
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
    }
}

async function carregarProdutosDesktop() {
    try {
        const categoria = DOM.categoriaFiltro?.value || '';
        const pagina = window.commons.currentPage - 1; // Converter para 0-based
        const resultado = await window.commons.buscarProdutos(categoria, pagina, 10);
        // Atualizar controles de paginação
        atualizarControlesPaginacao(resultado);
        // Atualizar tabela
        atualizarTabelaDesktop();
        // Calcular total
        calcularTotalDesktop();
        
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        window.commons.mostrarNotificacao("Erro ao carregar produtos", "error");
    }
}

function atualizarTabelaDesktop() {
    if (!DOM.tabela) return;

    DOM.tabela.innerHTML = '';

    if (window.commons.produtos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="9" style="text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-box-open" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                Nenhum produto encontrado
            </td>
        `;
        DOM.tabela.appendChild(tr);
        return;
    }

    window.commons.produtos.forEach(produto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${produto.id || ''}</td>
            <td>${produto.condigoInterno || ''}</td>
            <td>${produto.codigoBarras || ''}</td>
            <td>${produto.nome || ''}</td>
            <td><span class="categoria-badge">${produto.categoria || ''}</span></td>
            <td>${produto.quantidadeAtual || 0} ${produto.unidade || ''}</td>
            <td>${formatarMoeda(produto.custoUnitario || 0)}</td>
            <td>${formatarMoeda(produto.preco || 0)}</td>
            <td>${formatarDataParaExibicao(produto.validade) || '-'}</td>
        `;

        tr.addEventListener('click', () => preencherFormularioDesktop(produto));
        tr.addEventListener('dblclick', () => {
            if (confirm(`Editar produto "${produto.nome}"?`)) {
                preencherFormularioDesktop(produto);
            }
        });
        
        DOM.tabela.appendChild(tr);
    });
}

function formatarMoeda(valor) {
    return parseFloat(valor).toFixed(2) + ' MT';
}

function formatarDataParaExibicao(data) {
    if (!data) return '';
    try {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        return data;
    }
}

function atualizarControlesPaginacao(resultado) {
    if (!DOM.dush || !DOM.plus || !DOM.inicioItens || !DOM.fimItens || !DOM.totalItens) {
        return;
    }

    // Atualizar números de página
    DOM.dush.textContent = window.commons.currentPage;
    DOM.plus.textContent = window.commons.totalPages;

    // Calcular itens mostrados
    const itensPorPagina = 10;
    const inicio = ((window.commons.currentPage - 1) * itensPorPagina) + 1;
    let fim = inicio + window.commons.produtos.length - 1;
    
    if (window.commons.produtos.length === 0) {
        fim = inicio - 1;
    }

    // Atualizar contadores
    DOM.inicioItens.textContent = window.commons.produtos.length > 0 ? inicio : 0;
    DOM.fimItens.textContent = fim;
    DOM.totalItens.textContent = resultado.totalItems || 0;


}

function calcularTotalDesktop() {
    if (!DOM.totalValue) return;

    const total = window.commons.produtos.reduce((sum, produto) => {
        return sum + ((produto.custoUnitario || 0) * (produto.quantidadeAtual || 0));
    }, 0);

    DOM.totalValue.textContent = formatarMoeda(total);
}

// ========== EVENT LISTENERS ==========
function setupEventListenersDesktop() {
    // Botões principais
    if (DOM.btnAdicionar) {
        DOM.btnAdicionar.addEventListener('click', adicionarProdutoDesktop);
    }
    
    if (DOM.btnLimpar) {
        DOM.btnLimpar.addEventListener('click', limparFormularioDesktop);
    }
    
    if (DOM.btnEliminar) {
        DOM.btnEliminar.addEventListener('click', confirmarExclusaoDesktop);
    }
    
   
    if (DOM.btnEditar) {
        DOM.btnEditar.addEventListener('click', adicionarQuantidadeDesktop);
    }
    
    if (DOM.btnVer) {
        DOM.btnVer.addEventListener('click', async () => {
            window.commons.currentPage = 1;
            await carregarProdutosDesktop();
        });
    }
    
    // Filtro de categoria
    if (DOM.categoriaFiltro) {
        DOM.categoriaFiltro.addEventListener('change', async () => {
            window.commons.currentPage = 1;
            await carregarProdutosDesktop();
        });
    }
    
    // Busca por texto
    if (DOM.searchInput) {
        let timeoutId;
        DOM.searchInput.addEventListener('input', function(e) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const termo = e.target.value.toLowerCase().trim();
                if (termo === '') {
                    carregarProdutosDesktop();
                } else {
                    filtrarProdutosPorTermo(termo);
                }
            }, 300); // Debounce de 300ms
        });
    }
    
    // Sair
    const btnSair = document.getElementById('sair');
   if (btnSair) {
    btnSair.addEventListener('click', function() {
        Swal.fire({
            title: 'Sair do sistema',
            text: 'Deseja realmente sair?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            // Configurações responsivas:
            customClass: {
                container: 'swal-container',
                popup: 'swal-popup',
                title: 'swal-title',
                confirmButton: 'swal-confirm-btn',
                cancelButton: 'swal-cancel-btn'
            },
            width: window.innerWidth <= 768 ? '90%' : '500px',
            padding: window.innerWidth <= 768 ? '1rem' : '2rem',
            backdrop: true,
            allowOutsideClick: true,
            allowEscapeKey: true,
            allowEnterKey: true
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = 'index.html';
            }
        });
    });
}
    
    // Escutar evento de mudança de página
    document.addEventListener('paginaAlterada', async (event) => {
        console.log('Evento de página alterada recebido:', event.detail);
        await carregarProdutosDesktop();
    });
}

// ========== FUNÇÕES ADICIONAIS ==========
async function confirmarExclusaoDesktop() {
    if (!produtoEditando) {
        window.commons.mostrarNotificacao("Nenhum produto selecionado para excluir", "warning");
        return;
    }

    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: `Deseja realmente excluir o produto "${produtoEditando.nome}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await excluirProdutoDesktop();
                await carregarProdutosDesktop();
                limparFormularioDesktop();
                window.commons.mostrarNotificacao("Produto excluído com sucesso!", "success");
            } catch (error) {
                window.commons.mostrarNotificacao("Erro ao excluir produto", "error");
            }
        }
    } else {
        if (confirm(`Excluir produto "${produtoEditando.nome}"?`)) {
            await excluirProdutoDesktop();
        }
    }
}

async function excluirProdutoDesktop() {
    if (!produtoEditando) return;
    
    try {
        const url = await window.commons.base_url();
        const token = localStorage.getItem("authToken");
        
        const response = await fetch(`${url}/api/produtos/eliminar/${produtoEditando.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir produto');
        }

        return response;
    } catch (error) {
        console.error("Erro na exclusão:", error);
        throw error;
    }
}


async function adicionarQuantidadeDesktop() {
    if (!produtoEditando) {
        window.commons.mostrarNotificacao("Selecione um produto primeiro!", "warning");
        return;
    }

    const quantidade = parseFloat(DOM.quantPeso?.value) || 0;
    if (quantidade <= 0) {
        window.commons.mostrarNotificacao("Informe uma quantidade válida!", "warning");
        return;
    }

    try {
        const url = await window.commons.base_url();
        const token = localStorage.getItem("authToken");
        
        const response = await fetch(`${url}/api/produtos/adicionarStoke`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: produtoEditando.id,
                quantidade: quantidade
            })
        });

        if (response.ok) {
            window.commons.mostrarNotificacao(`Quantidade ${quantidade} adicionada com sucesso!`, "success");
            await carregarProdutosDesktop();
        } else {
            throw new Error('Erro ao adicionar quantidade');
        }
    } catch (error) {
        window.commons.mostrarNotificacao("Não foi possível adicionar quantidade.", "error");
    }
}

function filtrarProdutosPorTermo(termo) {
    if (!DOM.tabela) return;
    
    const linhas = DOM.tabela.querySelectorAll('tr');
    let encontrados = 0;
    
    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        const mostrar = texto.includes(termo);
        linha.style.display = mostrar ? '' : 'none';
        if (mostrar) encontrados++;
    });
    
    if (encontrados === 0 && linhas.length > 0) {
        window.commons.mostrarNotificacao("Nenhum produto encontrado", "info");
    }
}

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos no layout desktop
    const appContainer = document.querySelector('.app-container');
    if (appContainer && appContainer.offsetParent !== null) {
        console.log('Layout desktop detectado');
        if (initDesktop()) {
            setupEventListenersDesktop();
            carregarProdutosDesktop();
        }
    } else {
        console.log('Layout mobile detectado ou desktop oculto');
    }
});

// Exportar funções globais
window.carregarProdutosDesktop = carregarProdutosDesktop;
window.visualizarProduto = carregarProdutosDesktop;