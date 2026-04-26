if (!window.lovableExtensionLoaded) {
  window.lovableExtensionLoaded = true;

  function createUI() {
    if (document.getElementById("lovable-ui")) return;

    const box = document.createElement("div");
    box.id = "lovable-ui";
    box.style = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background: black;
      color: white;
      padding: 10px;
      border-radius: 10px;
      z-index: 999999;
    `;

    box.innerHTML = `
      <textarea id="prompt" style="width:100%;height:80px"></textarea>
      <button id="send">Enviar</button>
    `;

    document.body.appendChild(box);

    document.getElementById("send").onclick = () => {
      const prompt = document.getElementById("prompt").value;
      const textarea = document.querySelector("textarea");

      if (textarea) {
        textarea.value = prompt;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "openUI") {
      createUI();
    }
  });
}