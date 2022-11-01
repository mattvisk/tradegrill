import { useEffect, useState, useRef } from 'react';
import Axios from 'axios';
import '../css/Chart.scss';

const ChartPage = ({user})=>{
    const [chartData, setChartData] = useState(false);
    const [chartWidth, setChartWidth] = useState(1000)
    const [chartHeight, setChartHeight] = useState(500)
    const ref   = useRef(null);

    useEffect(()=>{
        Axios.post("http://"+window.location.hostname+":3001"+"/viewChart", {symbol: 'TSLA', date: '2021-10-06'})
            .then(response => {
                setChartData(response.data);
                setChartWidth(ref.current.clientWidth)
                setChartHeight(ref.current.clientHeight)
            })
            .catch(error => console.log("loadChart() Error "+error))
    },[])

    const DrawChart = ({data})=>{
        const highestPrice = Math.max.apply(Math, data.data.data.map((e)=>e.high)); 
        const lowestPrice = Math.min.apply(Math, data.data.data.map((e)=>e.low)); 
        const highestVolume = Math.max.apply(Math, data.data.data.map((e)=>e.volume));
        let marginTop = 4;
        let marginBottom = 4;
        let marginLeft = 0;
        let candleAreaHeight = chartHeight * .66 - marginTop;
        let volumeAreaHeight = chartHeight * .24 - marginBottom;
        let labelWidth = 40;
        let labelIndent = 8;
        let labelOffset = 3;
        let candleWidth = (chartWidth-labelWidth-marginLeft) / data.data.data.length;
        let priceSpread = highestPrice - lowestPrice; 
        let scale = candleAreaHeight / priceSpread;
        let priceY = (price) => candleAreaHeight - (price - lowestPrice) * scale + marginTop;
        let volScale = volumeAreaHeight / highestVolume;
        let volumeBarHeight = (volume) => {
            let output = volume * volScale
            output = output > 0 ? output : 0;
            return output;
        }
        let candleX = (i)=> chartWidth - (i * candleWidth) - candleWidth - labelWidth;
        let lineCount = Math.round(candleAreaHeight/40);
        let candleGridLines = [];
        for (let i=0;i<=lineCount;i++){
            var line = {
                y: candleAreaHeight / lineCount * i + marginTop,
                label: Math.round(highestPrice-(priceSpread / (lineCount) * i))
            }
            candleGridLines.push(line)
        }
        let volLineCount = Math.round(volumeAreaHeight / 40);
        let volumeLines = [];
        for (let i=0;i<=volLineCount;i++){
            let line = {
                y: volumeAreaHeight / volLineCount * i + chartHeight - volumeAreaHeight - marginBottom,
                label: highestVolume - highestVolume / volLineCount * i
            };
            line.label = line.label > 999999 ? Math.round(line.label/1000000)+'M' : line.label;
            line.label = line.label > 9999 ? Math.round(line.label/1000)+'TH' : line.label;
            volumeLines.push(line)
        }
        
        return (
            <div className="wrapper">
                <div className="chart-container" ref={ref}>
                    {/* CANDLES: GRID LINES & VALUES */}
                    <svg className="grid-lines" height={chartHeight} width={chartWidth}>
                        { candleGridLines.map((line, i)=>
                            <g key={i}>
                                <line className="gridLine" y1={line.y} y2={line.y} x1={marginLeft} x2={chartWidth-labelWidth} />                   
                                <text className="axisValue" x={chartWidth-labelWidth+labelIndent} y={line.y+ labelOffset}>{line.label}</text>
                            </g>
                        )}
                    </svg>
                    {/* CANDLES */}
                    <svg className="candleArea" height={chartHeight} width={chartWidth} role="img">
                        { data.data.data.map((e, i)=>{
                            let tickOpen = priceY(e.open);
                            let tickClose = priceY(e.close);
                            let tickLow = priceY(e.low);
                            let tickHigh = priceY(e.high);
                            let barHeight = Math.abs(tickOpen-tickClose) >=1 ? Math.abs(tickOpen-tickClose) : 1 ; 
                            return (
                                <g key={i}>
                                    <g>
                                        <line className="line" 
                                            x1={candleX(i) + candleWidth/2 -1} 
                                            x2={candleX(i) + candleWidth/2 -1 } 
                                            y1={tickLow} 
                                            y2={tickHigh} 
                                        /> 
                                        <rect className={e.open < e.close ? 'bar green' : 'bar red'} 
                                            height={barHeight} 
                                            width={candleWidth-2} 
                                            x={candleX(i)} 
                                            y={priceY(e.close < e.open ? e.open : e.close)}
                                        />
                                        {/* <line className="line open" x1={candleX(i)} x2={candleX(i)+10} y1={tickOpen} y2={tickOpen} />
                                        <line className="line close" x1={candleX(i)} x2={candleX(i)+10} y1={tickClose} y2={tickClose} /> */}
                                    </g>
                                </g>
                            )
                        })}
                    </svg>

                    {/* VOLUME:  GRID LINES & VALUES */}
                    <svg className="grid-lines" height={chartHeight} width={chartWidth}>
                        { volumeLines.map((line, i)=>
                            <g key={i}>
                                <line className="gridLine light" y1={line.y} y2={line.y} x1={marginLeft} x2={chartWidth-labelWidth} />                   
                                <text className="axisValue light" x={chartWidth - labelWidth + labelIndent} y={line.y+labelOffset}> { line.label } </text>
                            </g>
                        )}
                    </svg>

                    
                    {/* VOLUME */}
                    <svg className="volumeCandles" height={chartHeight} width={chartWidth}>
                        { data.data.data.map((e, i)=>{
                            return (
                            <g key={i}>
                                <rect className="volumeBar" 
                                    height={volumeBarHeight(e.volume)} 
                                    width={candleWidth-2} 
                                    x={candleX(i)}
                                    y ={(chartHeight)-volumeBarHeight(e.volume)-marginBottom}
                                />
                            </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
        )
    }



    return (
        <>
            <h1>TSLA</h1>
            { chartData && <DrawChart data={chartData} /> }
        </>
    )
}
export default ChartPage