(function () {
  var katexCdn = "https://lib.baomitu.com/KaTeX/0.16.2/";

  function loadScript(src, onload) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = onload;
    document.head.appendChild(s);
  }

  loadScript(katexCdn + "katex.min.js", function () {
    loadScript(katexCdn + "contrib/auto-render.min.js", function () {
      renderMathInElement(document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    });
  });
})();