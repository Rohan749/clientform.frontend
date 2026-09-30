/*!
 * ClientForm embed. Usage:
 *   <script src="https://clientform.space/embed.js" data-clientform="your-form-link" async></script>
 * Adds the form in an iframe right where the script tag is, and keeps the iframe exactly as
 * tall as the form (no inner scrollbars). Several forms can be embedded on one page.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var slug = script.getAttribute("data-clientform");
  if (!slug) {
    console.warn("[ClientForm] Add data-clientform=\"your-form-link\" to the embed script.");
    return;
  }

  var origin = new URL(script.src).origin;
  var iframe = document.createElement("iframe");
  iframe.src = origin + "/f/" + encodeURIComponent(slug) + "?embed=1";
  iframe.title = script.getAttribute("data-title") || "Project request form";
  iframe.setAttribute("loading", "lazy");
  iframe.style.cssText = "display:block;width:100%;height:760px;border:0;background:transparent;overflow:hidden;";
  script.parentNode.insertBefore(iframe, script);

  window.addEventListener("message", function (event) {
    if (event.origin !== origin || event.source !== iframe.contentWindow) return;
    var data = event.data || {};
    if (data.type === "clientform:resize" && typeof data.height === "number" && data.height > 0) {
      iframe.style.height = Math.ceil(data.height) + "px";
    }
    // Next page / thank-you screen: bring the form's top back into view if it's scrolled away.
    if (data.type === "clientform:scroll" && iframe.getBoundingClientRect().top < 0) {
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      iframe.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  });
})();
