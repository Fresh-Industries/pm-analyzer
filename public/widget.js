(function () {
  const script = document.currentScript;
  const origin = script.getAttribute("data-origin") || "https://pm-analyzer.dev";
  const projectId = script.getAttribute("data-project-id");
  const defaultColor = script.getAttribute("data-button-color") || "#2563eb";

  // Inject CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${origin}/widget.css`;
  document.head.appendChild(link);

  function createModal() {
    const modal = document.createElement("div");
    modal.id = "pm-analyzer-widget-modal";
    modal.style.display = "none";
    modal.innerHTML = `
      <div class="pm-analyzer-modal-content">
        <span class="pm-analyzer-close">&times;</span>
        <h2>Send Feedback</h2>
        <form id="pm-analyzer-feedback-form">
          <div class="pm-analyzer-toggle">
            <label>
              <input type="radio" name="type" value="feature" checked> Feedback
            </label>
            <label>
              <input type="radio" name="type" value="bug"> Bug Report
            </label>
          </div>
          <textarea name="text" placeholder="Describe your experience..." required></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function openModal(modal) {
    modal.style.display = "block";
  }

  function setupModalHandlers(modal) {
    const closeBtn = modal.querySelector(".pm-analyzer-close");
    closeBtn.onclick = () => (modal.style.display = "none");
    window.onclick = (event) => {
      if (event.target === modal) modal.style.display = "none";
    };

    const form = modal.querySelector("#pm-analyzer-feedback-form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        projectId,
        text: formData.get("text"),
        type: formData.get("type"),
        source: "widget",
        pageUrl: window.location.href,
        browserInfo: navigator.userAgent,
      };

      try {
        const response = await fetch(`${origin}/api/widget/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          alert("Thank you for your feedback!");
          modal.style.display = "none";
          form.reset();
        } else {
          alert("Failed to send feedback.");
        }
      } catch (err) {
        console.error("PM Analyzer Widget Error:", err);
        alert("Error sending feedback.");
      }
    };
  }

  // Modal setup
  const modal = createModal();
  setupModalHandlers(modal);

  // If a custom button exists, wire it up
  const customButtons = document.querySelectorAll("[data-pma-widget]");
  if (customButtons.length > 0) {
    customButtons.forEach((btn) => {
      const type = btn.getAttribute("data-pma-widget");
      if (type === "bug") {
        btn.addEventListener("click", () => {
          modal.querySelector("input[value='bug']").checked = true;
          openModal(modal);
        });
      } else {
        btn.addEventListener("click", () => {
          modal.querySelector("input[value='feature']").checked = true;
          openModal(modal);
        });
      }
    });
    return;
  }

  // Default floating button
  const button = document.createElement("button");
  button.id = "pm-analyzer-widget-trigger";
  button.innerHTML = "Feedback";
  button.style.backgroundColor = defaultColor;
  button.onclick = () => openModal(modal);
  document.body.appendChild(button);
})();
