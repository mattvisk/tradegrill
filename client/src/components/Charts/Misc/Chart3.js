import '../../css/Chart2.scss';
import { useEffect, useRef } from 'react';


const Chart = ({chartData, tradeData, chartWidth, zoom, offset, setPremarketVol, setDayVolume, setOpenToHighVol, setDayHigh})=>{    
    const CanvasChartRef = useRef(null)


    let chartHeight = 600;
    let volumeChartHeight = chartHeight/5;
    let lineCount = 0;
    let lineMax = 12;
    let scaleFactor = .25;
    let yAxisLabelsArr = [];    
    let chartHigh, chartLow, spread;
    let factorMultiplier = 1;
    
    // Determine Line Count, Line Top and Bottom Value
    const gridLinePlacement = (num) => {
        chartHigh = Math.ceil((Math.max(...chartData.h)) / (scaleFactor * num)) * (scaleFactor * num); // Round to next chartHigh factor
        chartLow = Math.floor((Math.min(...chartData.l)) / (scaleFactor * num)) * (scaleFactor * num); // Round to next chartLow factor
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
    let flip = (num) => num * -1 + chartHeight; // flips coordinates upside down based on chart height

    // Y Axis Array (labels and lines)
    for (let i=0; i <= lineCount; i++){
        yAxisLabelsArr.push({
            'y' : flip(i * chartHeight / lineCount),
            'label': (spread / lineCount * i + chartLow).toFixed(2)
        })
    }
    // Convert Time to HH-MM-SS
    let formatTime = (time) => {
        return new Date(Math.floor(time * 1000)).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})
    }

    // Helpers
    let unitWidth = Math.floor((chartWidth) / chartData.t.length);
    unitWidth = chartWidth / chartData.t.length;

    // Premarket Volume
    let runningVolume = 0;
    let premarketVolume = 0;
    chartData.v.map((v, i) => {
        if(formatTime(chartData.t[i]) == '09:30'){
            setPremarketVol(runningVolume);
            premarketVolume = runningVolume;
        }
        runningVolume += v;
        setDayVolume(runningVolume);
    });  

    // Day Volume & Price
    let dayVolumeArr = chartData.v.filter((v, i) => {
        return (formatTime(chartData.t[i]) >= '09:30')            
    })
    let dayHighArr = chartData.h.filter((v, i) => {
        // return (formatTime(chartData.t[i]) >= '09:30')
    })
    let dayHigh = Math.max(...dayHighArr)
    setDayHigh(dayHigh);

    // Open to High Vol
    let openToHighVol = 0;
    dayVolumeArr.map((v, i) => {
        openToHighVol += v;
        if(dayHighArr[i] >= dayHigh) {
            setOpenToHighVol(openToHighVol);
            return;
        }
    });


    

    /* Draw Chart
    ------------------------------------------------------*/
    useEffect(() => {
        const canvas = CanvasChartRef.current
        const context = canvas.getContext('2d')
        canvas.height = chartHeight;
        canvas.width = chartWidth;
        drawChart(context)
    }, [chartData])


    const drawChart = c => {

        let premarketX;
        let afterHoursX;
        let openPrice;
        let targetTimeA;
        let targetTimeB;
        chartData.t.map((e, i)=>{
            // Draw Open And Close
            if(formatTime(chartData.t[i]) == '09:30' || formatTime(chartData.t[i]) == '16:00') {
                c.beginPath();
                c.lineWidth = 1;
                c.strokeStyle = '#bbb';
                c.setLineDash([2, 3]);
                c.moveTo(i*unitWidth - offset+ .5, 0);
                c.lineTo(i*unitWidth - offset + .5, chartHeight);
                c.stroke();
                c.closePath();
            }
            // Draw Target Entry Times
            if(formatTime(chartData.t[i]) == '10:00'){
                targetTimeA = i;
            }
            if(formatTime(chartData.t[i]) == '10:30'){
                targetTimeB = i;
            }
            if(formatTime(chartData.t[i]) == '09:30'){
                premarketX = i;
                openPrice = chartData.o[i];
            }
            if(formatTime(chartData.t[i]) == '16:00'){
                afterHoursX = i;
            }


            
        })
        
        // Time Target
        c.fillStyle = "rgba(0,0,0,.05";
        c.fillRect(// x, y , w, h
            targetTimeA * unitWidth,
            0,
            targetTimeB * unitWidth - targetTimeA * unitWidth,
            chartHeight,
        ) 


        // Open Line
        // c.beginPath();
        // c.fillStyle = "rgba(160,0,140,.35";
        // c.fillRect(// x, y , w, h
        //     0,
        //     priceY(openPrice),
        //     chartWidth,
        //     2 
        // ) 

        // Draw Open Spike Estimates
        let targetLow = 1.15;
        let targetHigh = 1.40;
        c.fillStyle = "rgba(0,0,0,.05";
        c.fillRect(// x, y , w, h
            0,
            priceY(openPrice * targetLow),
            chartWidth,
            (priceY(openPrice*targetLow) - priceY(openPrice*targetHigh)) * -1, 
        ) 
        c.stroke();
        c.closePath();




        // Premarket & After Hours Shade
        c.beginPath();
        c.fillStyle = "rgba(0,0,0,.075";
        c.fillRect(// x, y , w, h
            0,
            0,
            unitWidth * premarketX,
            chartHeight // Height
        ) 
        c.fillRect(// x, y , w, h
            unitWidth * afterHoursX,
            0,
            chartWidth - unitWidth * afterHoursX,
            chartHeight // Height
        ) 
        c.stroke();
        c.closePath();



        // Draw -  Y Axis Information
        yAxisLabelsArr.map((line, i)=>{
            c.beginPath();
            c.lineWidth = "0";
            c.fillStyle = "#ccc";
            c.fillRect(// x, y , w, h
                0,
                Math.floor(line.y),
                chartWidth, 
                1 // Height
            ) 
            c.stroke();        
            // Label
            c.beginPath();
            c.fillStyle = "#444";
            c.font = '12px sans-serif';
            c.fillText(line.label, chartWidth - 60, line.y+5);
            c.closePath();
        })
        
        //  Draw - Candlestick Lines
        c.beginPath();
        chartData.t.map((e, i)=>{
            c.fillStyle = "#ccc";
            c.fillRect(// x, y , w, h
                i * unitWidth + Math.floor(unitWidth/2)  - offset,
                priceY(chartData.h[i]),
                1, 
                Math.abs(priceY(chartData.h[i]) - priceY(chartData.l[i]))
            ) 
        })
        c.stroke();
        c.closePath();

        // Draw - Candlestick Bars
        c.beginPath();
        chartData.t.map((e, i)=>{
            c.fillStyle = chartData.o[i] < chartData.c[i] ? "#1fac42" : "red";
            c.fillRect(// x, y , w, h
                i * unitWidth + 1  - offset,
                priceY(chartData.c[i]), 
                unitWidth,
                priceY(chartData.o[i]) - priceY(chartData.c[i])
            ) 
        })
        c.stroke();
        c.closePath();

        // Draw - Volume
        c.beginPath();
        chartData.v.map((e, i)=>{
            c.fillStyle = chartData.o[i] < chartData.c[i] ? "#6f6d96" : "#7c7ba1";
            c.fillRect(// x, y , w, h
                i * unitWidth  - offset,
                volumeChartHeight - volumeHeight(e) + chartHeight-volumeChartHeight,
                unitWidth,
                volumeHeight(e)
            )
        })
        c.stroke();
        c.closePath();


        // Total Volume Indicator Text 
        let volumeAdd = 0;
        let showVolA = true;
        let showVolB = true;
        let showVolC = true;
        c.beginPath();
        chartData.v.map((e, i)=>{

            volumeAdd += e;
            if(volumeAdd >= premarketVolume * 3 && showVolA){
                showVolA = false;
                c.fillStyle = "#444";
                c.font = '10px sans-serif';
                //c.fillText((volumeAdd/1000000).toFixed(2)+"M", i * unitWidth - offset+ 8, 20);
                c.fillStyle = "rgb(121 43 222 / 40%)";
                c.fillRect(// x, y, w, h
                    i * unitWidth  - offset + unitWidth/2,
                    0,
                    2,
                    chartHeight
                )
            }
            if(volumeAdd >= premarketVolume * 4 && showVolB){
                showVolB = false;
                c.fillStyle = "#444";
                c.font = '10px sans-serif';
                // c.fillText((volumeAdd/1000000).toFixed(2)+"M (", i * unitWidth - offset+ 8, 20);
                c.fillStyle = "rgb(121 43 222 / 40%)";
                c.fillRect(// x, y, w, h
                    i * unitWidth  - offset + unitWidth/2,
                    0,
                    2,
                    chartHeight
                )
            }
            if(volumeAdd >= premarketVolume * 5 && showVolC){
                showVolC = false;
                c.fillStyle = "#444";
                c.font = '10px sans-serif';
                // c.fillText((volumeAdd/1000000).toFixed(2)+"M (", i * unitWidth - offset+ 8, 20);
                c.fillStyle = "rgb(121 43 222 / 40%)";
                c.fillRect(// x, y, w, h
                    i * unitWidth  - offset + unitWidth/2,
                    0,
                    2,
                    chartHeight
                )
            }
        })
        c.stroke();
        c.closePath();

        // Draw - Exectutions/Trades
        let time = new Date();
        chartData.t.map((e, i)=>{
            { tradeData.map((e, x)=>{
                if(e.exec_time.substring(0, 5) >= formatTime(chartData.t[i]) && e.exec_time.substring(0, 5) < formatTime(chartData.t[i+1] )){
                    c.beginPath();
                    c.arc(unitWidth*i + unitWidth/2, priceY(e.price), 4, 0, 2 * Math.PI); // GROWING QTY
                    c.lineWidth = 1;
                    c.fillStyle = e.side == 'SS' ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, .75)';
                    c.strokeStyle = 'rgba(0,0,0,1)';
                    c.setLineDash([]);
                    c.fill();
                    c.stroke();
                    c.closePath();
                    
                }
            })}
        })


    }

    return (
        <>
            <canvas ref={CanvasChartRef} />
        </>
    )
}
export default Chart