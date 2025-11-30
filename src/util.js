function tela(tela) {
  window.location.href = `./${tela}.html`;
}

function recarregar() {
  var tela = localStorage.getItem("tela");
  window.location.href = `./${tela}.html`;
}