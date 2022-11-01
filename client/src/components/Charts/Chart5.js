import "./Chart5.scss";
import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { BrowserRouter as Redirect, useHistory } from 'react-router-dom';
import { Link } from 'react-router-dom';


const Chart = ({chartData, logo, tradeData, symbol, dateIn}) => {

  const history = useHistory();
  let [searchValue, setSearchValue] = useState();
  let [horizontalLineY, setHorizontalLineY] = useState();

  const seeMore = () => {
      console.log(searchValue);
      history.push("/2");
  }

  
  // Chart Settings
  let chartWidth = window.innerWidth - 20;
  let dataLength = chartData.t.length;
  let chartHeight = 600; //window.innerHeight;
  let unitWidth =  chartWidth / chartData.t.length; // 6;
  let candleWidth = unitWidth * .5; // 3;
  // let chartWidth = dataLength * unitWidth; //window.innerWidth;

  // Price Math
  // let priceHigh = Math.ceil(Math.max(...chartData.h));
  // let priceLow = Math.floor(Math.min(...chartData.l));
  // let priceHigh = Math.max(...chartData.h);
  // let priceLow = Math.min(...chartData.l);
  let chartMargin = .05;
  let priceHigh = Math.max(...chartData.h) * (1 + chartMargin);
  let priceLow = Math.min(...chartData.l) * (1 - chartMargin);

  let PriceLinesArray = []; 
  let spread = priceHigh - priceLow;
  let lineCount = 10 // spread / scaleFactor / 1;
  let flip = (num) => num * -1 + chartHeight;
  let priceRatio = chartHeight / spread;
  let getYPosition = (y) => chartHeight - (y - priceLow) * priceRatio;

  // Price Label Arr 
  for (let i=0; i <= lineCount; i++){
    PriceLinesArray.push({ 
      'y' : flip(i * chartHeight / lineCount),
      'label': (spread / lineCount * i + priceLow).toFixed(2)
    })
  }

  // Volume Math
  const volumeHeight = chartHeight - chartHeight / 1.75;
  let volumeHigh = Math.ceil(Math.max(...chartData.v));
  let volumeRatio = volumeHeight / volumeHigh;
  let getVolumeHeight = (v) => {
    return v * volumeRatio;
  };

  // Chart Helpers
  let formatTime = (time) => {
    return new Date(Math.floor(time * 1000)).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };



  /* Drag Chart
  ------------------------------------------------------*/
  useEffect(() => {
    /* Drag Chart */
    const chartContainer = document.querySelector(".chart-container");
    const horizontalLine = document.querySelector(".horzLine");
    let isDown = false;
    let startX;
    let scrollLeft;

    chartContainer.addEventListener("mousedown", (e) => {
      isDown = true;
      chartContainer.classList.add("active");
      startX = e.pageX - chartContainer.offsetLeft;
      scrollLeft = chartContainer.scrollLeft;
    });
    chartContainer.addEventListener("mouseleave", () => {
      isDown = false;
      chartContainer.classList.remove("active");
    });
    chartContainer.addEventListener("mouseup", () => {
      isDown = false;
      chartContainer.classList.remove("active");
    });
    chartContainer.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - chartContainer.offsetLeft;
      const walk = (x - startX) * 1; //scroll-fast
      chartContainer.scrollLeft = scrollLeft - walk;
    });
  }, []);

  

  /* Price Lines
  ------------------------------------------------------*/
  const price = (ctx) => {
    PriceLinesArray.map((line, i)=>{ 
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.font = '12px sans-serif';
      ctx.fillText(line.label, 60, line.y+5);
      ctx.closePath();
    })
  }



  /* Volume
  ------------------------------------------------------*/

    

    // 3x Premarket Vol ? get i


    // if(runningVolume > premarketVolume * 3 && !volIndicatorA) {
    //   ctx.fillStyle = `#271d49`; //`rgba(255,255,255,.1)`;
    //   ctx.fillRect(
    //     // x, y , w, h
    //     unitWidth * i,
    //     chartHeight - getVolumeHeight(chartData.v[i]),
    //     candleWidth,
    //     getVolumeHeight(chartData.v[i]) //volumeY(data.v[i])
    //   );
    // }

  
  let runningVolume = 0;
  let premarketVolume = 0;
  let volIndicatorA, volIndicatorB, volIndicatorC;  
  const volume = (ctx) => {




    ctx.beginPath();
    chartData.v.map((v, i) => {
      // Volume Indicators
      if(formatTime(chartData.t[i]) == '09:30'){
        premarketVolume = runningVolume;
      }
      runningVolume += v;
      if(premarketVolume > 1000000){
        if(runningVolume > premarketVolume * 3 && premarketVolume && !volIndicatorA) {
          volIndicatorA = true;
          ctx.fillStyle = `rgba(255,255,255,.05)`;
          ctx.fillRect(
            unitWidth * i,
            0,
            candleWidth,
            chartHeight
          );
        }
        if(runningVolume > premarketVolume * 4 && premarketVolume && !volIndicatorB) {
          volIndicatorB = true;
          ctx.fillStyle = `rgba(255,255,255,.05)`;
          ctx.fillRect(
            unitWidth * i,
            0,
            candleWidth,
            chartHeight
          );
        }
        if(runningVolume > premarketVolume * 5 && premarketVolume && !volIndicatorC) {
          volIndicatorC = true;
          ctx.fillStyle = `rgba(255,255,255,.05)`;
          ctx.fillRect(
            unitWidth * i,
            0,
            candleWidth,
            chartHeight
          );
        }
      }
      
      // Volume Bars
      ctx.fillStyle = `#271d49`;
      ctx.fillRect(
        unitWidth * i,
        chartHeight - getVolumeHeight(v),
        candleWidth,
        getVolumeHeight(v)
      );
    });
    
  }



  /* Candles
  ------------------------------------------------------*/
  const candles = (ctx) => {
    // Price Lines
    PriceLinesArray.map((line, i)=>{ 
      ctx.beginPath();
      ctx.lineWidth = "0";
      ctx.fillStyle = "#222";
      ctx.fillRect(// x, y , w, h
          0,
          Math.floor(line.y),
          chartWidth, 
          1 // Height
      ) 
      ctx.stroke(); 
    })
    ctx.beginPath();
    chartData.t.map((e, i) => {
      // Candle Thin
      ctx.fillStyle = `#333`;
      ctx.fillRect(
        // x, y , w, h
        unitWidth * i,
        getYPosition(chartData.h[i]),
        candleWidth,
        getYPosition(chartData.l[i]) - getYPosition(chartData.h[i])
      );
      // Candle Thick
      ctx.fillStyle = chartData.o[i] < chartData.c[i] ? "#0c9" : "#e45339";
      ctx.fillRect(
        // x, y , w, h
        unitWidth * i,
        getYPosition(chartData.o[i]),
        candleWidth,
        (getYPosition(chartData.o[i]) - getYPosition(chartData.c[i])) * -1
      );

      // Market Open Line
      if(formatTime(chartData.t[i]) == '09:30' || formatTime(chartData.t[i]) == '16:00'){
        ctx.beginPath();
        ctx.moveTo(unitWidth * i,0);
        ctx.strokeStyle = `rgba(0,0,0,.5)`;
        ctx.lineWidth = 10;
        ctx.lineTo(unitWidth * i, chartWidth);
        ctx.stroke();
      }
    });
  }

  /* Trades
  ------------------------------------------------------*/
  const trades = (ctx) => {
    chartData.t.map((e, i) => {
      tradeData.map((e, x) => {
        if (
          e.exec_time.substring(0, 5) >= formatTime(chartData.t[i]) &&
          e.exec_time.substring(0, 5) < formatTime(chartData.t[i + 1])
        ) {

          ctx.beginPath();
          ctx.fillStyle = (e.side == "SS" || e.side == "S") ? "#0c9" : "#fff";//"#ff3838" : "#0c9";
          if(e.side=="SS" || e.side == "S"){
            ctx.moveTo(unitWidth * i + unitWidth / 3 + 1, getYPosition(e.price)+ 0);
            ctx.lineTo(unitWidth * i + unitWidth / 3 + 12, getYPosition(e.price)+ 6);
            ctx.lineTo(unitWidth * i + unitWidth / 3 + 12, getYPosition(e.price)+ -6);
          } else {
            ctx.moveTo(unitWidth * i + unitWidth / 3 + -1, getYPosition(e.price)+ 0);
            ctx.lineTo(unitWidth * i + unitWidth / 3 + -12, getYPosition(e.price)+ 6);
            ctx.lineTo(unitWidth * i + unitWidth / 3 + -12, getYPosition(e.price)+ -6);
          }
          ctx.fill();
          // ctx.lineWidth = 2;
          // ctx.strokeStyle = `#000`;
          // ctx.stroke();
        }
      });
    });
  }


  return (
    <div className="pro-chart">
      <section className="chart-header">
        <p className="chart-title">
          <div className="logo-title">
            {logo && <a  href={`https://finviz.com/quote.ashx?t=${symbol}`}><img src={logo} /></a>}
            <h1>{symbol} <span>{dateIn}</span></h1>
          </div>
        </p>
      </section>
      <div className="chartTools">
        <div className="horzLine" style={{top:horizontalLineY}}></div>
      </div>
      <section className="chart-price">
        <Canvas draw={price} data={chartData} height={chartHeight} width={100} /> 
      </section>
      <div className="chart-container">
        <Canvas draw={volume} data={chartData} height={chartHeight} width={chartWidth} />
        <Canvas draw={candles} data={chartData} height={chartHeight} width={chartWidth} />
        <Canvas draw={trades} data={chartData} height={chartHeight} width={chartWidth} />
      </div>
    </div>
  );
};
export default Chart;
