// ================== CONFIGURAÇÃO DO FIREBASE ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// A apiKey do Firebase é pública no navegador. O acesso aos dados é controlado
// pelas regras do Realtime Database.
const firebaseConfig = {
  apiKey: "AIzaSyCKSN_70sgDudhybvCD6Rbir4gs-s3a1oE",
  databaseURL: "https://estacaometeorologicadalke-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const estacaoRef = ref(db, "estacao/atual");

// ================== ELEMENTOS DA PÁGINA ==================
const elTemperatura = document.getElementById("temperatura");
const elUmidade = document.getElementById("umidade");
const elPressaoLocal = document.getElementById("pressaoLocal");
const elPressaoNivelMar = document.getElementById("pressao");
const elChuva = document.getElementById("chuva");
const elBasculadas = document.getElementById("basculadas");
const elHora = document.getElementById("hora");
const elData = document.getElementById("data");
const elStatus = document.getElementById("status");
const elUltimaAtualizacao = document.getElementById("ultimaAtualizacao");

let ultimaAtualizacao = 0;

function formatarNumero(valor, casas, unidade, indisponivel) {
  if (valor === undefined || valor === null || valor === "") {
    return indisponivel;
  }

  const numero = Number(valor);
  return Number.isFinite(numero)
    ? numero.toFixed(casas) + unidade
    : indisponivel;
}

// Atualiza os elementos assim que a estação grava dados no caminho estacao/atual.
onValue(estacaoRef, (snapshot) => {
  const dados = snapshot.val();

  if (!dados || typeof dados !== "object") {
    elStatus.textContent = "Sem dados";
    elUltimaAtualizacao.textContent = "Aguardando a primeira leitura";
    return;
  }

  elTemperatura.textContent = formatarNumero(dados.temperatura, 1, " °C", "--.- °C");
  elUmidade.textContent = formatarNumero(dados.umidade, 0, " %", "-- %");
  elPressaoLocal.textContent = formatarNumero(dados.pressaoLocal, 1, " hPa", "---- hPa");
  elPressaoNivelMar.textContent = formatarNumero(dados.pressaoNivelMar, 1, " hPa", "---- hPa");
  elChuva.textContent = formatarNumero(dados.chuvaMm, 2, " mm", "--.-- mm");

  const numeroBasculadas = Number(dados.basculadas);
  elBasculadas.textContent = dados.basculadas !== undefined &&
      dados.basculadas !== null && Number.isFinite(numeroBasculadas)
    ? Math.max(0, Math.trunc(numeroBasculadas)).toLocaleString("pt-BR")
    : "--";

  elHora.textContent = dados.hora ?? "--:--";
  elData.textContent = dados.data ?? "--/--/----";
  elStatus.textContent = "🟢 Online";
  elUltimaAtualizacao.textContent =
    "Última leitura: " + elHora.textContent + " • " + elData.textContent;

  ultimaAtualizacao = Date.now();
}, (erro) => {
  console.error("Falha ao ler os dados da estação no Firebase:", erro);
  elStatus.textContent = "🔴 Erro no Firebase";
  elUltimaAtualizacao.textContent = "Verifique a conexão e as regras do banco";
});

// O firmware envia leituras a cada 10 segundos. Marca a estação offline
// quando não chega nenhuma atualização por mais de 30 segundos.
setInterval(() => {
  if (ultimaAtualizacao && Date.now() - ultimaAtualizacao > 30000) {
    elStatus.textContent = "🔴 Offline";
    elUltimaAtualizacao.textContent = "Sem leitura nova há mais de 30 segundos";
  }
}, 5000);
