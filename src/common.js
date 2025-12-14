// common.js - Funções compartilhadas entre desktop e mobile (Versão Corrigida)

// ========== VARIÁVEIS COMPARTILHADAS ==========
window.commons = {
    produtos: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
};

// ========== FUNÇÕES DE API ==========
function base_url() {
    return localStorage.getItem("keygen");
}

async function requisicao(url) {
    const token = localStorage.getItem("authToken");

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        return [];
    }
}

// ========== FUNÇÕES DE PRODUTOS ==========
async function buscarProdutos(categoria = '', pagina = 0, tamanho = 10) {
    try {
        const url = await base_url();
        if (!url) {
            throw new Error("URL base não disponível");
        }
        
        let endpoint = `${url}/api/produtos/lerTudo`;
        console.log(`Buscando produtos de: ${endpoint}`);
        
        const response = await requisicao(endpoint);
        let produtos = response || [];
        
        console.log(`Produtos recebidos: ${produtos.length}`);
        
        // Filtro local por categoria
        if (categoria && categoria !== '') {
            produtos = produtos.filter(produto => 
                produto.categoria && 
                produto.categoria.toLowerCase() === categoria.toLowerCase()
            );
        }
        
        // Paginação local
        const totalItems = produtos.length;
        const totalPages = Math.ceil(totalItems / tamanho) || 1;
        const inicio = pagina * tamanho;
        const fim = Math.min(inicio + tamanho, totalItems);
        const produtosPaginados = produtos.slice(inicio, fim);
        
        // Atualizar variáveis globais
        window.commons.produtos = produtosPaginados;
        window.commons.totalItems = totalItems;
        window.commons.totalPages = totalPages;
        
        return {
            produtos: produtosPaginados,
            totalItems: totalItems,
            totalPages: totalPages,
            currentPage: pagina + 1
        };
        
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        mostrarNotificacao("Erro ao carregar produtos!", "error");
        return { 
            produtos: [], 
            totalItems: 0, 
            totalPages: 1,
            currentPage: 1 
        };
    }
}

// ========== FUNÇÕES DE ENVIO ==========
async function enviarProdutoServidor(produto) {
    try {
        const url = await base_url();
        if (!url) throw new Error("URL base não disponível");

        const endpoint = `${url}/api/produtos/salvar`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto),
        });

        const data = await response.json().catch(() => null); // <-- lê só uma vez

        if (!response.ok) {
            throw new Error(data?.message || 'Erro ao enviar produto');
        }

        mostrarNotificacao(
            `Produto ${produto.id ? 'atualizado' : 'adicionado'} com sucesso!`,
            "success"
        );

        return data;

    } catch (error) {
        mostrarNotificacao("Erro ao enviar produto: " + error.message, "error");
        console.error('Erro ao enviar produto:', error);
        throw error;
    }
}


// ========== FUNÇÕES UTILITÁRIAS ==========
function formatarDataValidade(dia, mes, ano) {
    const mesFormatado = mes.toString().padStart(2, '0');
    const diaFormatado = dia.toString().padStart(2, '0');
    return `${ano}-${mesFormatado}-${diaFormatado}`;
}

function validarCamposObrigatorios(campos) {
    let valido = true;
    
    campos.forEach(campo => {
        if (campo && (!campo.value || campo.value.trim() === '')) {
            campo.classList.add('invalido');
            valido = false;
        } else if (campo) {
            campo.classList.remove('invalido');
        }
    });

    return valido;
}

function mostrarNotificacao(message, type = 'info') {
    if (typeof notification !== 'undefined') {
        const titles = {
            success: 'Sucesso!',
            error: 'Erro!',
            warning: 'Atenção!',
            info: 'Informação'
        };
        
        notification[type](titles[type] || 'Informação', message);
    } else {
        // Fallback simples
        console.log(`${type}: ${message}`);
    }
}

// ========== FUNÇÕES DE PAGINAÇÃO ==========
window.incrementar = async () => {
    if (window.commons.currentPage < window.commons.totalPages) {
        window.commons.currentPage++;
        console.log(`Incrementando para página: ${window.commons.currentPage}`);
        
        // Disparar evento para recarregar produtos
        const event = new CustomEvent('paginaAlterada', { 
            detail: { pagina: window.commons.currentPage } 
        });
        document.dispatchEvent(event);
        
        // Atualizar indicador visual
        if (document.getElementById('dush')) {
            document.getElementById('dush').textContent = window.commons.currentPage;
        }
    } else {
        mostrarNotificacao("Já está na última página", "info");
    }
};

window.decrementar = async () => {
    if (window.commons.currentPage > 1) {
        window.commons.currentPage--;
        console.log(`Decrementando para página: ${window.commons.currentPage}`);
        
        // Disparar evento para recarregar produtos
        const event = new CustomEvent('paginaAlterada', { 
            detail: { pagina: window.commons.currentPage } 
        });
        document.dispatchEvent(event);
        
        // Atualizar indicador visual
        if (document.getElementById('dush')) {
            document.getElementById('dush').textContent = window.commons.currentPage;
        }
    } else {
        mostrarNotificacao("Já está na primeira página", "info");
    }
};

// ========== EXPORTAR FUNÇÕES ==========
// Exportar para uso em outros arquivos
Object.assign(window.commons, {
    base_url,
    requisicao,
    mostrarNotificacao,
    enviarProdutoServidor,
    formatarDataValidade,
    validarCamposObrigatorios,
    buscarProdutos
});

console.log('Common.js carregado com sucesso');
