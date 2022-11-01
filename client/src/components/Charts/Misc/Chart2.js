import '../css/Chart2.scss';
import format from 'date-fns/format';
import fromUnixTime from 'date-fns/fromUnixTime';
import { useEffect, useState } from 'react';


const Chart = ({chartData, tradeData, chartWidth})=>{

    let chartHeight = 400;
    let volumeChartHeight = chartHeight/4;
    let lineCount = 0;
    let lineMax = 12;
    let scaleFactor = .25;
    let yAxisLabelsArr = [];
    

    var unitWidth = chartWidth / chartData.t.length;

    
    let chartHigh, chartLow, spread;
    let factorMultiplier = 1;

    // Determin Line Count, Line Top and Bottom Value
    const gridLinePlacement = (num) => {
        chartHigh = Math.ceil((Math.max(...chartData.h)) / (scaleFactor * num)) * (scaleFactor * num); // Round to next chartHigh factor
        chartLow= Math.floor((Math.min(...chartData.l)) / (scaleFactor * num)) * (scaleFactor * num); // Round to next chartLow factor
        spread = chartHigh - chartLow;  
        lineCount = spread / scaleFactor / num;
    }
    gridLinePlacement(factorMultiplier);


    // Increase Scale Factor until MaxLines is not surpassed
    while (lineCount > lineMax){
        factorMultiplier++;
        gridLinePlacement(factorMultiplier);
    }
    
    let priceScale = chartHeight / spread;
    var priceY = (e) => {
        return chartHeight - (e - chartLow) * priceScale;
    }


    
    let volumeSpread = Math.max(...chartData.v) - Math.min(...chartData.v)
    let volumeScale = volumeChartHeight / volumeSpread
    var volumeHeight = (e) => {
        return (e) * volumeScale;
    }



    // Helpers
    let flip = (num) => num * -1 + chartHeight; // flips coordinates upside down based on chart height



    // Y Axis Array (labels and lines)
    for (let i=0; i <= lineCount; i++){
        yAxisLabelsArr.push({
            'y' : flip(i * chartHeight / lineCount),
            'label': (spread / lineCount * i + chartLow).toFixed(2)
        })
    }
    
    let formatTime = (time) => {
        return new Date(Math.floor(time * 1000)).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})
    }
        




    return (
        <div className="wrapper2">
            <svg className="chart-container2" height={chartHeight} width={chartWidth}>

                {/* CANDLES: GRID LINES & VALUES */}
                <svg className="grid-lines">
                    { yAxisLabelsArr.map((line, i)=>
                        <g key={i}>
                            <line className="gridLine" y1={line.y} y2={line.y} x1={0} x2={chartWidth} />                   
                            <text className="axisValue" x={chartWidth} y={line.y}>{line.label}</text>
                        </g>
                    )}
                </svg> 
                
                {/* CANDLES */}
                <svg className="candleArea" height={chartHeight} width={chartWidth} role="img">
                    { chartData.t.map((e, i)=>{

                        
                        return (
                            <g key={i}>
                                    <line className="line" 
                                        x1={unitWidth*i + unitWidth/2} 
                                        x2={unitWidth*i + unitWidth/2} 
                                        y1={priceY(chartData.h[i])} 
                                        y2={priceY(chartData.l[i])} 
                                    /> 
                                    <rect className={chartData.o[i] < chartData.c[i] ? 'green' : 'red'} 
                                        height={Math.abs(priceY(chartData.o[i]) - priceY(chartData.c[i]))} 
                                        width={unitWidth} 
                                        x={unitWidth*i} 
                                        y={priceY(chartData.c[i]) > priceY(chartData.o[i]) ? priceY(chartData.o[i]) : priceY(chartData.c[i])}
                                    />

                                    {/* SHOW TIME 
                                    { (i % 1 == 0 || i==0) &&
                                        <text x={0} y={unitWidth*i*-1}  transform="translate(20, 0) rotate(90)"> 
                                        { formatTime(chartData.t[i])}                                         
                                        </text>
                                    }*/}

                                    {/* { tradeData.map((e,x)=> {
                                        if(formatTime(chartData.t[i]) == e.exec_time.substring(0, 5)){
                                            return (
                                                <text x={unitWidth*i} y={priceY(e.price)}>Trade</text>
                                            )
                                        }
                                    })} */}
                                    
                            </g>
                        )
                    })}
                </svg>

                {/* TRADES */}
                <svg className="showTrades">
                    
                    { chartData.t.map((e, i)=>{
                    
                        return tradeData.map((e,x)=> {
                            if(e.exec_time.substring(0, 5) >= formatTime(chartData.t[i]) && e.exec_time.substring(0, 5) < formatTime(chartData.t[i+1] )){
                                return (
                                    <svg x={unitWidth*i + unitWidth/2} y={priceY(e.price)}>
                                        <circle r={8} className={e.side} fill="rgba(255,0,0,.5)" stroke="black" />
                                        
                                        {e.qty==0 && 
                                            <rect
                                                height={16} 
                                                width={40} 
                                                x={-2}
                                                y ={-10}
                                                fill = "rgba(255,255,255,.5)"
                                            >
                                                <text>{e.runningExposure}</text>
                                            </rect>
                                        }
                                    </svg>
                                )
                            }
                        })

                    })}

                </svg>

                {/* VOLUME:  GRID LINES & VALUES 
                {<svg className="grid-lines" height={chartHeight} width={chartWidth}>
                    { volumeLines.map((line, i)=>
                        <g key={i}>
                            <line className="gridLine light" y1={line.y} y2={line.y} x1={marginLeft} x2={chartWidth-labelWidth} />                   
                            <text className="axisValue light" x={chartWidth - labelWidth + labelIndent} y={line.y+labelOffset}> { line.label } </text>
                        </g>
                    )}
                </svg>}*/}
                

                
                {/* VOLUME */}
                <svg className="volumeCandles" height={volumeChartHeight} width={chartWidth} y={chartHeight-volumeChartHeight}>
                    { chartData.v.map((e, i)=>{
                        return (
                        <g key={i}>
                            <rect className="volumeBar" 
                                height={volumeHeight(e)} 
                                width={unitWidth} 
                                x={unitWidth*i}
                                y ={volumeChartHeight - volumeHeight(e)}
                            />
                        </g>
                        )
                    })}
                </svg>
            </svg>
        </div>      

    )
}
export default Chart