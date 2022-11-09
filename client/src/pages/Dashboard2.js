import { useState, useEffect } from 'react';
import Axios from 'axios';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const Dashboard2 = ({user})=>{    
    
    let [trades, setTrades ] = useState(false);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState(false);
    let [tradesByDay, setTradesByDay ] = useState(false);
    let [tradesByDayReverse, setTradesByDayReverse ] = useState(false);

    useEffect(() => {
        Axios.get("http://"+window.location.hostname+":3001/get-trades").then((response)=> {
            setTrades(response.data.trades);
            setTradesByDaySymbol(response.data.tradesByDaySymbol);
            setTradesByDay(response.data.tradesByDay);
            setTradesByDayReverse(response.data.tradesByDay.reverse());
        });
    },[])
    
    return (
        <>
            
            { tradesByDaySymbol &&
                <div className="new-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart width={500} height={300} data={tradesByDayReverse} margin={{top: 5, right: 30, left: 20, bottom: 5,}} reverseStackOrder="true">
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}
                    <Bar dataKey="profit_loss" fill="#0c9"  />
                    </BarChart>
                </ResponsiveContainer>
                </div>
            }

            { trades &&
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
                    { tradesByDaySymbol && tradesByDaySymbol.map((trades,i) => 
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