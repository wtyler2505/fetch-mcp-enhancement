import fs from 'fs';
import path from 'path';

class BenchmarkResultsVisualizer {
  /**
   * Generate comprehensive performance visualization
   * @param {Object} benchmarkResults - Detailed benchmark results
   * @returns {string} HTML performance report
   */
  static generateReport(benchmarkResults) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Fetch MCP Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .scenario { margin-bottom: 30px; border-bottom: 1px solid #ddd; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .chart { width: 100%; height: 300px; margin-bottom: 20px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Fetch MCP Performance Benchmark</h1>
    <div id="performanceReport">
        ${this.#generateScenarioDetails(benchmarkResults)}
    </div>
    <script>
        ${this.#generateChartScripts(benchmarkResults)}
    </script>
</body>
</html>
    `;
  }

  /**
   * Generate detailed scenario performance details
   * @private
   * @param {Object} benchmarkResults - Benchmark execution results
   * @returns {string} HTML scenario details
   */
  static #generateScenarioDetails(benchmarkResults) {
    return Object.entries(benchmarkResults.scenarioMetrics)
      .map(([scenarioName, metrics]) => `
        <div class="scenario">
            <h2>${scenarioName}</h2>
            <div class="metric">
                <strong>Success Rate:</strong> ${metrics.successRate.toFixed(2)}%
            </div>
            <div class="metric">
                <strong>Average Execution Time:</strong> ${metrics.analysis.averageExecutionTime.toFixed(4)} ms
            </div>
            <div class="metric">
                <strong>Median Execution Time:</strong> ${metrics.analysis.medianExecutionTime.toFixed(4)} ms
            </div>
            <div class="metric">
                <strong>Execution Time Standard Deviation:</strong> ${metrics.analysis.executionTimeStandardDeviation.toFixed(4)} ms
            </div>
            <div class="metric">
                <strong>Average Memory Usage:</strong> ${(metrics.analysis.averageMemoryUsage / 1024).toFixed(2)} KB
            </div>
            <canvas id="chart-${scenarioName}" class="chart"></canvas>
        </div>
      `).join('');
  }

  /**
   * Generate interactive chart scripts for performance visualization
   * @private
   * @param {Object} benchmarkResults - Benchmark execution results
   * @returns {string} Chart generation JavaScript
   */
  static #generateChartScripts(benchmarkResults) {
    return Object.entries(benchmarkResults.scenarioMetrics)
      .map(([scenarioName, metrics]) => `
        new Chart(document.getElementById('chart-${scenarioName}'), {
            type: 'line',
            data: {
                labels: Array.from({length: ${metrics.iterations}}, (_, i) => i + 1),
                datasets: [
                    {
                        label: 'Execution Time (ms)',
                        data: ${JSON.stringify(metrics.executionTimes)},
                        borderColor: 'blue',
                        tension: 0.1
                    },
                    {
                        label: 'Memory Usage (bytes)',
                        data: ${JSON.stringify(metrics.memoryUsages)},
                        borderColor: 'green',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: '${scenarioName} Performance' }
                }
            }
        });
      `).join('\n');
  }

  /**
   * Write performance report to file
   * @param {Object} benchmarkResults - Detailed benchmark results
   */
  static writeReportToFile(benchmarkResults) {
    const reportDir = path.resolve('./benchmarks/reports');
    const reportPath = path.join(reportDir, `performance-report-${Date.now()}.html`);

    try {
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(reportPath, this.generateReport(benchmarkResults));
      console.log(`Performance report generated: ${reportPath}`);
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  }
}

export default BenchmarkResultsVisualizer;