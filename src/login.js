class ModernLogin {
    constructor() {
        this.authService = new AuthService();
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkRememberedUser();
        this.hideError(); // Esconder erro inicialmente
    }

    
    bindEvents() {
        // Toggle password visibility
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });

        // Form submission
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Input animations
        this.setupInputAnimations();

        // Limpar erro quando usuário digitar
        this.setupErrorClearing();
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('.input-group input');
        
        inputs.forEach(input => {
            // Focus effect
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
                this.hideError(); // Esconder erro ao focar
            });

            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }

    setupErrorClearing() {
        const inputs = document.querySelectorAll('#username, #password');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.hideError();
            });
        });
    }

    showError(message) {
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    hideError() {
        const errorElement = document.getElementById('login-error');
        errorElement.classList.remove('show');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');

        // Validação básica
        if (!username || !password) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        // Mostrar loading
        this.setLoadingState(loginBtn, true);
        this.hideError();

        try {
            // Usar o AuthService para login
            const loginSuccess = await this.authService.login(username, password);

            if (loginSuccess) {
                if (rememberMe) {
                    this.rememberUser(username);
                }
                
                this.showNotification('Login realizado com sucesso! Redirecionando...', 'success');
                
                // O redirecionamento é feito automaticamente pelo AuthService
                // após definir localStorage e window.location.href
                
            } else {
                // A mensagem de erro já é definida pelo AuthService no DOM
                // Mas vamos garantir que o erro seja mostrado
                const errorElement = document.getElementById('login-error');
                if (errorElement.textContent) {
                    this.showError(errorElement.textContent);
                } else {
                    this.showError('Erro ao fazer login. Tente novamente.');
                }
            }

        } catch (error) {
            console.error('Erro no login:', error);
            this.showError('Erro de conexão. Verifique sua internet.');
        } finally {
            this.setLoadingState(loginBtn, false);
        }
    }

    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    rememberUser(username) {
        localStorage.setItem('rememberedUser', username);
    }

    checkRememberedUser() {
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('rememberMe').checked = true;
            
            // Trigger focus para ativar animação
            document.getElementById('username').focus();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationText = notification.querySelector('.notification-text');
        
        notificationText.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Auto-hide apenas para sucesso
        if (type === 'success') {
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new ModernLogin();
});

// Efeitos adicionais para melhor UX
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar classe loaded para animações de entrada
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Auto-focus no campo de usuário se estiver vazio
    const usernameInput = document.getElementById('username');
    if (!usernameInput.value) {
        setTimeout(() => {
            usernameInput.focus();
        }, 500);
    }
});

// Prevenir zoom no iOS em inputs
document.addEventListener('touchstart', function() {}, { passive: true });

// Tecla Enter para submeter formulário
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        
        if (!loginBtn.disabled) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});