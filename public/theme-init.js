(function () {
  try {
    var t = localStorage.getItem("vm-theme");
    var sys = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved =
      t === "light"
        ? "light"
        : t === "system"
          ? sys
            ? "dark"
            : "light"
          : "dark";
    document.documentElement.setAttribute("data-theme", resolved);
  } catch {}
})();
