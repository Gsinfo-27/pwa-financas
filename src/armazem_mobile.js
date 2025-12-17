// armazem_mobile.js - JavaScript completo para mobile

let mobileDOM = {};
let produtoEditandoMobile = null;
let mobileCurrentPage = 1;

// ========== INICIALIZAÇÃO MOBILE ==========
function initMobile() {
   
    
    try {
        // Elementos do formulário mobile
        mobileDOM.descricao = document.getElementById('mobileDescricao');
        mobileDOM.categoria = document.getElementById('mobileCategoria');
        mobileDOM.quantidade = document.getElementById('mobileQuantidade');
        mobileDOM.custo = document.getElementById('mobileCusto');
        mobileDOM.preco = document.getElementById('mobilePreco');
        mobileDOM.codBarras = document.getElementById('mobileCodBarras');
        mobileDOM.encargos = document.getElementById('mobileEncargos');
        mobileDOM.tipoUnidade = document.getElementById('mobileTipoUnidade');
        
        // Filtros e busca
        mobileDOM.categoriaFiltro = document.getElementById('mobileCategoryFilter');
        mobileDOM.searchInput = document.getElementById('mobileSearchInput');
        
        // Botões mobile
        mobileDOM.btnAdicionar = document.getElementById('mobileAdicionar');
        mobileDOM.btnLimpar = document.getElementById('mobileLimpar');
        mobileDOM.btnRefresh = document.getElementById('mobileRefreshBtn');
        mobileDOM.btnSair = document.getElementById('mobileSair');
        mobileDOM.btnEditar = document.getElementById('mobileEditar');
        
        // Elementos de exibição (TABELA)
        mobileDOM.productsTableBody = document.getElementById('mobileProductsTableBody');
        mobileDOM.totalProducts = document.getElementById('mobileTotalProducts');
        mobileDOM.totalValue = document.getElementById('mobileTotalValueDisplay');
        mobileDOM.mobileCurrentPage = document.getElementById('mobileCurrentPage');
        mobileDOM.mobileItemsInfo = document.getElementById('mobileItemsInfo');
        mobileDOM.mobileTotalValue = document.getElementById('mobileTotalValue');
        
        // Elementos de navegação
        mobileDOM.menuBtn = document.getElementById('mobileMenuBtn');
        mobileDOM.nav = document.getElementById('mobileNav');
        mobileDOM.prevBtn = document.getElementById('mobilePrevBtn');
        mobileDOM.nextBtn = document.getElementById('mobileNextBtn');
        
        // Campos de validade
        mobileDOM.tempoValidade = document.getElementById('mobileTempoValidade');
        mobileDOM.periodoValidade = document.getElementById('mobilePeriodoValidade');
        mobileDOM.anoValidade = document.getElementById('mobileAnoValidade');
        
        console.log('Mobile DOM inicializado com sucesso');
        console.log('Elementos encontrados:');
        console.log('- Tabela body:', mobileDOM.productsTableBody ? 'OK' : 'NÃO ENCONTRADO');
        console.log('- Botão adicionar:', mobileDOM.btnAdicionar ? 'OK' : 'NÃO ENCONTRADO');
        console.log('- Filtro categoria:', mobileDOM.categoriaFiltro ? 'OK' : 'NÃO ENCONTRADO');
        
        return true;
    } catch (error) {
        console.error('Erro ao inicializar DOM mobile:', error);
        return false;
    }
}

// ========== MENU MOBILE ==========
function setupMobileMenu() {
    console.log('Configurando menu mobile...');
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const body = document.body;

    // Criar overlay
    let mobileNavOverlay = document.getElementById('mobileNavOverlay');
    if (!mobileNavOverlay) {
        mobileNavOverlay = document.createElement('div');
        mobileNavOverlay.className = 'mobile-nav-overlay';
        mobileNavOverlay.id = 'mobileNavOverlay';
        document.querySelector('.mobile-container').appendChild(mobileNavOverlay);
    }

    // Criar botão fechar se não existir
    let mobileNavClose = document.getElementById('mobileNavClose');
    if (!mobileNavClose && document.querySelector('.mobile-nav-header')) {
        const header = document.querySelector('.mobile-nav-header');
        mobileNavClose = document.createElement('button');
        mobileNavClose.className = 'mobile-nav-close';
        mobileNavClose.id = 'mobileNavClose';
        mobileNavClose.innerHTML = '<i class="fas fa-times"></i>';
        header.appendChild(mobileNavClose);
    }

    // Abrir menu
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileNav.classList.add('show');
            mobileNavOverlay.classList.add('show');
            body.classList.add('menu-open');
            mobileMenuBtn.classList.add('active');
        });
    }

    // Fechar menu com botão X
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileMenu);
    }

    // Fechar menu com overlay
    mobileNavOverlay.addEventListener('click', closeMobileMenu);

    // Fechar menu com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('show')) {
            closeMobileMenu();
        }
    });

    // Fechar menu ao clicar em um item
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            setTimeout(closeMobileMenu, 300);
        });
    });

    // Função para fechar menu
    function closeMobileMenu() {
        if (mobileNav) mobileNav.classList.remove('show');
        if (mobileNavOverlay) mobileNavOverlay.classList.remove('show');
        body.classList.remove('menu-open');
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    }

    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && mobileNav && mobileNav.classList.contains('show')) {
            closeMobileMenu();
        }
    });

    // Exportar função
    window.closeMobileMenu = closeMobileMenu;
}

// ========== FUNÇÕES DE FORMULÁRIO MOBILE ==========
function limparFormularioMobile() {
    if (mobileDOM.descricao) mobileDOM.descricao.value = '';
    if (mobileDOM.categoria) mobileDOM.categoria.value = 'entradas';
    if (mobileDOM.quantidade) mobileDOM.quantidade.value = '';
    if (mobileDOM.custo) mobileDOM.custo.value = '';
    if (mobileDOM.preco) mobileDOM.preco.value = '';
    if (mobileDOM.codBarras) mobileDOM.codBarras.value = '';
    if (mobileDOM.encargos) mobileDOM.encargos.value = '';
    if (mobileDOM.tipoUnidade) mobileDOM.tipoUnidade.value = '';
    
    // Campos de validade
    if (mobileDOM.tempoValidade) mobileDOM.tempoValidade.value = '30';
    if (mobileDOM.periodoValidade) mobileDOM.periodoValidade.value = '01';
    if (mobileDOM.anoValidade) mobileDOM.anoValidade.value = new Date().getFullYear().toString();
    
    produtoEditandoMobile = null;
    
    // Mostrar botão Salvar e esconder Atualizar
    if (mobileDOM.btnAdicionar) {
        mobileDOM.btnAdicionar.style.display = 'flex';
        mobileDOM.btnAdicionar.innerHTML = '<i class="fas fa-save"></i> Salvar';
    }
    if (mobileDOM.btnEditar) {
        mobileDOM.btnEditar.style.display = 'none';
    }
}

// ========== FUNÇÕES DE PRODUTOS MOBILE ==========
async function adicionarProdutoMobile() {
  
    
    // Validar campos obrigatórios
    const camposObrigatorios = [mobileDOM.descricao, mobileDOM.custo, mobileDOM.quantidade];
    let valido = true;
    
    camposObrigatorios.forEach(campo => {
        if (!campo || !campo.value.trim()) {
            campo.classList.add('invalido');
            valido = false;
        } else {
            campo.classList.remove('invalido');
        }
    });
    
    if (!valido) {
        window.commons.mostrarNotificacao("Preencha os campos obrigatórios!", "warning");
        return;
    }

    // Preparar dados do produto
    const produto = {
        id: produtoEditandoMobile ? produtoEditandoMobile.id : undefined,
        nome: mobileDOM.descricao?.value || '',
        descricao: mobileDOM.descricao?.value || '',
        categoria: mobileDOM.categoria?.value || 'entradas',
        quantidade: parseFloat(mobileDOM.quantidade?.value) || 0,
        quantidadeAtual: parseFloat(mobileDOM.quantidade?.value) || 0,
        custo: parseFloat(mobileDOM.custo?.value) || 0,
        custoUnitario: parseFloat(mobileDOM.custo?.value) || 0,
        preco: parseFloat(mobileDOM.preco?.value) || 0,
        precoVenda: parseFloat(mobileDOM.preco?.value) || 0,
        codigoBarras: mobileDOM.codBarras?.value || '',
        encargos: parseFloat(mobileDOM.encargos?.value) || 0,
        unidade: mobileDOM.tipoUnidade?.value || '',
        validade: getValidadeMobile(),
        observacao: "mobile-entrada",
        usuario: localStorage.getItem("usuario") || "admin"
    };

    console.log('Produto a ser enviado:', produto);

    try {
        await window.commons.enviarProdutoServidor(produto);
        
        window.commons.mostrarNotificacao(
            produtoEditandoMobile ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!", 
            "success"
        );
        
        await carregarProdutosMobile();
        limparFormularioMobile();
        
    } catch (error) {
        console.error('Erro ao adicionar produto mobile:', error);
        window.commons.mostrarNotificacao("Erro ao salvar produto: " + error.message, "error");
    }
}

function getValidadeMobile() {
    const tempo = mobileDOM.tempoValidade?.value || '30';
    const mes = mobileDOM.periodoValidade?.value || 
                (new Date().getMonth() + 1).toString().padStart(2, '0');
    const ano = mobileDOM.anoValidade?.value || 
                new Date().getFullYear().toString();
    
    const diaFormatado = tempo.padStart(2, '0');
    const mesFormatado = mes.padStart(2, '0');
    
    return `${ano}-${mesFormatado}-${diaFormatado}`;
}

async function carregarProdutosMobile() {
    console.log('Carregando produtos mobile...');
    
    try {
        const categoria = mobileDOM.categoriaFiltro?.value || '';
        const searchTerm = mobileDOM.searchInput?.value || '';
        const pagina = mobileCurrentPage - 1;
        
        console.log('Parâmetros:', { categoria, searchTerm, pagina });
        
        const resultado = await window.commons.buscarProdutos(categoria, pagina, 10);
        console.log('Resultado recebido:', resultado);
        
        // Atualizar estatísticas
        atualizarEstatisticasMobile(resultado);
        
        // Atualizar tabela
        renderMobileTable(resultado.produtos);
        
        // Atualizar controles de paginação
        atualizarControlesPaginacaoMobile(resultado);
        
    } catch (error) {
        console.error("Erro ao carregar produtos mobile:", error);
        window.commons.mostrarNotificacao("Erro ao carregar produtos", "error");
    }
}

function atualizarEstatisticasMobile(resultado) {
    console.log('Atualizando estatísticas:', resultado);
    
    if (mobileDOM.totalProducts) {
        mobileDOM.totalProducts.textContent = resultado.totalItems || 0;
    }
    
    if (mobileDOM.totalValue) {
        const total = window.commons.produtos.reduce((sum, produto) => {
            return sum + ((produto.custoUnitario || 0) * (produto.quantidadeAtual || 0));
        }, 0);
        mobileDOM.totalValue.textContent = formatarMoeda(total);
    }
    
    if (mobileDOM.mobileTotalValue) {
        const total = window.commons.produtos.reduce((sum, produto) => {
            return sum + ((produto.custoUnitario || 0) * (produto.quantidadeAtual || 0));
        }, 0);
        mobileDOM.mobileTotalValue.textContent = formatarMoeda(total);
    }
}

function renderMobileTable(produtos) {
    console.log('Renderizando tabela com', produtos.length, 'produtos');
    
    const tbody = mobileDOM.productsTableBody;
    if (!tbody) {
        console.error('Tbody não encontrado!');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (produtos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="10" class="mobile-table-empty">
                <i class="fas fa-box-open"></i>
                <p>Nenhum produto encontrado</p>
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }
    
    produtos.forEach((produto, index) => {
        const tr = document.createElement('tr');
        tr.className = 'mobile-table-row';
        
        // Verificar status da validade
        const statusValidade = verificarStatusValidade(produto.validade);
        const dataFormatada = formatarDataMobile(produto.validade);
        
        // Criar conteúdo da célula de categoria
        let categoriaCell = '';
        if (produto.categoria) {
            categoriaCell = `<span class="category-badge-mobile" data-category="${produto.categoria}">
                ${produto.categoria.substring(0, 3).toUpperCase()}
            </span>`;
        }
        
        // Criar conteúdo da célula de validade
        let validadeCell = '';
        if (dataFormatada) {
            validadeCell = `<span class="expiry-status ${statusValidade}">
                ${dataFormatada}
            </span>`;
        }
        
        tr.innerHTML = `
            <td>${produto.id || index + 1}</td>
            <td>${produto.condigoInterno || produto.codInterno || '--'}</td>
            <td title="${produto.codigoBarras || ''}">
                ${(produto.codigoBarras || '').substring(0, 8)}${produto.codigoBarras && produto.codigoBarras.length > 8 ? '...' : ''}
            </td>
            <td title="${produto.nome || produto.descricao || ''}">
                ${(produto.nome || produto.descricao || '').substring(0, 15)}${(produto.nome || produto.descricao || '').length > 15 ? '...' : ''}
            </td>
            <td>${categoriaCell}</td>
            <td>${produto.quantidadeAtual || 0} ${produto.unidade || ''}</td>
            <td>${formatarMoeda(produto.custoUnitario || 0)}</td>
            <td>${formatarMoeda(produto.preco || 0)}</td>
            <td>${validadeCell}</td>
            <td>
                <button class="table-action-btn edit" onclick="editarProdutoMobile(${produto.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="table-action-btn delete" onclick="excluirProdutoMobile(${produto.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        // Adicionar evento de clique para seleção
        tr.addEventListener('click', (e) => {
            if (!e.target.closest('.table-action-btn')) {
                selecionarProdutoMobile(produto);
            }
        });
        
        tbody.appendChild(tr);
    });
    
    console.log('Tabela renderizada com sucesso');
}

function atualizarControlesPaginacaoMobile(resultado) {
    console.log('Atualizando controles de paginação:', resultado);
    
    if (mobileDOM.mobileCurrentPage) {
        mobileDOM.mobileCurrentPage.textContent = mobileCurrentPage;
    }
    
    if (mobileDOM.mobileItemsInfo) {
        const inicio = ((mobileCurrentPage - 1) * 10) + 1;
        const fim = Math.min(inicio + resultado.produtos.length - 1, resultado.totalItems || 0);
        mobileDOM.mobileItemsInfo.textContent = `${inicio}-${fim} de ${resultado.totalItems || 0}`;
    }
    
    if (mobileDOM.prevBtn) {
        mobileDOM.prevBtn.disabled = mobileCurrentPage === 1;
    }
    
    if (mobileDOM.nextBtn) {
        mobileDOM.nextBtn.disabled = mobileCurrentPage >= resultado.totalPages;
    }
}

// ========== FUNÇÕES AUXILIARES MOBILE ==========
function formatarMoeda(valor) {
    const num = parseFloat(valor) || 0;
    return num.toFixed(2) + ' MT';
}

function formatarDataMobile(data) {
    if (!data) return '';
    try {
        if (data.includes('-')) {
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano.substring(2)}`;
        }
        return data;
    } catch (error) {
        console.error('Erro ao formatar data:', error, data);
        return data;
    }
}

function verificarStatusValidade(data) {
    if (!data) return 'ok';
    
    try {
        let dataValidade;
        if (data.includes('-')) {
            const [ano, mes, dia] = data.split('-');
            dataValidade = new Date(ano, mes - 1, dia);
        } else if (data.includes('/')) {
            const [dia, mes, ano] = data.split('/');
            dataValidade = new Date(ano, mes - 1, dia);
        } else {
            return 'ok';
        }
        
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataValidade.setHours(0, 0, 0, 0);
        
        const diferencaDias = Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
        
        if (diferencaDias < 0) return 'expired';
        if (diferencaDias <= 7) return 'warning';
        return 'ok';
    } catch (error) {
        console.error('Erro ao verificar validade:', error);
        return 'ok';
    }
}

// ========== FUNÇÕES DE INTERAÇÃO MOBILE ==========
function selecionarProdutoMobile(produto) {
    console.log('Selecionando produto:', produto);
    
    if (!produto) return;
    
    produtoEditandoMobile = produto;
    
    // Preencher formulário
    if (mobileDOM.descricao) mobileDOM.descricao.value = produto.nome || produto.descricao || '';
    if (mobileDOM.categoria) mobileDOM.categoria.value = produto.categoria || 'entradas';
    if (mobileDOM.quantidade) mobileDOM.quantidade.value = produto.quantidadeAtual || produto.quantidade || '';
    if (mobileDOM.custo) mobileDOM.custo.value = produto.custoUnitario || produto.custo || '';
    if (mobileDOM.preco) mobileDOM.preco.value = produto.preco || produto.precoVenda || '';
    if (mobileDOM.codBarras) mobileDOM.codBarras.value = produto.codigoBarras || '';
    if (mobileDOM.encargos) mobileDOM.encargos.value = produto.encargos || '';
    if (mobileDOM.tipoUnidade) mobileDOM.tipoUnidade.value = produto.unidade || '';
    
    // Preencher campos de validade
    if (produto.validade) {
        try {
            const [ano, mes, dia] = produto.validade.split('-');
            if (mobileDOM.tempoValidade) mobileDOM.tempoValidade.value = dia;
            if (mobileDOM.periodoValidade) mobileDOM.periodoValidade.value = mes;
            if (mobileDOM.anoValidade) mobileDOM.anoValidade.value = ano;
        } catch (error) {
            console.error('Erro ao preencher validade:', error);
        }
    }
    
    // Mostrar botão Atualizar e esconder Salvar
    if (mobileDOM.btnAdicionar) {
        mobileDOM.btnAdicionar.style.display = 'none';
    }
    if (mobileDOM.btnEditar) {
        mobileDOM.btnEditar.style.display = 'flex';
    }
    
    // Rolar para o formulário
    document.querySelector('.mobile-form-card').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function editarProdutoMobile(idProduto) {
    console.log('Editando produto ID:', idProduto);
    const produto = window.commons.produtos.find(p => p.id === idProduto);
    if (produto) {
        selecionarProdutoMobile(produto);
    } else {
        window.commons.mostrarNotificacao("Produto não encontrado", "error");
    }
}

async function excluirProdutoMobile(idProduto) {
    console.log('Excluindo produto ID:', idProduto);
    
    const produto = window.commons.produtos.find(p => p.id === idProduto);
    if (!produto) {
        window.commons.mostrarNotificacao("Produto não encontrado", "error");
        return;
    }
    
    try {
        const result = await Swal.fire({
            title: 'Excluir Produto',
            text: `Deseja realmente excluir "${produto.nome || produto.descricao || 'este produto'}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            const url = await window.commons.base_url();
            const token = localStorage.getItem("authToken");
            
            console.log('Excluindo produto na URL:', `${url}/api/produtos/eliminar/${idProduto}`);
            
            const response = await fetch(`${url}/api/produtos/eliminar/${idProduto}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                window.commons.mostrarNotificacao("Produto excluído com sucesso!", "ssuccess");
                await carregarProdutosMobile();
                limparFormularioMobile();
            } else {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        window.commons.mostrarNotificacao("Erro ao excluir produto: " + error.message, "error");
    }
}

// ========== PAGINAÇÃO MOBILE ==========
function prevPageMobile() {
    if (mobileCurrentPage > 1) {
        mobileCurrentPage--;
        carregarProdutosMobile();
        console.log('Página anterior:', mobileCurrentPage);
    } else {
        window.commons.mostrarNotificacao("Já está na primeira página", "info");
    }
}

function nextPageMobile() {
    if (mobileCurrentPage < window.commons.totalPages) {
        mobileCurrentPage++;
        carregarProdutosMobile();
        console.log('Próxima página:', mobileCurrentPage);
    } else {
        window.commons.mostrarNotificacao("Já está na última página", "info");
    }
}

// ========== NAVEGAÇÃO BOTTOM ==========
function setupBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const sections = {
        stats: '.mobile-stats',
        products: '.mobile-products',
        add: '.mobile-form-card'
    };

    if (bottomNavItems.length > 0) {
        bottomNavItems.forEach(item => {
            item.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                
                // Remover active class de todos
                bottomNavItems.forEach(i => i.classList.remove('active'));
                // Adicionar active ao clicado
                this.classList.add('active');
                
                // Esconder todas as seções
                Object.values(sections).forEach(selector => {
                    const element = document.querySelector(selector);
                    if (element) element.style.display = 'none';
                });
                
                // Mostrar seção selecionada
                const targetSection = sections[section];
                if (targetSection) {
                    const element = document.querySelector(targetSection);
                    if (element) {
                        element.style.display = 'block';
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }
}

// ========== FORMULÁRIO EXPANDIDO ==========
function setupFormularioExpandido() {
    const showFullFormBtn = document.getElementById('showFullFormBtn');
    if (showFullFormBtn) {
        showFullFormBtn.addEventListener('click', function() {
            const fullForm = document.getElementById('mobileFullForm');
            if (fullForm) {
                const isActive = fullForm.classList.toggle('active');
                this.innerHTML = isActive 
                    ? '<i class="fas fa-compress-alt"></i> Ocultar configurações'
                    : '<i class="fas fa-expand-alt"></i> Configurações de Validade';
            }
        });
    }
}

// ========== EVENT LISTENERS MOBILE ==========
function setupEventListenersMobile() {
    console.log('Configurando event listeners mobile...');
    
    // Configurar menu mobile
    setupMobileMenu();
    
    // Botão Salvar (Adicionar)
    if (mobileDOM.btnAdicionar) {
        mobileDOM.btnAdicionar.addEventListener('click', adicionarProdutoMobile);
        console.log('Event listener para btnAdicionar configurado');
    }
    
    // Botão Atualizar (quando editar)
    if (mobileDOM.btnEditar) {
        mobileDOM.btnEditar.addEventListener('click', adicionarProdutoMobile);
        console.log('Event listener para btnEditar configurado');
    }
    
    // Botão Limpar
    if (mobileDOM.btnLimpar) {
        mobileDOM.btnLimpar.addEventListener('click', limparFormularioMobile);
    }
    
    // Botão Atualizar (Refresh)
    if (mobileDOM.btnRefresh) {
        mobileDOM.btnRefresh.addEventListener('click', function() {
            console.log('Atualizando produtos...');
            mobileCurrentPage = 1;
            if (mobileDOM.searchInput) mobileDOM.searchInput.value = '';
            if (mobileDOM.categoriaFiltro) mobileDOM.categoriaFiltro.value = '';
            carregarProdutosMobile();
            window.commons.mostrarNotificacao("Lista atualizada", "success");
        });
    }
    
    // Botão Sair
   // Botão Sair
if (mobileDOM.btnSair) {
    mobileDOM.btnSair.addEventListener('click', function() {
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
    
    // Filtro de categoria
    if (mobileDOM.categoriaFiltro) {
        mobileDOM.categoriaFiltro.addEventListener('change', function() {
            console.log('Filtro categoria alterado:', this.value);
            mobileCurrentPage = 1;
            carregarProdutosMobile();
        });
    }
    
    // Busca por texto
    if (mobileDOM.searchInput) {
        let timeoutId;
        mobileDOM.searchInput.addEventListener('input', function(e) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.log('Busca alterada:', e.target.value);
                mobileCurrentPage = 1;
                carregarProdutosMobile();
            }, 500);
        });
    }
    
    // Navegação bottom
    setupBottomNavigation();
    
    // Formulário expandido
    setupFormularioExpandido();
    
    console.log('Event listeners configurados com sucesso');
}

// ========== INICIALIZAÇÃO MOBILE ==========
function initMobileApp() {
    
    
    // Verificar se estamos no layout mobile
    const mobileContainer = document.querySelector('.mobile-container');
    const appContainer = document.querySelector('.app-container');
    
    if (mobileContainer && window.innerWidth <= 1024) {
        console.log('Layout mobile detectado');
        
        // Mostrar mobile, esconder desktop
        if (appContainer) appContainer.style.display = 'none';
        if (mobileContainer) mobileContainer.style.display = 'block';
        
        // Inicializar componentes mobile
        if (initMobile()) {
            setupEventListenersMobile();
            
            // Carregar produtos após um pequeno delay
            setTimeout(() => {
                console.log('Carregando produtos inicialmente...');
                carregarProdutosMobile();
            }, 500);
            
            return true;
        }
    } else {
        console.log('Layout desktop detectado ou mobile oculto');
        if (appContainer) appContainer.style.display = 'block';
        if (mobileContainer) mobileContainer.style.display = 'none';
    }
    
    return false;
}

// ========== INICIALIZAÇÃO QUANDO A PÁGINA CARREGAR ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Inicializando...');
    initMobileApp();
});

// ========== REDIMENSIONAMENTO DA JANELA ==========
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Janela redimensionada, verificando modo...');
        initMobileApp();
    }, 250);
});

// ========== EXPORTAR FUNÇÕES GLOBAIS ==========
window.prevPageMobile = prevPageMobile;
window.nextPageMobile = nextPageMobile;
window.editarProdutoMobile = editarProdutoMobile;
window.excluirProdutoMobile = excluirProdutoMobile;
window.selecionarProdutoMobile = selecionarProdutoMobile;

// ========== FUNÇÃO DE TESTE ==========
window.testarMobile = function() {
    console.log('=== TESTE MANUAL MOBILE ===');
    console.log('Produtos no commons:', window.commons.produtos);
    console.log('DOM mobile:', mobileDOM);
    console.log('Current page:', mobileCurrentPage);
    
    if (mobileDOM.productsTableBody) {
        console.log('Tabela encontrada, renderizando...');
        renderMobileTable(window.commons.produtos);
    } else {
        console.error('Tabela não encontrada no DOM');
    }
};

