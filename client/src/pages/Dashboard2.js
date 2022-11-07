import { useState, useEffect } from 'react';
import Axios from 'axios';
import PLChart from '../components/PLChart';
const Dashboard2 = ({user})=>{    
    
    let [trades, setTrades ] = useState(false);
    let [tradesGrouped, setTradesGrouped ] = useState(false);

    useEffect(() => {
        Axios.get("http://"+window.location.hostname+":3001/get-trades").then((response)=> {
            setTrades(response.data.trades);
            setTradesGrouped(response.data.tradesGrouped);
        });
    },[])
    
    return (
        <>
            { tradesGrouped &&
                <ul>
                    <li>Profit (all time): {trades.map(trade => trade.profit_loss).reduce((a, b) => a + b, 0).toFixed(2)} </li>
                    <li>Trades (all time):  {trades.length}</li>
                </ul>
            } 
            <table className="table-a">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th className="rt">Profit/Loss</th>
                        <th className="rt">Trades</th>
                    </tr>
                </thead>
                <tbody>
                    { tradesGrouped && tradesGrouped.map((trades,i) => 
                        <tr key={i}>
                            <td>{trades.symbol}<br /><small>{trades.date}</small></td>
                            <td className="rt">{trades.profit_loss.toFixed(2)}</td>
                            <td className="rt">{trades.trades.length}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* <table className="table-a">
                <tr>
                    <th>Symbol</th>
                    <th>Date In</th>
                    <th>Date Out</th>
                    <th>Profit/Loss</th>
                    <th>Pattern</th>
                </tr>
                { trades && trades.map((trade,i) => 
                    <tr>
                        <td>{trade.symbol}</td>
                        <td>{trade.date_in_nice}</td>
                        <td>{trade.date_out_nice}</td>
                        <td>{trade.profit_loss.toFixed(2)}</td>
                        <td>None</td>
                    </tr>
                )}
            </table> */}
        </>
    )
}
export default Dashboard2;