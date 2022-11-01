import './ProfitLossCandles.scss';
import { Link } from 'react-router-dom';


const ProfitLossCandle = (props) => {
  
  let profit = props.data.profit / 40
  let loss = profit < 0 ? true : false; 

  let style = {
    height: Math.abs(profit),
    marginTop: loss ? 0 : profit * -1,
    background: loss ? '#e45339' : '#0c9'
  }

  return (
    <Link to={"/trades/"+props.data.symbols[0]+"/"+props.data.date} className="profit-loss-candle" style={style}>
      {/* {Math.abs(props.data.profit.toFixed(0))} */}
    </Link>
  )

};




// Profit Loss Component
const ProfitLossCandles = ({ data }) => 
<div className="pl-candles-chart">
<div className="profit-loss-candles">

  {data.daySummaryArr.map((e,i)=> 
      <ProfitLossCandle data={e} />
  )}
</div>
</div>
export default ProfitLossCandles;