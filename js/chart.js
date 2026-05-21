/**
 * ColdGuard Dashboard — Temperature Chart Module
 * Wraps Chart.js to display beautiful, responsive, and localized temperature graphs.
 */

const TempChart = (() => {
  let chartInstance = null;

  /**
   * Initialize or reuse a Chart.js instance on the target canvas.
   * @param {HTMLCanvasElement} canvas - Canvas element.
   * @param {Array} readings - Array of temperature readings.
   */
  function render(canvas, readings) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isRtl = I18n.isRTL();

    // Prepare data
    const labels = readings.map(r => new Date(r.timestamp));
    const temperatures = readings.map(r => r.temperature);

    // Create a beautiful background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    // Greenish-blue theme gradient
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)');
    gradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.1)');
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');

    const chartData = {
      labels: labels,
      datasets: [{
        label: I18n.t('currentTemp'),
        data: temperatures,
        borderColor: '#14b8a6', // Teal 500
        borderWidth: 3,
        pointBackgroundColor: '#14b8a6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: readings.length > 50 ? 0 : 3,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#14b8a6',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: gradient,
        tension: 0.3,
      }]
    };

    // Chart Configuration
    const config = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        locale: I18n.getLanguage(),
        rtl: isRtl,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate 900
            titleColor: '#f1f5f9',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              family: 'Outfit, Inter, sans-serif',
              size: 13,
              weight: '600',
            },
            bodyFont: {
              family: 'Outfit, Inter, sans-serif',
              size: 14,
            },
            callbacks: {
              title: (context) => {
                const date = context[0].raw ? new Date(context[0].label) : new Date();
                return Utils.formatDateTime(date.toISOString());
              },
              label: (context) => {
                const temp = context.raw;
                const readingIndex = context.dataIndex;
                const reading = readings[readingIndex];
                const statusStr = reading ? ` (${I18n.t(getStatusKey(reading.status))})` : '';
                return `${temp.toFixed(1)}°C${statusStr}`;
              }
            }
          },
          // Custom horizontal threshold lines
          annotation: {
            annotations: {
              maxLine: {
                type: 'line',
                yMin: CONFIG.THRESHOLDS.MAX,
                yMax: CONFIG.THRESHOLDS.MAX,
                borderColor: 'rgba(239, 68, 68, 0.5)', // Red 500
                borderWidth: 1.5,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: `${I18n.t('maxThreshold')}: ${CONFIG.THRESHOLDS.MAX}°C`,
                  position: isRtl ? 'start' : 'end',
                  backgroundColor: 'rgba(239, 68, 68, 0.85)',
                  color: '#ffffff',
                  font: {
                    family: 'Outfit, Inter, sans-serif',
                    size: 10,
                    weight: 'bold',
                  },
                  padding: 4,
                }
              },
              minLine: {
                type: 'line',
                yMin: CONFIG.THRESHOLDS.MIN,
                yMax: CONFIG.THRESHOLDS.MIN,
                borderColor: 'rgba(59, 130, 246, 0.5)', // Blue 500
                borderWidth: 1.5,
                borderDash: [6, 6],
                label: {
                  display: true,
                  content: `${I18n.t('minThreshold')}: ${CONFIG.THRESHOLDS.MIN}°C`,
                  position: isRtl ? 'start' : 'end',
                  backgroundColor: 'rgba(59, 130, 246, 0.85)',
                  color: '#ffffff',
                  font: {
                    family: 'Outfit, Inter, sans-serif',
                    size: 10,
                    weight: 'bold',
                  },
                  padding: 4,
                }
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'll HH:mm',
              unit: readings.length > 100 ? 'hour' : 'minute',
              displayFormats: {
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'MMM D',
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#94a3b8', // Slate 400
              font: {
                family: 'Outfit, Inter, sans-serif',
                size: 11,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6,
            }
          },
          y: {
            suggestedMin: CONFIG.SENSOR_RANGE.MIN,
            suggestedMax: CONFIG.SENSOR_RANGE.MAX,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: 'Outfit, Inter, sans-serif',
                size: 11,
              },
              callback: (value) => `${value}°C`
            }
          }
        }
      }
    };

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, config);
  }

  /**
   * Helper to map a status string to its translation key.
   */
  function getStatusKey(status) {
    switch (status) {
      case CONFIG.STATUS.OK: return 'statusOk';
      case CONFIG.STATUS.ALARM_HIGH: return 'statusAlarmHigh';
      case CONFIG.STATUS.ALARM_LOW: return 'statusAlarmLow';
      default: return 'statusNoData';
    }
  }

  /**
   * Destroy the current chart instance to avoid memory leaks.
   */
  function destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }

  return Object.freeze({
    render,
    destroy,
  });
})();
