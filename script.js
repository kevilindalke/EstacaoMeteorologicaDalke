function atualizarHora(){

    let agora = new Date();

    document.getElementById("hora").innerHTML =
    agora.toLocaleTimeString("pt-BR");

    document.getElementById("data").innerHTML =
    agora.toLocaleDateString("pt-BR");

}

setInterval(atualizarHora,1000);

atualizarHora();