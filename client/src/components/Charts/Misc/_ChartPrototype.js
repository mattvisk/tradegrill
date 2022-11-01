const initChart = (data) => {

    // Chart Settings
    let dataLength = data.t.length;
    let chartHeight = window.innerHeight;
    let unitWidth = 6;
    let candleWidth = 3;
    let chartWidth = dataLength * unitWidth //window.innerWidth;

    // Price Math
    let priceHigh = Math.ceil((Math.max(...data.h)));
    let priceLow = Math.floor((Math.min(...data.l)));
    let spread = priceHigh - priceLow;
    let priceRatio = chartHeight / spread;
    let getYPosition = y => chartHeight - (y - priceLow) * priceRatio;
 
    // Volume Math
    const volumeHeight = chartHeight - chartHeight / 10;
    let volumeHigh = Math.ceil((Math.max(...data.v)));
    let volumeRatio = volumeHeight / volumeHigh;
    let getVolumeHeight = (v) => {
        return v * volumeRatio;
    }  

    
    // Chart Helpers
    let formatTime = (time) => {
        return new Date(Math.floor(time * 1000)).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})
    }

    

    // Price Candles
    const drawCandles = (data) => {
        const candles = document.getElementById(`candles`);
        ctx = candles.getContext(`2d`);
        ctx.beginPath();
        data.t.map((e, i)=>{
            // Candle Thin
            ctx.fillStyle = `#333`;
            ctx.fillRect( // x, y , w, h
                unitWidth * i,
                getYPosition(data.h[i]),
                candleWidth, 
                getYPosition(data.l[i]) - getYPosition(data.h[i]),
            ) 
            // Candle Thick
            ctx.fillStyle = data.o[i] < data.c[i] ? "#0c9" : "#e45339";
            ctx.fillRect( // x, y , w, h
                unitWidth * i,
                getYPosition(data.o[i]),
                candleWidth, 
                (getYPosition(data.o[i]) - getYPosition(data.c[i])) * -1,
            ) 
        })
    }   

    // Volume Candles
    const drawVolume = (data) => { 
        const volume = document.getElementById(`volume`);
        ctx = volume.getContext(`2d`);
        ctx.beginPath();
        data.t.map((e, i)=>{
            ctx.fillStyle = `#271d49` //`rgba(255,255,255,.1)`;
            ctx.fillRect(// x, y , w, h
                unitWidth * i,
                chartHeight - getVolumeHeight(data.v[i]),
                candleWidth, 
                getVolumeHeight(data.v[i]) //volumeY(data.v[i])
            ) 
        })
    }


    // Price Lines (y Axis)
    const drawYAxis = (data) => {
        // const yAxis = document.getElementById(`y-axis`);
        // ctx = yAxis.getContext(`2d`);
        // ctx.beginPath();
        
        // let i = 1;
        // while(i < Math.floor(chartHeight / 40)){
        //     let yPosition = chartHeight / 30 * i;
        //     ctx.beginPath();
        //     ctx.moveTo(0, yPosition + .5);
        //     ctx.strokeStyle = `#333`
        //     ctx.lineWidth = 1;
        //     ctx.lineTo(chartWidth, yPosition);
        //     ctx.stroke();
        //     i++;
            
        //     ctx.fillStyle = "#fff";
        //     ctx.fillText('557', chartWidth - 40, (i-1) * 40 +3);
        // }
    }
    
    // Time Lines (x Axis)
    const drawXAxis = (data) => {
        const yAxis = document.getElementById(`y-axis`);
        ctx = yAxis.getContext(`2d`);
        ctx.beginPath();
        // Map Minute Lines
        data.t.map((e, i) => {           
            ctx.beginPath();
            ctx.moveTo(i * unitWidth + unitWidth / 4, 0);
            ctx.strokeStyle = `rgba(255,255,255,.025)`            
            if(formatTime(data.t[i]) == '09:30')  {
                ctx.strokeStyle = `rgba(255,255,255,.2)`
            }   
            if(formatTime(data.t[i]) == '16:00')  {
                ctx.strokeStyle = `rgba(255,255,255,.2)`
            }  
            ctx.lineWidth = 1;
            ctx.lineTo(i * unitWidth, chartWidth);
            ctx.stroke();
        })
    }




    const createChart = (data)=>{
        // Create Canvas's
        const chart = document.getElementById(`chart`)
        chart.innerHTML += `<canvas id="x-axis" width="${chartWidth}" height="${chartHeight}"></canvas>`;
        chart.innerHTML += `<canvas id="y-axis" width="${chartWidth}" height="${chartHeight}"></canvas>`;
        chart.innerHTML += `<canvas id="volume" width="${chartWidth}" height="${chartHeight}"></canvas>`;
        chart.innerHTML += `<canvas id="candles" width="${chartWidth}" height="${chartHeight}"></canvas>`;
        
        drawYAxis(data);
        drawXAxis(data);
        drawVolume(data);
        drawCandles(data);
    }
    createChart(data);


}
