class AuthService {
  constructor() {
    this.tokenKey = 'authToken';
    this.roleToPage = {
      ROLE_ADMIN: "data",
    };
  }

  baseUrl() {
    return localStorage.getItem("keygen");
  }

  showLoading() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.classList.add('loading');
  }

  hideLoading() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.classList.remove('loading');
  }

  async login(username, password) {


    this.showLoading();

    try {
      const base = await this.baseUrl();
      const url = `${base}/api/user/login`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: username, senha: password })
      });

      if (!response.ok) {
        this.showError("Usuário ou senha inválidos!");
        this.hideLoading();
        return false;
      }

      const data = await response.json();

      if (!data.token) {
        this.showError("Token inválido!");
        this.hideLoading();
        return false;
      }

      localStorage.setItem(this.tokenKey, data.token);

      const decoded = this.parseJwt(data.token);
      localStorage.setItem("usuario", decoded.sub);

      const tela = this.telas(decoded.role);

      if (tela) {
        localStorage.setItem("acessoCadastro", this.acessoLogin(decoded.role));
        localStorage.setItem("tela", tela);

        await this.sessao(decoded.sub);
        window.location.href = `./${tela}.html`;
        return true;
      }

      this.showError("Funcionário não cadastrado!");
      this.hideLoading();
      return false;

    } catch (error) {
      console.error(error);
      this.showError("Erro ao conectar com o servidor!");
      this.hideLoading();
      return false;
    }
  }

  async sessao(usuario) {
    const base = await this.baseUrl(); // CORREÇÃO AQUI
    let url = `${base}/api/user/sessao?nome=${usuario}`;
    await this.requisicao(url);
  }

  parseJwt(token) {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  telas(role) {
    return this.roleToPage[role] || null;
  }

  acessoLogin(role) {
    return role === "ROLE_ADMIN";
  }

  async requisicao(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error();
      return await response.json();

    } catch (error) {
      console.error("Erro:", error);
    }
  }

  showError(msg) {
    let element = document.getElementById("login-error");
    if (!element) {
      element = document.createElement("p");
      element.id = "login-error";
      element.style.color = "red";
      element.style.marginTop = "10px";
      document.querySelector(".executive-portal").appendChild(element);
    }
    element.innerText = msg;
  }

  initLogin() {
    const loginBtn = document.getElementById("login-btn");
    const sair = document.getElementById("fechar");

    console.log("init login...");

    sair.addEventListener("click", (e) => {
      e.preventDefault();
      window.close();
    });

    loginBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !password) {
        this.showError("Preencha todos os campos!");
        return;
      }

      await this.login(username, password);
    });
  }
}

export function initAcess() {
  const auth = new AuthService();
  auth.initLogin();
}
