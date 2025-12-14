
 function API_BASE_URL() {
    return localStorage.getItem("keygen")
}

let usuarioAtual = null;

// Toggle Dark/Light Mode
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
    body.classList.add('light-mode');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    carregarDadosUsuario();
});

// Funções da API
async function carregarDadosUsuario() {

    try {
        const username = localStorage.getItem('usuario') || 'TridonJ';
        const response = await fetch(`${API_BASE_URL()}/api/user/check-session?userName=${username}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar dados do usuário');
        }

        const usuario = await response.json();
        usuarioAtual = usuario;
        preencherDadosUsuario(usuario);

    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar dados do usuário', 'error');
    }
}

function preencherDadosUsuario(usuario) {
    // Informações básicas
    document.getElementById('profile-name').textContent = usuario.nome || '-';
    document.getElementById('profile-role').textContent = 'Administrador'; // Baseado no role da API de listar
    document.getElementById('profile-email').textContent = usuario.contactos?.telefone || usuario.contactoValor || '-';
    document.getElementById('profile-phone').textContent = usuario.contactos?.telefone || usuario.contactoValor || '-';

    // Avatar com iniciais
    const iniciais = obterIniciais(usuario.nome);
    document.getElementById('user-avatar').innerHTML = iniciais || '<i class="fas fa-user"></i>';

    // Informações detalhadas
    document.getElementById('info-nome').textContent = usuario.nome || '-';
    document.getElementById('info-apelido').textContent = usuario.apelido || '-';
    document.getElementById('info-documento').textContent = `${usuario.tipoDocumento || ''}: ${usuario.numeroDocumento || ''}`;
    document.getElementById('info-nascimento').textContent = formatarData(usuario.nascimento) || '-';
    document.getElementById('info-sexo').textContent = formatarSexo(usuario.sexo) || '-';
    document.getElementById('info-localizacao').textContent = `${usuario.enderecos?.local || ''}, ${usuario.enderecos?.pais || ''}`;

    // Estatísticas
    document.getElementById('dias-cadastro').textContent = calcularDiasCadastro(usuario.nascimento);
    document.getElementById('status-conta').textContent = 'Ativa';
    document.getElementById('nivel-acesso').textContent = 'Admin';
}

function obterIniciais(nome) {
    if (!nome) return '';
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function formatarData(data) {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarSexo(sexo) {
    const sexos = {
        'M': 'Masculino',
        'F': 'Feminino',
        'Masculino': 'Masculino',
        'Feminino': 'Feminino'
    };
    return sexos[sexo] || sexo || '-';
}

function calcularDiasCadastro(dataNascimento) {
    if (!dataNascimento) return '-';
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffTime = Math.abs(hoje - nascimento);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Modal Alterar Senha
function abrirModalSenha() {
    const modalHTML = `
                <div class="modal-overlay" id="password-modal">
                    <div class="modal">
                        <div class="modal-header">
                            <h3><i class="fas fa-key"></i> Alterar Senha</h3>
                            <button class="modal-close" onclick="fecharModal('password-modal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="password-form">
                                <div class="form-group">
                                    <label for="current-password">Senha Atual</label>
                                    <input type="password" id="current-password" required placeholder="Digite sua senha atual">
                                </div>
                                <div class="form-group">
                                    <label for="new-password">Nova Senha</label>
                                    <input type="password" id="new-password" required minlength="6" placeholder="Mínimo 6 caracteres">
                                    <div class="password-strength" id="password-strength"></div>
                                </div>
                                <div class="form-group">
                                    <label for="confirm-password">Confirmar Nova Senha</label>
                                    <input type="password" id="confirm-password" required placeholder="Digite a nova senha novamente">
                                    <div class="password-match" id="password-match"></div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="fecharModal('password-modal')">
                                Cancelar
                            </button>
                            <button class="btn btn-primary" onclick="alterarSenha()">
                                Alterar Senha
                            </button>
                        </div>
                    </div>
                </div>
            `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Adicionar listeners para validação em tempo real
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    newPasswordInput.addEventListener('input', verificarForcaSenha);
    confirmPasswordInput.addEventListener('input', verificarConfirmacaoSenha);
}

async function alterarSenha() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        mostrarMensagem("Preencha todos os campos", "error");
        return;
    }

    if (newPassword !== confirmPassword) {
        mostrarMensagem("As senhas não coincidem", "error");
        return;
    }

    if (newPassword.length < 6) {
        mostrarMensagem("A senha deve ter pelo menos 6 caracteres", "error");
        return;
    }

    try {
        const username = localStorage.getItem('usuario') || 'TridonJ';
        const response = await fetch(`${API_BASE_URL()}/api/user/alterar-senha?Usuario=${username}&senhaAntiga=${currentPassword}&senhaNova=${newPassword}`, {
            method: 'POST'
        });

        if (response.ok) {
            mostrarMensagem("Senha alterada com sucesso!", "success");
            fecharModal('password-modal');
        } else {
            throw new Error('Erro ao alterar senha');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem("Erro ao alterar senha", "error");
    }
}

// Modal Sessões
function abrirModalSessoes() {
    const modalHTML = `
                <div class="modal-overlay" id="sessions-modal">
                    <div class="modal modal-large">
                        <div class="modal-header">
                            <h3><i class="fas fa-desktop"></i> Sessões Ativas</h3>
                            <button class="modal-close" onclick="fecharModal('sessions-modal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="sessions-info">
                                <p>Último acesso: <span id="ultimo-acesso">${new Date().toLocaleString('pt-BR')}</span></p>
                            </div>
                            <div class="sessions-list">
                                <div class="session-item">
                                    <div class="session-icon">
                                        <i class="fas fa-desktop"></i>
                                    </div>
                                    <div class="session-info">
                                        <div class="session-device">Navegador Web</div>
                                        <div class="session-details">
                                            <span class="session-location"><i class="fas fa-map-marker-alt"></i> Localização atual</span>
                                            <span class="session-time"><i class="fas fa-clock"></i> Agora</span>
                                        </div>
                                    </div>
                                    <div class="session-actions">
                                        <span class="session-badge active">Ativa</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary" onclick="fecharModal('sessions-modal')">
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Modal Editar Perfil
function abrirModalEditarPerfil() {
    const modalHTML = `
                <div class="modal-overlay" id="edit-profile-modal">
                    <div class="modal modal-large">
                        <div class="modal-header">
                            <h3><i class="fas fa-edit"></i> Editar Perfil</h3>
                            <button class="modal-close" onclick="fecharModal('edit-profile-modal')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-profile-form">
                                <div class="form-grid">
                                    <div class="form-group">
                                        <label for="edit-nome">Nome Completo</label>
                                        <input type="text" id="edit-nome" value="${usuarioAtual?.nome || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-apelido">Apelido</label>
                                        <input type="text" id="edit-apelido" value="${usuarioAtual?.apelido || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-telefone">Telefone</label>
                                        <input type="tel" id="edit-telefone" value="${usuarioAtual?.contactos?.telefone || usuarioAtual?.contactoValor || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-nascimento">Data de Nascimento</label>
                                        <input type="date" id="edit-nascimento" value="${usuarioAtual?.nascimento || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-local">Local</label>
                                        <input type="text" id="edit-local" value="${usuarioAtual?.enderecos?.local || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-pais">País</label>
                                        <input type="text" id="edit-pais" value="${usuarioAtual?.enderecos?.pais || ''}">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-secondary" onclick="fecharModal('edit-profile-modal')">
                                Cancelar
                            </button>
                            <button class="btn btn-primary" onclick="salvarEdicaoPerfil()">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function salvarEdicaoPerfil() {
    // Em uma aplicação real, aqui faria a chamada para a API de atualização
    mostrarMensagem("Funcionalidade de edição em desenvolvimento", "info");
    fecharModal('edit-profile-modal');
}

// Funções utilitárias
function verificarForcaSenha() {
    const password = document.getElementById('new-password').value;
    const strengthElement = document.getElementById('password-strength');

    let strength = 0;
    let message = '';
    let color = 'var(--danger)';

    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    switch (strength) {
        case 0:
        case 1:
            message = 'Fraca';
            color = 'var(--danger)';
            break;
        case 2:
            message = 'Média';
            color = 'var(--warning)';
            break;
        case 3:
            message = 'Forte';
            color = 'var(--success)';
            break;
        case 4:
            message = 'Muito Forte';
            color = 'var(--success)';
            break;
    }

    strengthElement.innerHTML = `<span style="color: ${color}">${message}</span>`;
    strengthElement.style.display = password ? 'block' : 'none';
}

function verificarConfirmacaoSenha() {
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const matchElement = document.getElementById('password-match');

    if (!confirmPassword) {
        matchElement.style.display = 'none';
        return;
    }

    if (password === confirmPassword) {
        matchElement.innerHTML = '<span style="color: var(--success)">✓ Senhas coincidem</span>';
        matchElement.style.display = 'block';
    } else {
        matchElement.innerHTML = '<span style="color: var(--danger)">✗ Senhas não coincidem</span>';
        matchElement.style.display = 'block';
    }
}

function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function mostrarMensagem(mensagem, tipo = "info") {
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${tipo}`;
    toast.textContent = mensagem;

    const cores = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--warning)',
        info: 'var(--primary)'
    };

    toast.style.cssText = `
                position: fixed;
                top: 120px;
                right: 20px;
                background: ${cores[tipo] || cores.info};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: var(--shadow);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);

    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
}

// Navegação
function tela(screen) {
    if (screen === 'admin') {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = `${screen}.html`;
    }
}

function recarregar() {
    window.location.reload();
}
