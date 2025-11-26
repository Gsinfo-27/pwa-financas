// Registrar service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("Service Worker registrado!"))
    .catch((err) => console.error("Erro ao registrar SW:", err));
}

// Instalação do PWA
let deferredPrompt;
const btnInstall = document.getElementById("btnInstall");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.style.display = "block";
});

btnInstall.addEventListener("click", async () => {
  btnInstall.style.display = "none";
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});
