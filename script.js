// -----------------------------
// Configurações
// -----------------------------
const WEBHOOK_URL = "https://n8n-chatbot-7szi.onrender.com/webhook/pergunta-visitante
";
const DEBUG = true;

// -----------------------------
// Utilitários de UI (mensagens)
// -----------------------------
function criarMensagem(texto, tipo = "bot") {
  const msg = document.createElement("div");
  msg.className = `msg ${tipo}`;
  msg.textContent = texto;
  return msg;
}

function appendMensagem(texto, tipo = "bot") {
  const mensagens = document.getElementById("mensagens");
  if (!mensagens) return;
  const msg = criarMensagem(texto, tipo);
  mensagens.appendChild(msg);
  mensagens.scrollTop = mensagens.scrollHeight;
}

// -----------------------------
// Título dinâmico
// -----------------------------
function updateTitle() {
  const now = new Date();
  const hour = now.getHours();
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "Bom Dia!";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Boa Tarde!";
  } else {
    greeting = "Boa Noite!";
  }

  document.title = `${greeting} Currículo de Giselle Nunes Santana`;
}

// -----------------------------
// Toggle do chat e tema
// -----------------------------
function setupChatToggle() {
  const chatToggle = document.getElementById("chat-toggle");
  const chatbox = document.getElementById("chatbox");
  if (!chatToggle || !chatbox) return;

  chatToggle.addEventListener("click", () => {
    chatbox.classList.toggle("aberto");
    chatbox.classList.toggle("fechado");
  });
}

function setupThemeToggle() {
  const btnToggle = document.getElementById('toggle-theme');
  if (!btnToggle) return;
  btnToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
    btnToggle.textContent = document.body.classList.contains('dark') ? "☀️ Light Mode" : "🌙 Dark Mode";
  });
}

// -----------------------------
// Envio e tratamento da resposta (n8n)
// -----------------------------
async function enviar() {
  const perguntaInput = document.getElementById("pergunta");
  if (!perguntaInput) {
    if (DEBUG) console.error("DEBUG: input #pergunta não encontrado");
    return;
  }

  const pergunta = perguntaInput.value.trim();
  if (!pergunta) return;

  // Mostra mensagem do usuário
  appendMensagem(pergunta, "usuario");
  perguntaInput.value = "";

  try {
    if (DEBUG) console.log("DEBUG: enviando payload:", { pergunta });

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta }),
      mode: "cors"
    });

    if (DEBUG) console.log("DEBUG: response status:", response.status);

    // lê o corpo apenas uma vez
    const raw = await response.text();
    let dados;
    try {
      dados = JSON.parse(raw);
      if (DEBUG) console.log("DEBUG: response json:", dados);
    } catch {
      if (DEBUG) console.warn("DEBUG: resposta não é JSON, corpo:", raw);
      dados = { mensagem: raw };
    }

    // Normaliza a mensagem final
    let mensagemFinal = null;
    if (dados == null) {
      mensagemFinal = "Resposta vazia do servidor.";
    } else if (typeof dados === "string") {
      mensagemFinal = dados;
    } else if (dados.mensagem) {
      mensagemFinal = dados.mensagem;
    } else if (Array.isArray(dados) && dados[0]?.mensagem) {
      mensagemFinal = dados[0].mensagem;
    } else {
      const values = Object.values(dados).filter(v => typeof v === "string");
      mensagemFinal = values.length ? values[0] : JSON.stringify(dados);
    }

    appendMensagem(mensagemFinal || "Resposta recebida (sem campo mensagem)", "bot");
  } catch (error) {
    console.error("DEBUG: erro no fetch:", error);
    appendMensagem("Erro ao conectar com n8n: " + String(error), "bot");
  }
}

// -----------------------------
// Inicialização e listeners
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
  updateTitle();
  setupChatToggle();
  setupThemeToggle();

  const btn = document.getElementById('btnEnviar');
  const input = document.getElementById('pergunta');

  if (btn) btn.addEventListener('click', enviar);

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        enviar();
      }
    });
  }

  if (DEBUG) console.log("DEBUG: listeners registrados", { btnExists: !!btn, inputExists: !!input });

  // Mensagem inicial opcional
  const mensagens = document.getElementById("mensagens");
  if (mensagens && mensagens.children.length === 0) {
    appendMensagem("Bem-vindo(a)! Eu sou a Gigi, assistente virtual da Giselle. Aqui você vai conhecer suas competências, projetos e certificações que fazem dela uma profissional preparada para desafios em tecnologia 🚀", "bot");
  }
});

