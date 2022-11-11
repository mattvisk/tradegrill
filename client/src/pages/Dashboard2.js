import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { BarChart, Area, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';


const Dashboard2 = ({user})=>{    
    
    let [trades, setTrades ] = useState(false);
    let [tradesByDay, setTradesByDay ] = useState(false);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState(false);
    let [profitAllTime, setProfitAllTime] = useState(0);

    useEffect(() => {
        Axios.get("http://"+window.location.hostname+":3001/get-trades").then((response)=> {
            setTrades(response.data.trades);
            setTradesByDay(response.data.tradesByDay);
            setTradesByDaySymbol(response.data.tradesByDaySymbol.reverse());
            setProfitAllTime(response.data.profitAllTime);
        });
    },[])

    
    return (
        <div className="with-sidebar">
            <div class="sidebar">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/">Calendar</NavLink>
                <NavLink to="/">Trades</NavLink>
                <NavLink to="/">Journal</NavLink>
            </div>
            <div className="not-sidebar">
                <div className="new-chart"> 
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tradesByDay} margin={{left:40,right:80,top:40,bottom:40}}>
                            <XAxis name="date" />
                            <YAxis type='number' />
                            <Line dataKey="running_profit" stroke="#8884d8" dot={false} />
                            <Area type="monotone" dataKey="pv" stroke="#82ca9d" fill="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="new-chart">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tradesByDay} margin={{left:40,right:80,top:40,bottom:40}}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Bar dataKey="profit_loss" fill="#0c9"  /> 
                    </BarChart>
                </ResponsiveContainer>
                </div>
                <table className="table-a">
                    <thead>
                        <tr>
                            <th>All Time Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{ profitAllTime }</td>
                        </tr>
                    </tbody>
                </table>
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
            </div> 
        </div>
    )
}
export default Dashboard2;