(function () {
  const codeBlocks = document.querySelectorAll("pre[data-copy-code]");
  if (!codeBlocks.length) return;

  // One shared live region so screen readers hear the result of a copy
  const status = document.createElement("p");
  status.className = "u-visually-hidden";
  status.setAttribute("role", "status");
  document.body.appendChild(status);

  codeBlocks.forEach((block) => {
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.innerText = "Copy";
    button.setAttribute("aria-label", "Copy code");

    button.addEventListener("click", () => {
      const code = block.querySelector("code").innerText;
      navigator.clipboard.writeText(code).then(() => {
        button.innerText = "Copied!";
        button.classList.add("copied");
        status.textContent = "Code copied to clipboard";

        setTimeout(() => {
          button.innerText = "Copy";
          button.classList.remove("copied");
          status.textContent = "";
        }, 2000);
      });
    });

    block.appendChild(button);
  });
})();
