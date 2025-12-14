
const activationCodeInput = document.getElementById('activationCode');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const statusMessage = document.getElementById('statusMessage');

const logoIcon = document.querySelector('.logo-icon');

// Código de exemplo
const DEMO_CODE = "1e7a13-375e-4597-m7v2-fd8b9bd8ad90";

// Regex para UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

submitBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    const code = activationCodeInput.value.trim();

    if (!code) {
        showStatus('Digite o código de ativação', 'error');
        activationCodeInput.classList.add('invalid-input');
        shakeElement(activationCodeInput);
        localStorage.removeItem("keygen");
        return;
    }

    if (!validateUUID(code)) {
        showStatus('Código inválido', 'error');
        activationCodeInput.classList.add('invalid-input');
        shakeElement(activationCodeInput);
        localStorage.removeItem("keygen");
        return;
    }

    showStatus('Verificando código...', 'info');
    submitBtn.disabled = true;
    btnText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

    let acess;
    try {
        acess = await requisicao(`https://administracao.onrender.com/api/keys/${code}`);
    } catch (e) {
        showStatus('Erro ao conectar ao servidor.', 'error');
        submitBtn.disabled = false;
        btnText.innerHTML = 'Ativar';
        return;
    }

   if (acess.httpOk && acess.status === true) {

    activationCodeInput.classList.remove('invalid-input');
    activationCodeInput.classList.add('valid-input');

    // Aqui salvamos a URL do endpoint, não a keygen
    localStorage.setItem("keygen", acess.endpoint);
    localStorage.setItem("endPoint", acess.endpoint);

    showStatus(`Licença ativada para ${acess.cliente}`, 'success');
    btnText.innerHTML = '<i class="fas fa-check"></i> Ativado!';

    setTimeout(() => {
        carregarTela("acess.html"); // SPA sem reload
    }, 800);

} else {
    activationCodeInput.classList.add('invalid-input');

    showStatus(
        'Código inválido ou licença inativa.',
        'error'
    );

    submitBtn.disabled = false;
    btnText.innerHTML = 'Ativar';
}

});



// Validação em tempo real
activationCodeInput.addEventListener('input', function () {
    const code = this.value.trim();

    if (!code) {
        this.classList.remove('valid-input', 'invalid-input');
        return;
    }

    if (validateUUID(code)) {
        this.classList.add('valid-input');
        this.classList.remove('invalid-input');
    } else if (code.length > 10) {
        this.classList.add('invalid-input');
        this.classList.remove('valid-input');
    }
});

// Auto-formatação
activationCodeInput.addEventListener('keyup', function (e) {
    let value = this.value.replace(/[^a-f0-9-]/gi, '').toLowerCase();

    // Adicionar hífens automaticamente
    if (value.length >= 8 && value[8] !== '-') value = value.slice(0, 8) + '-' + value.slice(8);
    if (value.length >= 13 && value[13] !== '-') value = value.slice(0, 13) + '-' + value.slice(13);
    if (value.length >= 18 && value[18] !== '-') value = value.slice(0, 18) + '-' + value.slice(18);
    if (value.length >= 23 && value[23] !== '-') value = value.slice(0, 23) + '-' + value.slice(23);

    this.value = value.substring(0, 36); // Limitar ao tamanho máximo
});

function validateUUID(uuid) {
    return UUID_REGEX.test(uuid);
}

async function requisicao(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();

    return {
        httpOk: response.ok,
        httpStatus: response.status,
        ...data
    };
}



function showStatus(message, type) {
    const icon = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle'
    }[type];

    statusMessage.className = `status ${type}`;
    statusMessage.innerHTML = `<i class="fas fa-${icon}"></i><span>${message}</span>`;
    statusMessage.style.display = 'flex';
}

function shakeElement(element) {
    element.style.transform = 'translateX(0)';
    setTimeout(() => {
        element.style.transition = 'transform 0.1s';
        element.style.transform = 'translateX(-5px)';

        setTimeout(() => {
            element.style.transform = 'translateX(5px)';

            setTimeout(() => {
                element.style.transform = 'translateX(-5px)';

                setTimeout(() => {
                    element.style.transform = 'translateX(0)';
                    element.style.transition = '';
                }, 100);
            }, 100);
        }, 100);
    }, 10);
}

// Focar no input ao carregar
window.addEventListener('load', function () {
    setTimeout(() => {
        activationCodeInput.focus();
    }, 600);
});

// Permitir colar
activationCodeInput.addEventListener('paste', function () {
    setTimeout(() => {
        if (validateUUID(this.value.trim())) {
            showStatus('Código pronto para ativação', 'info');
            this.classList.add('valid-input');
        }
    }, 10);
});
