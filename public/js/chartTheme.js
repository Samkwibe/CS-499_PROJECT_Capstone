// Professional Chart.js themes and builders for MunchiesSNHU dashboards.
(function attachMunchiesCharts(global) {
  const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart, _args, options) {
      if (!options?.text) return;
      const meta = chart.getDatasetMeta(0);
      const element = meta?.data?.[0];
      if (!element) return;

      const { ctx } = chart;
      const x = element.x;
      const y = element.y;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 1.65rem Inter, Roboto, sans-serif';
      ctx.fillStyle = options.color || '#082241';
      ctx.fillText(options.text, x, y - 6);
      if (options.subtext) {
        ctx.font = '700 0.72rem Inter, Roboto, sans-serif';
        ctx.fillStyle = options.subtextColor || '#657085';
        ctx.fillText(options.subtext, x, y + 16);
      }
      ctx.restore();
    }
  };

  function verticalGradient(chart, topColor, bottomColor) {
    const { chartArea } = chart;
    if (!chartArea) return topColor;
    const gradient = chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    return gradient;
  }

  function horizontalGradient(chart, leftColor, rightColor) {
    const { chartArea } = chart;
    if (!chartArea) return leftColor;
    const gradient = chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    gradient.addColorStop(0, leftColor);
    gradient.addColorStop(1, rightColor);
    return gradient;
  }

  function professionalLegend(theme) {
    return {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        boxHeight: 8,
        padding: 14,
        color: theme.tick,
        font: { size: 11, weight: '700', family: 'Inter, Roboto, sans-serif' }
      }
    };
  }

  function professionalTooltip(theme) {
    return {
      backgroundColor: theme.tooltipBg,
      titleColor: '#ffffff',
      bodyColor: '#e8eef8',
      footerColor: '#f3d014',
      borderColor: theme.tooltipBorder,
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      displayColors: true,
      boxPadding: 6,
      titleFont: { size: 12, weight: '700' },
      bodyFont: { size: 12, weight: '600' },
      footerFont: { size: 11, weight: '700' },
      callbacks: {
        label(context) {
          const label = context.dataset.label || 'Value';
          const value = context.parsed.y ?? context.parsed.x ?? context.parsed;
          if (typeof value === 'number') {
            return `${label}: ${value.toFixed(1)} lbs`;
          }
          return `${label}: ${value}`;
        }
      }
    };
  }

  function axisStyles(theme, unit = 'lbs') {
    const unitSuffix = unit === 'lbs' ? ' lbs' : unit === '%' ? '%' : '';

    return {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: theme.tick,
          font: { size: 11, weight: '600', family: 'Inter, Roboto, sans-serif' },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.grid,
          lineWidth: 1,
          drawBorder: false
        },
        border: { display: false },
        ticks: {
          color: theme.tick,
          font: { size: 11, weight: '600', family: 'Inter, Roboto, sans-serif' },
          padding: 8,
          callback: value => `${value}${unitSuffix}`
        }
      }
    };
  }

  const staffTheme = {
    primary: '#082241',
    secondary: '#f3d014',
    accent: '#2e7d32',
    bar: ['#082241', '#0f3f70', '#f3d014', '#1a5a8a', '#2e7d32'],
    wasteFillTop: 'rgba(8, 34, 65, 0.28)',
    wasteFillBottom: 'rgba(8, 34, 65, 0.02)',
    compostFillTop: 'rgba(243, 208, 20, 0.38)',
    compostFillBottom: 'rgba(243, 208, 20, 0.03)',
    tick: '#657085',
    grid: 'rgba(8, 34, 65, 0.1)',
    tooltipBg: 'rgba(8, 34, 65, 0.96)',
    tooltipBorder: 'rgba(243, 208, 20, 0.5)',
    doughnut: ['#f3d014', '#082241', '#d9e1ec'],
    chartBorder: '#ffffff',
    gaugeTrack: 'rgba(101, 112, 133, 0.14)',
    radarFill: 'rgba(243, 208, 20, 0.28)',
    centerText: '#082241',
    centerSubtext: '#657085',
    sparkFill: 'rgba(243, 208, 20, 0.28)'
  };

  const studentTheme = {
    primary: '#082241',
    secondary: '#f3d014',
    accent: '#0f3f70',
    bar: ['#082241', '#0f3f70', '#f3d014', '#1a4f82', '#e6c400'],
    wasteFillTop: 'rgba(8, 34, 65, 0.35)',
    wasteFillBottom: 'rgba(8, 34, 65, 0.04)',
    compostFillTop: 'rgba(243, 208, 20, 0.45)',
    compostFillBottom: 'rgba(243, 208, 20, 0.04)',
    tick: '#657085',
    grid: 'rgba(8, 34, 65, 0.10)',
    tooltipBg: 'rgba(8, 34, 65, 0.97)',
    tooltipBorder: 'rgba(243, 208, 20, 0.5)',
    doughnut: ['#f3d014', '#082241', '#0f3f70', '#1a4f82', '#e6c400', '#a89000'],
    chartBorder: '#ffffff',
    gaugeTrack: 'rgba(101, 112, 133, 0.14)',
    radarFill: 'rgba(243, 208, 20, 0.28)',
    centerText: '#082241',
    centerSubtext: '#657085',
    sparkFill: 'rgba(243, 208, 20, 0.28)'
  };

  const staffDarkTheme = {
    primary: '#a8c7f0',
    secondary: '#f3d014',
    accent: '#6fcf97',
    bar: ['#f3d014', '#6ba3e8', '#a8c7f0', '#4d8fd4', '#6fcf97'],
    wasteFillTop: 'rgba(168, 199, 240, 0.38)',
    wasteFillBottom: 'rgba(168, 199, 240, 0.03)',
    compostFillTop: 'rgba(243, 208, 20, 0.42)',
    compostFillBottom: 'rgba(243, 208, 20, 0.04)',
    tick: '#c5d4e8',
    grid: 'rgba(197, 212, 232, 0.14)',
    tooltipBg: 'rgba(12, 18, 30, 0.97)',
    tooltipBorder: 'rgba(243, 208, 20, 0.5)',
    doughnut: ['#f3d014', '#6ba3e8', '#4d8fd4', '#9aa8bf'],
    chartBorder: '#2f3d52',
    gaugeTrack: 'rgba(197, 212, 232, 0.2)',
    radarFill: 'rgba(243, 208, 20, 0.24)',
    centerText: '#f3d014',
    centerSubtext: '#9aa8bf',
    sparkFill: 'rgba(243, 208, 20, 0.32)'
  };

  const studentDarkTheme = {
    primary: '#f3d014',
    secondary: '#a8c7f0',
    accent: '#e6c400',
    bar: ['#f3d014', '#6ba3e8', '#a8c7f0', '#4d8fd4', '#e6c400'],
    wasteFillTop: 'rgba(168, 199, 240, 0.38)',
    wasteFillBottom: 'rgba(168, 199, 240, 0.03)',
    compostFillTop: 'rgba(243, 208, 20, 0.42)',
    compostFillBottom: 'rgba(243, 208, 20, 0.04)',
    tick: '#c5d4e8',
    grid: 'rgba(197, 212, 232, 0.14)',
    tooltipBg: 'rgba(8, 20, 40, 0.97)',
    tooltipBorder: 'rgba(243, 208, 20, 0.5)',
    doughnut: ['#f3d014', '#6ba3e8', '#4d8fd4', '#9aa8bf'],
    chartBorder: '#2f3d52',
    gaugeTrack: 'rgba(197, 212, 232, 0.2)',
    radarFill: 'rgba(243, 208, 20, 0.24)',
    centerText: '#f3d014',
    centerSubtext: '#9aa8bf',
    sparkFill: 'rgba(243, 208, 20, 0.32)'
  };

  function isDashboardDark() {
    return typeof document !== 'undefined'
      && document.body?.classList.contains('dashboard-dark');
  }

  function getTheme(themeName = 'staff') {
    const isStudent = themeName === 'student';
    if (isDashboardDark()) {
      return isStudent ? studentDarkTheme : staffDarkTheme;
    }
    return isStudent ? studentTheme : staffTheme;
  }

  function baseOptions(theme, extra = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 4, right: 8, bottom: 4, left: 4 }
      },
      animation: {
        duration: 1100,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: professionalLegend(theme),
        tooltip: professionalTooltip(theme),
        ...extra.plugins
      },
      ...extra
    };
  }

  function formatDayLabel(value) {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function normalizeTrendDay(item) {
    const waste = Number(item.totalWaste) || 0;
    const compostRaw = Number(item.totalCompost) || 0;
    const compost = waste > 0 ? Math.min(compostRaw, waste) : compostRaw;
    return {
      _id: item._id,
      totalWaste: waste,
      totalCompost: compost,
      _padded: Boolean(item._padded)
    };
  }

  function expandTrendForLines(dailyTrend) {
    const cleaned = dailyTrend.map(entry => normalizeTrendDay(entry));
    if (cleaned.length === 0) return [];
    if (cleaned.length >= 2) return cleaned;

    const point = cleaned[0];
    const date = new Date(`${point._id}T12:00:00`);
    if (Number.isNaN(date.getTime())) {
      return [
        { ...point, _padded: true },
        { ...point, _padded: false }
      ];
    }

    const previous = new Date(date);
    previous.setDate(previous.getDate() - 1);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const toKey = value => value.toISOString().slice(0, 10);

    return [
      { _id: toKey(previous), totalWaste: 0, totalCompost: 0, _padded: true },
      { ...point, _padded: false },
      {
        _id: toKey(next),
        totalWaste: point.totalWaste,
        totalCompost: point.totalCompost,
        _padded: true
      }
    ];
  }

  function getTrendChartMax(wasteValues, compostValues) {
    const peak = Math.max(...wasteValues, ...compostValues, 1);
    return Math.ceil(peak * 1.15);
  }

  function pointRadiusForTrend(context) {
    const series = context.chart._trendSeries || [];
    const padded = series[context.dataIndex]?._padded;
    if (padded) return 0;
    return series.length > 12 ? 3 : 6;
  }

  function buildStaffTrendChart(canvas, dailyTrend = [], themeName = 'staff') {
    const theme = getTheme(themeName);
    const series = expandTrendForLines(dailyTrend);
    const labels = series.map(item => formatDayLabel(item._id));
    const wasteValues = series.map(item => item.totalWaste);
    const compostValues = series.map(item => item.totalCompost);
    const yMax = getTrendChartMax(wasteValues, compostValues);

    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Waste',
            data: wasteValues,
            borderColor: theme.primary,
            backgroundColor: context => verticalGradient(
              context.chart,
              theme.wasteFillTop,
              theme.wasteFillBottom
            ),
            pointBackgroundColor: theme.secondary,
            pointBorderColor: theme.primary,
            pointBorderWidth: 2,
            pointRadius: pointRadiusForTrend,
            pointHoverRadius: 8,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            spanGaps: false,
            showLine: true,
            order: 2
          },
          {
            label: 'Compost Diverted',
            data: compostValues,
            borderColor: theme.secondary,
            backgroundColor: context => verticalGradient(
              context.chart,
              theme.compostFillTop,
              theme.compostFillBottom
            ),
            pointBackgroundColor: theme.primary,
            pointBorderColor: theme.secondary,
            pointBorderWidth: 2,
            pointRadius: pointRadiusForTrend,
            pointHoverRadius: 7,
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            spanGaps: false,
            showLine: true,
            order: 1
          }
        ]
      },
      options: baseOptions(theme, {
        plugins: {
          legend: professionalLegend(theme),
          tooltip: {
            ...professionalTooltip(theme),
            filter: item => !series[item.dataIndex]?._padded,
            callbacks: {
              title(items) {
                const item = items[0];
                return item?.label ? `Date: ${item.label}` : '';
              },
              footer(items) {
                const waste = items.find(entry => entry.datasetIndex === 0)?.parsed?.y || 0;
                const compost = items.find(entry => entry.datasetIndex === 1)?.parsed?.y || 0;
                const rate = waste > 0 ? Math.min(100, Math.round((compost / waste) * 100)) : 0;
                return `Diversion rate: ${rate}%`;
              },
              label(context) {
                return `${context.dataset.label}: ${Number(context.parsed.y || 0).toFixed(1)} lbs`;
              }
            }
          }
        },
        scales: {
          ...axisStyles(theme),
          y: {
            ...axisStyles(theme).y,
            suggestedMax: yMax,
            ticks: {
              ...axisStyles(theme).y.ticks,
              stepSize: yMax > 200 ? Math.ceil(yMax / 5) : undefined
            }
          }
        }
      })
    });

    chart._trendSeries = series;
    return chart;
  }

  function updateStaffTrendChart(chart, dailyTrend = []) {
    if (!chart) return;
    const series = expandTrendForLines(dailyTrend);
    chart.data.labels = series.map(item => formatDayLabel(item._id));
    chart.data.datasets[0].data = series.map(item => item.totalWaste);
    chart.data.datasets[1].data = series.map(item => item.totalCompost);
    chart.options.scales.y.suggestedMax = getTrendChartMax(
      chart.data.datasets[0].data,
      chart.data.datasets[1].data
    );
    chart._trendSeries = series;
    chart.update();
  }

  function buildDiversionDoughnut(canvas, diverted, remaining, themeName = 'staff') {
    const theme = getTheme(themeName);
    const total = diverted + remaining;
    const rate = total > 0 ? Math.round((diverted / total) * 100) : 0;

    return new Chart(canvas, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['Compost Diverted', 'Remaining Waste'],
        datasets: [{
          data: [diverted, remaining],
          backgroundColor: [theme.secondary, theme.primary],
          borderColor: theme.chartBorder,
          borderWidth: 3,
          hoverOffset: 10
        }]
      },
      options: baseOptions(theme, {
        cutout: '72%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: theme.tick,
              font: { size: 10, weight: '700' },
              padding: 10
            }
          },
          tooltip: professionalTooltip(theme),
          centerText: {
            text: `${rate}%`,
            subtext: 'Diverted',
            color: theme.centerText,
            subtextColor: theme.centerSubtext
          }
        }
      })
    });
  }

  function updateDiversionDoughnut(chart, diverted, remaining) {
    if (!chart) return;
    const total = diverted + remaining;
    const rate = total > 0 ? Math.round((diverted / total) * 100) : 0;
    chart.data.datasets[0].data = [diverted, remaining];
    chart.options.plugins.centerText.text = `${rate}%`;
    chart.update();
  }

  function buildSensorRadar(canvas, sensorData = {}, themeName = 'staff') {
    const theme = getTheme(themeName);
    const labels = ['Bin Fullness', 'Humidity', 'pH Level'];
    const values = [
      sensorData.binFullness || 0,
      sensorData.humidity || 0,
      ((sensorData.pH || 0) / 14) * 100
    ];

    return new Chart(canvas, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: 'Campus Averages',
          data: values,
          backgroundColor: theme.radarFill,
          borderColor: theme.primary,
          pointBackgroundColor: theme.secondary,
          pointBorderColor: theme.primary,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          fill: true
        }]
      },
      options: baseOptions(theme, {
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              display: false,
              stepSize: 25
            },
            grid: { color: theme.grid },
            angleLines: { color: theme.grid },
            pointLabels: {
              color: theme.tick,
              font: { size: 11, weight: '700' }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...professionalTooltip(theme),
            callbacks: {
              label(context) {
                const label = context.label;
                const value = context.parsed.r;
                if (label === 'pH Level') {
                  return `Avg. pH: ${((value / 100) * 14).toFixed(1)}`;
                }
                return `${label}: ${Math.round(value)}%`;
              }
            }
          }
        }
      })
    });
  }

  function updateSensorRadar(chart, sensorData = {}) {
    if (!chart) return;
    chart.data.datasets[0].data = [
      sensorData.binFullness || 0,
      sensorData.humidity || 0,
      ((sensorData.pH || 0) / 14) * 100
    ];
    chart.update();
  }

  function buildLocationBarChart(canvas, labels, values, themeName = 'student') {
    const theme = getTheme(themeName);
    const colors = labels.map((_, index) => theme.bar[index % theme.bar.length]);

    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Waste by Location',
          data: values,
          backgroundColor: context => horizontalGradient(
            context.chart,
            `${colors[context.dataIndex % colors.length]}ee`,
            `${colors[context.dataIndex % colors.length]}88`
          ),
          borderColor: colors,
          borderWidth: 1,
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 52
        }]
      },
      options: baseOptions(theme, {
        plugins: {
          legend: { display: false },
          tooltip: professionalTooltip(theme)
        },
        scales: {
          ...axisStyles(theme),
          x: {
            ...axisStyles(theme).x,
            ticks: {
              ...axisStyles(theme).x.ticks,
              callback(value, index) {
                const label = labels[index] || '';
                return label.length > 12 ? `${label.slice(0, 10)}…` : label;
              }
            }
          }
        }
      })
    });
  }

  function updateLocationBarChart(chart, labels, values, themeName = 'student') {
    if (!chart) return;
    const theme = getTheme(themeName);
    const colors = labels.map((_, index) => theme.bar[index % theme.bar.length]);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].borderColor = colors;
    chart.update();
  }

  function buildDistributionDoughnut(canvas, labels, values, themeName = 'student') {
    const theme = getTheme(themeName);
    const palette = labels.map((_, index) => theme.doughnut[index % theme.doughnut.length]);
    const total = values.reduce((sum, value) => sum + value, 0);

    return new Chart(canvas, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: palette,
          borderColor: theme.chartBorder,
          borderWidth: 2,
          hoverOffset: 12
        }]
      },
      options: baseOptions(theme, {
        cutout: '62%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: theme.tick,
              font: { size: 9, weight: '700' },
              padding: 8,
              boxWidth: 8
            }
          },
          tooltip: professionalTooltip(theme),
          centerText: {
            text: `${total.toFixed(0)}`,
            subtext: 'Total lbs',
            color: theme.centerText,
            subtextColor: theme.centerSubtext
          }
        }
      })
    });
  }

  function updateDistributionDoughnut(chart, labels, values) {
    if (!chart) return;
    const theme = getTheme('student');
    const palette = labels.map((_, index) => theme.doughnut[index % theme.doughnut.length]);
    const total = values.reduce((sum, value) => sum + value, 0);
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[0].backgroundColor = palette;
    chart.options.plugins.centerText.text = `${total.toFixed(0)}`;
    chart.update();
  }

  function buildDualBarChart(canvas, labels, wasteValues, compostValues) {
    const theme = getTheme('staff');

    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels.map(formatDayLabel),
        datasets: [
          {
            label: 'Waste (lbs)',
            data: wasteValues,
            backgroundColor: theme.primary,
            borderRadius: 8,
            maxBarThickness: 34
          },
          {
            label: 'Compost (lbs)',
            data: compostValues,
            backgroundColor: theme.secondary,
            borderRadius: 8,
            maxBarThickness: 34
          }
        ]
      },
      options: baseOptions(theme, {
        scales: {
          x: axisStyles(theme).x,
          y: {
            ...axisStyles(theme).y,
            ticks: {
              ...axisStyles(theme).y.ticks,
              callback: value => value
            }
          }
        }
      })
    });
  }

  function updateDualBarChart(chart, labels, wasteValues, compostValues) {
    if (!chart) return;
    chart.data.labels = labels.map(formatDayLabel);
    chart.data.datasets[0].data = wasteValues;
    chart.data.datasets[1].data = compostValues;
    chart.update();
  }

  // Backward-compatible aliases used by older dashboard code.
  function buildLineChart(canvas, labels, values, themeName = 'staff') {
    const dailyTrend = labels.map((label, index) => ({
      _id: label,
      totalWaste: values[index] || 0,
      totalCompost: 0
    }));
    return buildStaffTrendChart(canvas, dailyTrend);
  }

  function buildBarChart(canvas, labels, values, themeName = 'student') {
    return buildLocationBarChart(canvas, labels, values, themeName);
  }

  function buildGaugeChart(canvas, percent, themeName = 'staff', label = 'Score') {
    const theme = getTheme(themeName);
    const value = Math.min(100, Math.max(0, Number(percent) || 0));

    const chart = new Chart(canvas, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: ['Value', 'Remaining'],
        datasets: [{
          data: [value, 100 - value],
          backgroundColor: [theme.secondary, theme.gaugeTrack],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 180,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          centerText: {
            text: `${Math.round(value)}%`,
            subtext: label,
            color: theme.centerText,
            subtextColor: theme.centerSubtext
          }
        }
      }
    });
    return chart;
  }

  function updateGaugeChart(chart, percent, label) {
    if (!chart) return;
    const value = Math.min(100, Math.max(0, Number(percent) || 0));
    chart.data.datasets[0].data = [value, 100 - value];
    chart.options.plugins.centerText.text = `${Math.round(value)}%`;
    if (label) chart.options.plugins.centerText.subtext = label;
    chart.update();
  }

  function buildSparkline(canvas, values = [], themeName = 'staff') {
    const theme = getTheme(themeName);
    const data = values.length ? values : [0, 0];

    return new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map((_, index) => index),
        datasets: [{
          data,
          borderColor: theme.secondary,
          backgroundColor: theme.sparkFill,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        layout: { padding: 0 }
      }
    });
  }

  function updateSparkline(chart, values = []) {
    if (!chart) return;
    const data = values.length ? values : [0, 0];
    chart.data.labels = data.map((_, index) => index);
    chart.data.datasets[0].data = data;
    chart.update();
  }

  global.MunchiesCharts = {
    isDashboardDark,
    getTheme,
    buildStaffTrendChart,
    updateStaffTrendChart,
    buildDiversionDoughnut,
    updateDiversionDoughnut,
    buildSensorRadar,
    updateSensorRadar,
    buildLocationBarChart,
    updateLocationBarChart,
    buildDistributionDoughnut,
    updateDistributionDoughnut,
    buildDualBarChart,
    updateDualBarChart,
    buildLineChart,
    buildBarChart,
    buildGaugeChart,
    updateGaugeChart,
    buildSparkline,
    updateSparkline
  };
})(window);
