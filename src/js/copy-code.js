(function () {
  const codeBlocks = document.querySelectorAll("pre[data-copy-code]");

  codeBlocks.forEach((block) => {
    const button = document.createElement("button");
    button.className = "copy-code-button";
    button.type = "button";
    button.innerText = "Copy";
    button.ariaLabel = "Copy code to clipboard";

    button.addEventListener("click", () => {
      const code = block.querySelector("code").innerText;
      navigator.clipboard.writeText(code).then(() => {
        button.innerText = "Copied!";
        button.classList.add("copied");

        setTimeout(() => {
          button.innerText = "Copy";
          button.classList.remove("copied");
        }, 2000);
      });
    });

    block.appendChild(button);
  });
})();
