// ================== CONFIGURAÇÃO DO FIREBASE ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

// A apiKey do Firebase não é secreta, ela é feita para ficar visível
// no navegador. Quem protege seus dados de verdade são as REGRAS do
// Realtime Database (Firebase Console > Realtime Database > Regras).
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
const elPressao = document.getElementById("pressao");
const elHora = document.getElementById("hora");
const elData = document.getElementById("data");
const elStatus = document.getElementById("status");

let ultimaAtualizacao = 0;

// ================== OUVINTE EM TEMPO REAL ==================
// onValue roda toda vez que o nó "estacao/atual" muda no Firebase.
// Ou seja: assim que a ESP32 grava um dado novo, a página atualiza
// sozinha, sem F5 e sem precisar mais do IP local da estação.
onValue(estacaoRef, (snapshot) => {
  const dados = snapshot.val();
  if (!dados) return;

  elTemperatura.innerHTML = Number(dados.temperatura).toFixed(1) + " °C";
  elUmidade.innerHTML = dados.umidade + " %";
  elPressao.innerHTML = Number(dados.pressaoNivelMar).toFixed(1) + " hPa";
  elHora.innerHTML = dados.hora;
  elData.innerHTML = dados.data;
  elStatus.innerHTML = "🟢 Online";

  ultimaAtualizacao = Date.now();
}, (erro) => {
  console.log(erro);
  elStatus.innerHTML = "🔴 Offline";
});

// ================== DETECÇÃO DE ESP32 OFFLINE ==================
// A ESP32 envia um dado novo a cada 10s. Se passar 30s sem nenhuma
// atualização, mostra "Offline" (estação desligada ou sem Wi-Fi),
// mesmo que o site continue conectado ao Firebase normalmente.
setInterval(() => {
  if (ultimaAtualizacao && Date.now() - ultimaAtualizacao > 30000) {
    elStatus.innerHTML = "🔴 Offline";
  }
}, 5000);