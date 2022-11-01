import "../css/PLChart.scss";
const PLChart = ({ data }) => {
  let chartHeight = 500;

  // Chart Settings
  let chartSettings = {
    height: chartHeight,
    width: document.body.clientWidth - 100,
    scaleFactor: 500,
    lineMax: 12,
    lineCount: 0,
  };

  let chartHigh, chartLow, spread;
  let factorMultiplier = 1;

  // Determin Line Count, Line Top and Bottom Value
  const gridLinePlacement = (num) => {
    chartHigh =
      Math.ceil(data.runningProfitHigh / (chartSettings.scaleFactor * num)) *
      (chartSettings.scaleFactor * num); // Round to next highest factor
    chartLow =
      Math.floor(data.runningProfitLow / (chartSettings.scaleFactor * num)) *
      (chartSettings.scaleFactor * num); // Round to next lowest factor
    chartLow = chartLow > 0 ? 0 : chartLow;
    chartHigh = chartHigh < 0 ? 0 : chartHigh;
    spread = chartHigh - chartLow;
    chartSettings.lineCount = spread / chartSettings.scaleFactor / num;
  };
  gridLinePlacement(factorMultiplier);

  // Increase Scale Factor until MaxLines is not surpassed
  while (chartSettings.lineCount > chartSettings.lineMax) {
    factorMultiplier++;
    gridLinePlacement(factorMultiplier);
  }

  // Helpers
  let flip = (num) => num * -1 + chartSettings.height; // flips coordinates upside down based on chart height
  let scale = chartSettings.height / (chartHigh - chartLow); // Chart value scale

  // Y Axis Array (labels and lines)
  let yAxisLabelsArr = [];
  for (let i = 0; i <= chartSettings.lineCount; i++) {
    yAxisLabelsArr.push({
      y: flip((i * chartSettings.height) / chartSettings.lineCount),
      label: (
        ((chartHigh - chartLow) / chartSettings.lineCount) * i +
        chartLow
      ).toFixed(),
    });
  }

  let chartInfo = data.daySummaryArrReversed.map((e, i) => {
    return {
      runningProfit: e.runningProfit.toFixed(2),
      profit: e.profit.toFixed(2),
      symbols: e.symbols,
      date: e.date,
      x: (chartSettings.width / data.daySummaryArrReversed.length) * (i + 1),
      y: flip((e.runningProfit - chartLow) * scale),
    };
  });
  chartInfo.unshift({
    runningProfit: 0,
    profit: 0,
    symbols: [],
    date: "",
    x: 0,
    y: flip((0 - chartLow) * scale),
  });

  return (
    <div class="plChart">
    <svg
      className="chart"
      height={chartSettings.height}
      width={chartSettings.width}
    >
      <svg className="yLines">
        {yAxisLabelsArr.map((e, i) => {
          return (
            <g key={i}>
              <line
                className={e.label !== 0 ? "background" : "zero"}
                x1={0}
                x2={chartSettings.width}
                y1={e.y}
                y2={e.y}
              />
              <text x={chartSettings.width + -40} y={e.y + 3}>
                {e.label}
              </text>
            </g>
          );
        })}
      </svg>
      <svg
        className="lines"
        height={chartSettings.height}
        width={chartSettings.width}
      >
        {chartInfo.map((e, i) => (
          <g key={i}>
            <svg x={e.x} y={e.y} width={100} height={100} className="dataPoint">
              {i > 0 && (
                <title>
                  {e.profit > 0 ? "+" + e.profit : "" + e.profit}
                  {", "}
                  {e.symbols.map((e) => e).join(" ")}
                  {e.runningProfit}
                </title>
              )}
              <circle r={5} />
              <text x="6" y="9">
                {/*e.profit*/} {/*e.runningProfit*/}{" "}
              </text>
            </svg>
            {i && (
              <line
                x1={chartInfo[i - 1].x}
                y1={chartInfo[i - 1].y}
                x2={e.x}
                y2={e.y}
              />
            )}
          </g>
        ))}
      </svg>
    </svg>
    </div>
  );
};
export default PLChart;
