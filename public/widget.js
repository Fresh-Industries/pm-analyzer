/**
 * PM Analyzer Embeddable Widget
 * 
 * Usage:
 * <script src="https://your-pm-analyzer.com/widget.js"></script>
 * <button data-pma-widget="feedback" data-pma-project="project-id">Give Feedback</button>
 * <button data-pma-widget="bug" data-pma-project="project-id">Report Bug</button>
 */

(function() {
  'use strict';

  // Widget configuration
  const WIDGET_ORIGIN = '{{WIDGET_ORIGIN}}' || window.location.origin;
  
  // State
  let isOpen = false;
  let currentProjectId = null;
  let currentMode = 'feedback'; // 'feedback' or 'bug'

  // Create widget styles
  const styles = `
    .pma-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .pma-widget-button {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .pma-widget-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }

    .pma-widget-modal {
      display: none;
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 400px;
      max-width: calc(100vw - 40px);
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      overflow: hidden;
      z-index: 999999;
    }

    .pma-widget-modal.active {
      display: block;
      animation: pma-slide-up 0.3s ease;
    }

    @keyframes pma-slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pma-widget-header {
      background: #2563eb;
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pma-widget-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .pma-widget-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.8;
    }

    .pma-widget-close:hover {
      opacity: 1;
    }

    .pma-widget-body {
      padding: 20px;
    }

    .pma-widget-field {
      margin-bottom: 16px;
    }

    .pma-widget-label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .pma-widget-input,
    .pma-widget-textarea,
    .pma-widget-select {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .pma-widget-input:focus,
    .pma-widget-textarea:focus,
    .pma-widget-select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .pma-widget-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .pma-widget-submit {
      width: 100%;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .pma-widget-submit:hover {
      background: #1d4ed8;
    }

    .pma-widget-submit:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .pma-widget-success {
      text-align: center;
      padding: 40px 20px;
    }

    .pma-widget-success-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .pma-widget-success h4 {
      margin: 0 0 8px;
      color: #059669;
    }

    .pma-widget-error {
      background: #fef2f2;
      color: #dc2626;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 16px;
      font-size: 13px;
    }

    .pma-widget-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .pma-widget-toggle-btn {
      flex: 1;
      padding: 8px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pma-widget-toggle-btn.active {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
  `;

  // Inject styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Create container
  const container = document.createElement('div');
  container.className = 'pma-widget-container';
  container.innerHTML = `
    <button class="pma-widget-button" id="pma-widget-btn">Give Feedback</button>
    <div class="pma-widget-modal" id="pma-widget-modal">
      <div class="pma-widget-header">
        <h3 id="pma-widget-title">Send Feedback</h3>
        <button class="pma-widget-close" id="pma-widget-close">×</button>
      </div>
      <div class="pma-widget-body" id="pma-widget-body">
        <form id="pma-widget-form">
          <div class="pma-widget-toggle">
            <button type="button" class="pma-widget-toggle-btn active" data-mode="feedback">Feedback</button>
            <button type="button" class="pma-widget-toggle-btn" data-mode="bug">Bug Report</button>
          </div>
          <div class="pma-widget-field">
            <label class="pma-widget-label">Your Email (optional)</label>
            <input type="email" class="pma-widget-input" name="email" placeholder="you@company.com">
          </div>
          <div class="pma-widget-field">
            <label class="pma-widget-label" id="pma-description-label">What's your feedback?</label>
            <textarea class="pma-widget-textarea" name="text" required placeholder="Tell us what you think..."></textarea>
          </div>
          <div class="pma-widget-field">
            <label class="pma-widget-label">Customer Tier (optional)</label>
            <select class="pma-widget-select" name="tier">
              <option value="">Select tier...</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <input type="hidden" name="projectId" id="pma-project-id">
          <input type="hidden" name="source" value="widget">
          <input type="hidden" name="type" id="pma-feedback-type" value="feature">
          <input type="hidden" name="pageUrl" id="pma-page-url">
          <input type="hidden" name="browserInfo" id="pma-browser-info">
          <button type="submit" class="pma-widget-submit" id="pma-submit-btn">Submit</button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Get elements
  const btn = document.getElementById('pma-widget-btn');
  const modal = document.getElementById('pma-widget-modal');
  const closeBtn = document.getElementById('pma-widget-close');
  const form = document.getElementById('pma-widget-form');
  const toggleBtns = document.querySelectorAll('.pma-widget-toggle-btn');

  // Toggle modal
  function openModal() {
    isOpen = true;
    modal.classList.add('active');
  }

  function closeModal() {
    isOpen = false;
    modal.classList.remove('active');
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Toggle between feedback and bug
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;

      const typeInput = document.getElementById('pma-feedback-type');
      const descLabel = document.getElementById('pma-description-label');
      const title = document.getElementById('pma-widget-title');

      if (currentMode === 'bug') {
        typeInput.value = 'bug';
        descLabel.textContent = 'Describe the bug';
        title.textContent = 'Report a Bug';
      } else {
        typeInput.value = 'feature';
        descLabel.textContent = "What's your feedback?";
        title.textContent = 'Send Feedback';
      }
    });
  });

  // Set project ID from data attribute
  function initWidget() {
    const triggerBtn = document.querySelector('[data-pma-widget]');
    if (triggerBtn) {
      currentProjectId = triggerBtn.dataset.pmaProject;
      document.getElementById('pma-project-id').value = currentProjectId || '';
      document.getElementById('pma-page-url').value = window.location.href;
      document.getElementById('pma-browser-info').value = navigator.userAgent;
      
      // Update button text based on mode
      const widgetType = triggerBtn.dataset.pmaWidget;
      if (widgetType === 'bug') {
        btn.textContent = 'Report Bug';
        // Trigger bug mode
        const bugBtn = document.querySelector('[data-mode="bug"]');
        if (bugBtn) bugBtn.click();
      }
    }
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('pma-submit-btn');
    const body = document.getElementById('pma-widget-body');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData(form);
    const data = {
      projectId: formData.get('projectId'),
      type: formData.get('type'),
      source: formData.get('source'),
      text: formData.get('text'),
      email: formData.get('email') || null,
      tier: formData.get('tier') || null,
      pageUrl: formData.get('pageUrl'),
      browserInfo: formData.get('browserInfo'),
    };

    try {
      const response = await fetch(`${WIDGET_ORIGIN}/api/widget/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
      }

      // Show success
      body.innerHTML = `
        <div class="pma-widget-success">
          <div class="pma-widget-success-icon">✓</div>
          <h4>Thank you!</h4>
          <p>Your ${currentMode === 'bug' ? 'bug report' : 'feedback'} has been submitted.</p>
        </div>
      `;

      // Reset after 3 seconds
      setTimeout(() => {
        closeModal();
        setTimeout(() => {
          form.reset();
          location.reload(); // Refresh to re-init
        }, 300);
      }, 2000);

    } catch (error) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'pma-widget-error';
      errorDiv.textContent = error.message || 'Something went wrong. Please try again.';
      body.insertBefore(errorDiv, form);

      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Re-init for dynamically added buttons
  const observer = new MutationObserver(() => {
    const trigger = document.querySelector('[data-pma-widget]');
    if (trigger && !currentProjectId) {
      initWidget();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
