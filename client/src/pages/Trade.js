import Chart5 from "../components/Charts/Chart5";
import Statistic from "../components/Statistic";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Format from "date-fns/format";
import { add } from "date-fns";
import Axios from "axios";
const Trades = (props) => {

  
  //const { urlDate, urlSymbol, urlDays } = useParams();
  let { urlDate, urlSymbol, urlDaysBack, urlDaysForward } = useParams();
  if(!urlSymbol){
    urlSymbol = props.symbol;
    urlDate = props.dateIn;
  }
  let daysBack = urlDaysBack ? urlDaysBack : 0;
  let daysForward = urlDaysForward ? urlDaysForward : 0;
  document.title = urlSymbol;
  const [chartData, setChartData] = useState(false);
  const [resolution, setResolution] = useState(1);
  const [tradeData, setTradeData] = useState(false);
  const [companyData, setCompanyData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [premarketVol, setPremarketVol] = useState(false);
  const [dayVol, setDayVolume] = useState(false);
  const [openToHighVol, setOpenToHighVol] = useState(false);
  const [dayHigh, setDayHigh] = useState(false);
  const [chartWidth, setChartWidth] = useState(1000);
  const [zoom, setZoom] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {

    /* Get Trades
    -------------------*/
    Axios
    .post("http://" + window.location.hostname + ":3001" + "/viewChart2", {
      symbol: urlSymbol,
      date_from: add(new Date(urlDate), { days: daysBack * -1 }),
      date_to: add(new Date(urlDate), { days: daysForward + 1 }),
      resolution: resolution,
    })
    .then((response) => {
      setLoading(false);
      setChartWidth(window.innerWidth);
      setZoom(0);
      setOffset(0);
      setChartData(response.data);
    })
    .catch((error) => console.log("loadChart() Error " + error));
    /* Get Company Profile
    -----------------------------*/
    Axios
    .post("http://" + window.location.hostname + ":3001" + "/companyprofile", { symbol: urlSymbol })
    .then((response) => {
      setCompanyData(response.data);
    })
    .catch((error) => console.log("Company Profile Error " + error));
    
    /* Get Trades
    -------------------*/
    Axios
    .post("http://" + window.location.hostname + ":3001" + "/trades", {symbol: urlSymbol, date: Format(new Date(urlDate), "yyyy-MM-dd")})
    .then((response) => {setTradeData(response.data);})
    .catch((error) => console.log("loadChart() Error " + error));

  }, []); 




  return (
    <>
      {chartData.success && companyData.success && tradeData.success && (
        
        <>
        <Chart5
          logo={companyData.data.logo}
          symbol={urlSymbol}
          dateIn={urlDate}
          dateOut={urlDate}
          chartData={chartData.data}
          tradeData={tradeData.data}
          chartWidth={chartWidth}
        />
          
        </>
      )}

      <Statistic tradeData={tradeData} urlSymbol={urlSymbol}  urlDate={urlDate} />

      {/* Trades */}
      {tradeData.success && (
        <table className="table-a">
          <thead>
            <tr>
              <th>Trade ID</th>
              <th>Symbol</th>
              <th>Time</th>
              <th>Side</th>
              <th>Price</th>
              <td>Qty</td>
              <th>Running Qty</th>
              <th>Trade Qty</th>
            </tr>
          </thead>
          <tbody>
            {tradeData.data.map((e, i) => 
                <tr>
                  <td>{e.trade_id}</td>
                  <td>{e.symbol}</td>
                  <td>{e.exec_time}</td>
                  <td className={e.side == 'SS' || e.side == 'S' ? 'red':'green'}>{e.side=='SS' || e.side=='S' ? "SELL" : "BUY"}</td>
                  <td>{e.price}</td>
                  <td>{e.qty}</td>
                  <td>{e.runningQty}</td>
                  <td>{e.trade_qty}</td>
                </tr>
              )}
          </tbody>
        </table>
      )}
    </>
  );
};
export default Trades;
