const chat = document.getElementById("chat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");

let messages = [];
let files = [];

async function loadData() {
  const data = await chrome.storage.local.get(["messages", "files"]);
  messages = data.messages || [];
  files = data.files || [];
  render();
}

async function saveData() {
  await chrome.storage.local.set({ messages, files });
}

function render() {
  chat.innerHTML = "";

  if (messages.length === 0) {
    chat.innerHTML = `
      <div class="empty">
        Nenhuma mensagem ainda.<br>
        Escreva algo abaixo para começar.
      </div>
    `;
  }

  messages.forEach((message, index) => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `
      <strong>Mensagem ${index + 1}</strong>
      ${escapeHtml(message)}
    `;
    chat.appendChild(div);
  });

  fileList.innerHTML = files.length
    ? files.map(file => `📄 ${escapeHtml(file.name)} - ${formatBytes(file.size)}`).join("<br>")
    : "Nenhum arquivo selecionado.";

  chat.scrollTop = chat.scrollHeight;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
}

function generateMarkdown() {
  return `# Lovable Free

## Objetivo

Organizar mensagens, prompts e arquivos para usar no Lovable e editar pelo GitHub.

---

## Mensagens

${messages.map((msg, index) => `### Mensagem ${index + 1}\n\n${msg}`).join("\n\n")}

---

## Arquivos selecionados

${files.length ? files.map(file => `- ${file.name} | ${formatBytes(file.size)} | ${file.type || "tipo desconhecido"}`).join("\n") : "Nenhum arquivo selecionado."}

---

## Pedido para Lovable

Implemente as alterações acima no projeto com design profissional, responsivo, moderno e sem bugs.
`;
}

sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();

  if (!text) {
    alert("Digite uma mensagem primeiro.");
    return;
  }

  messages.push(text);
  messageInput.value = "";

  await saveData();
  render();
});

fileInput.addEventListener("change", async () => {
  const selectedFiles = Array.from(fileInput.files);

  selectedFiles.forEach(file => {
    files.push({
      name: file.name,
      type: file.type,
      size: file.size
    });
  });

  await saveData();
  render();
});

copyBtn.addEventListener("click", async () => {
  const content = generateMarkdown();

  try {
    await navigator.clipboard.writeText(content);
    alert("Conteúdo copiado com sucesso!");
  } catch (error) {
    alert("Erro ao copiar conteúdo.");
    console.error(error);
  }
});

exportBtn.addEventListener("click", () => {
  const content = generateMarkdown();
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  chrome.downloads.download({
    url,
    filename: "lovable-free-prompt.md",
    saveAs: true
  });
});

clearBtn.addEventListener("click", async () => {
  const confirmClear = confirm("Deseja limpar tudo?");

  if (!confirmClear) return;

  messages = [];
  files = [];

  await saveData();
  render();
});

loadData();