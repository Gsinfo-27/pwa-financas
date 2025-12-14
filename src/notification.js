// notification.js - Sistema de notificações bonito e suave

class NotificationSystem {
    constructor() {
        this.container = null;
        this.initContainer();
        this.queue = [];
        this.isProcessing = false;
    }

    // Inicializar container
    initContainer() {
        // Remover container existente se houver
        const existingContainer = document.querySelector('.notification-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
        
        // Adicionar estilos CSS
        this.addStyles();
    }

    // Adicionar estilos CSS
    addStyles() {
        const styleId = 'notification-system-styles';
        if (document.getElementById(styleId)) return;
        
        const styles = `
        /* ============ SISTEMA DE NOTIFICAÇÕES ============ */
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
            pointer-events: none;
        }

        .notification {
            background: white;
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: flex-start;
            gap: 12px;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            pointer-events: auto;
            border-left: 5px solid;
            overflow: hidden;
            position: relative;
        }

        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }

        .notification.hide {
            transform: translateX(400px);
            opacity: 0;
        }

        .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }

        .notification-content {
            flex: 1;
            min-width: 0;
        }

        .notification-title {
            font-size: 15px;
            font-weight: 600;
            margin-bottom: 4px;
            color: #1e293b;
            line-height: 1.3;
        }

        .notification-message {
            font-size: 14px;
            color: #64748b;
            line-height: 1.4;
            margin: 0;
        }

        .notification-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            width: 100%;
            border-radius: 0 0 12px 12px;
            overflow: hidden;
        }

        .notification-progress-bar {
            height: 100%;
            width: 100%;
            transform-origin: left;
            transform: scaleX(1);
            transition: transform 5s linear;
        }

        .notification-close {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 14px;
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            transition: all 0.2s ease;
            flex-shrink: 0;
            margin-left: 8px;
        }

        .notification-close:hover {
            background: #f1f5f9;
            color: #64748b;
        }

        .notification-success {
            border-left-color: #10b981;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .notification-success .notification-icon {
            background: #10b981;
            color: white;
        }

        .notification-success .notification-progress-bar {
            background: #10b981;
        }

        .notification-error {
            border-left-color: #ef4444;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        .notification-error .notification-icon {
            background: #ef4444;
            color: white;
        }

        .notification-error .notification-progress-bar {
            background: #ef4444;
        }

        .notification-warning {
            border-left-color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .notification-warning .notification-icon {
            background: #f59e0b;
            color: white;
        }

        .notification-warning .notification-progress-bar {
            background: #f59e0b;
        }

        .notification-info {
            border-left-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .notification-info .notification-icon {
            background: #3b82f6;
            color: white;
        }

        .notification-info .notification-progress-bar {
            background: #3b82f6;
        }

        @media (max-width: 480px) {
            .notification-container {
                left: 20px;
                right: 20px;
                max-width: none;
            }
            
            .notification {
                padding: 14px 16px;
            }
            
            .notification-title {
                font-size: 14px;
            }
            
            .notification-message {
                font-size: 13px;
            }
        }

        /* Para dark mode */
        @media (prefers-color-scheme: dark) {
            .notification {
                background: #1e293b;
                border-left-color: #3b82f6;
            }
            
            .notification-title {
                color: #f1f5f9;
            }
            
            .notification-message {
                color: #cbd5e1;
            }
            
            .notification-close {
                color: #94a3b8;
            }
            
            .notification-close:hover {
                background: #334155;
                color: #cbd5e1;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
                border-left-color: #10b981;
            }
            
            .notification-error {
                background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
                border-left-color: #ef4444;
            }
            
            .notification-warning {
                background: linear-gradient(135deg, #78350f 0%, #92400e 100%);
                border-left-color: #f59e0b;
            }
            
            .notification-info {
                background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
                border-left-color: #3b82f6;
            }
        }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = styleId;
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Mostrar notificação
    showNotification(title, message, type = 'info', duration = 5000) {
        const notification = this.createNotification(title, message, type, duration);
        this.queue.push(notification);
        this.processQueue();
    }

    // Criar elemento de notificação
    createNotification(title, message, type, duration) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Ícones para cada tipo
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
            <div class="notification-progress">
                <div class="notification-progress-bar"></div>
            </div>
        `;
        
        return { element: notification, duration };
    }

    // Processar fila de notificações
    processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        const { element, duration } = this.queue.shift();
        
        this.container.appendChild(element);
        
        // Animar entrada
        setTimeout(() => {
            element.classList.add('show');
            
            // Iniciar barra de progresso
            const progressBar = element.querySelector('.notification-progress-bar');
            if (progressBar) {
                progressBar.style.transform = 'scaleX(0)';
                progressBar.style.transition = `transform ${duration}ms linear`;
                
                setTimeout(() => {
                    progressBar.style.transform = 'scaleX(1)';
                }, 50);
            }
            
            // Configurar botão de fechar
            const closeBtn = element.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideNotification(element);
                });
            }
            
            // Auto remover após duração
            setTimeout(() => {
                this.hideNotification(element);
            }, duration);
            
            // Permitir próximo processamento após entrada
            setTimeout(() => {
                this.isProcessing = false;
                this.processQueue();
            }, 300);
        }, 50);
    }

    // Esconder notificação
    hideNotification(element) {
        if (!element || !element.parentNode) return;
        
        element.classList.remove('show');
        element.classList.add('hide');
        
        // Remover após animação
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 400);
    }

    // Métodos de conveniência
    success(title, message, duration = 5000) {
        this.showNotification(title, message, 'success', duration);
    }

    error(title, message, duration = 5000) {
        this.showNotification(title, message, 'error', duration);
    }

    warning(title, message, duration = 5000) {
        this.showNotification(title, message, 'warning', duration);
    }

    info(title, message, duration = 5000) {
        this.showNotification(title, message, 'info', duration);
    }

    // Limpar todas as notificações
    clearAll() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        this.queue = [];
        this.isProcessing = false;
    }
}

// Criar e exportar instância global
window.notification = new NotificationSystem();

// Sistema de confirmação customizado (opcional)
window.customConfirm = function(title, message) {
    return new Promise((resolve) => {
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 18px;">${title}</h3>
                <p style="margin: 0; color: #64748b; font-size: 15px; line-height: 1.5;">${message}</p>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button id="confirmCancel" style="
                    padding: 10px 20px;
                    background: #f1f5f9;
                    border: none;
                    border-radius: 8px;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Cancelar</button>
                <button id="confirmOk" style="
                    padding: 10px 20px;
                    background: #3b82f6;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">OK</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Animar entrada
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);
        
        // Event listeners
        document.getElementById('confirmOk').addEventListener('click', () => {
            closeModal(true);
        });
        
        document.getElementById('confirmCancel').addEventListener('click', () => {
            closeModal(false);
        });
        
        // Fechar ao clicar fora
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(false);
            }
        });
        
        // Função para fechar modal
        function closeModal(result) {
            overlay.style.opacity = '0';
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                resolve(result);
            }, 300);
        }
    });
};



console.log('Sistema de notificações carregado com sucesso!');