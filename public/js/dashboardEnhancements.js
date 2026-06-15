// Shared dashboard UX: counters, toolbar, theme, sparklines, enriched tables.
(function attachDashboardUX(global) {
  function animateCounter(element, options = {}) {
    if (!element) return;
    const target = Number(options.target) || 0;
    const duration = options.duration || 900;
    const formatter = options.formatter || (value => String(Math.round(value)));
    const start = performance.now();
    const from = Number(element.dataset.countFrom) || 0;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (target - from) * eased;
      element.textContent = formatter(value);
      if (progress < 1) requestAnimationFrame(frame);
      else element.dataset.countFrom = String(target);
    }

    requestAnimationFrame(frame);
  }

  function setupToolbar(config = {}) {
    const refreshButton = document.getElementById(config.refreshButtonId || 'refreshDashboard');
    const statusText = document.getElementById(config.statusId || 'liveStatusText');
    const updatedLabel = document.getElementById(config.updatedId || 'lastUpdated');
    const themeToggle = document.getElementById(config.themeToggleId || 'themeToggle');

    if (refreshButton && config.onRefresh) {
      refreshButton.addEventListener('click', async () => {
        refreshButton.disabled = true;
        refreshButton.classList.add('is-loading');
        if (statusText) statusText.textContent = 'Refreshing…';
        try {
          await config.onRefresh();
          if (statusText) statusText.textContent = 'Live data';
          if (updatedLabel) {
            updatedLabel.textContent = `Updated ${new Date().toLocaleTimeString()}`;
          }
        } catch (error) {
          if (statusText) statusText.textContent = 'Refresh failed';
        } finally {
          refreshButton.disabled = false;
          refreshButton.classList.remove('is-loading');
        }
      });
    }

    if (themeToggle) {
      const saved = localStorage.getItem('dashboardTheme');
      if (saved === 'dark') document.body.classList.add('dashboard-dark');
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dashboard-dark');
        const isDark = document.body.classList.contains('dashboard-dark');
        localStorage.setItem('dashboardTheme', isDark ? 'dark' : 'light');
        themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeToggle.innerHTML = isDark
          ? '<i class="fas fa-sun"></i> Light'
          : '<i class="fas fa-moon"></i> Dark';
        document.dispatchEvent(new CustomEvent('dashboard-theme-change', { detail: { isDark } }));
      });
      const isDark = document.body.classList.contains('dashboard-dark');
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.innerHTML = isDark
        ? '<i class="fas fa-sun"></i> Light'
        : '<i class="fas fa-moon"></i> Dark';
    }
  }

  function renderPriorityList(container, entries, formatPounds, badgeClass) {
    if (!container) return;
    if (!entries || entries.length === 0) {
      container.innerHTML = '<div class="empty-state">No pickup priorities yet. Add entries to generate scores.</div>';
      return;
    }

    const maxScore = Math.max(...entries.map(entry => entry.priorityScore || 0), 1);
    container.innerHTML = entries.slice(0, 5).map((entry, index) => {
      const score = entry.priorityScore || 0;
      const width = Math.round((score / maxScore) * 100);
      const level = String(entry.priorityLevel || 'low').toLowerCase();
      return `
        <article class="priority-item priority-item-rich" style="animation-delay: ${index * 0.06}s">
          <div class="priority-rank">${index + 1}</div>
          <div class="priority-body">
            <div class="priority-top">
              <strong>${entry.location || 'Unknown location'}</strong>
              <span class="${badgeClass(entry.priorityLevel)}">${entry.priorityLevel}</span>
            </div>
            <p>${entry.foodType || 'Food waste'} · ${formatPounds(entry.weight)}</p>
            <small>${(entry.reasons || []).join(' · ')}</small>
            <div class="score-bar" aria-hidden="true">
              <div class="score-bar-fill score-${level}" style="width: ${width}%"></div>
            </div>
            <span class="score-label">${score} priority points</span>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderLocationTable(rows, locations, formatPounds, formatPercent) {
    if (!rows) return;
    if (!locations.length) {
      rows.innerHTML = '<tr><td colspan="5">No location data has been logged yet.</td></tr>';
      return;
    }

    const peak = Math.max(...locations.map(item => item.totalWaste || 0), 1);
    rows.innerHTML = locations.map(location => {
      const waste = location.totalWaste || 0;
      const width = Math.round((waste / peak) * 100);
      const fullness = Math.round(location.averageBinFullness || 0);
      const fullnessClass = fullness >= 75 ? 'high' : fullness >= 50 ? 'medium' : 'low';
      return `
        <tr>
          <td>
            <div class="loc-cell">
              <strong>${location._id || 'Unknown'}</strong>
              <div class="loc-bar"><span style="width:${width}%"></span></div>
            </div>
          </td>
          <td>${formatPounds(waste)}</td>
          <td>${formatPounds(location.totalCompost)}</td>
          <td>
            <div class="fullness-chip fullness-${fullnessClass}">${formatPercent(fullness)}</div>
          </td>
          <td>${location.entryCount}</td>
        </tr>
      `;
    }).join('');
  }

  function pulseMetricCards() {
    document.querySelectorAll('.metric-card-enhanced').forEach((card, index) => {
      card.style.animationDelay = `${index * 0.05}s`;
      card.classList.add('metric-card-visible');
    });
  }

  global.DashboardUX = {
    animateCounter,
    setupToolbar,
    renderPriorityList,
    renderLocationTable,
    pulseMetricCards
  };
})(window);
