import { NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { BarChart, Area, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
import 'material-icons/iconfont/material-icons.css';

const Dashboard2 = ({user})=>{    
    
    let [trades, setTrades ] = useState([]);
    let [tradesByDay, setTradesByDay ] = useState([]);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState([]);
    let [profitAllTime, setProfitAllTime] = useState(0);

    useEffect(() => {
        Axios.get("http://"+window.location.hostname+":3001/get-trades").then((response)=> {
            // let shortenTrades = response.data.trades.slice(-1000);
            // setTrades(shortenTrades);
            setTrades(response.data.trades);
            setTradesByDay(response.data.tradesByDay);
            setTradesByDaySymbol(response.data.tradesByDaySymbol);
            setProfitAllTime(response.data.profitAllTime);
        });
    },[])

    const showDetails = (i) => {
        
        let copyTradesByDay = tradesByDaySymbol;
        copyTradesByDay[i].showDetails = true;
        setTradesByDaySymbol(copyTradesByDay);
        console.log(tradesByDaySymbol);

    }


    return (
        <div className="with-sidebar">
            <div class="sidebar">
                <Link to="/" className='logo'>
                    TradeGrill
                </Link>
                <NavLink to="/dashboard"><span class="material-icons">dashboard</span>Dashboard</NavLink>
                <NavLink to="/calendar"><span class="material-icons">calendar_month</span>Calendar</NavLink>
                <NavLink to="/all-trades"><span class="material-icons">bar_chart</span>Trades</NavLink>
                <NavLink to="/journal"><span class="material-icons">school</span>Journal</NavLink>
            </div>
            <div className="not-sidebar">
                <div className="inner">
                    
                    {/* ------------------------------------------- */}
                    <h3>All Time Profit: {profitAllTime}</h3>
                    <div className="new-chart"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tradesByDay} margin={{left:40,right:80,top:40,bottom:40}}>
                                <XAxis name="date" />
                                <YAxis type='number' />
                                <Tooltip />
                                <Line dataKey="running_profit" stroke="#8884d8" dot={false} />
                                <Area type="monotone" dataKey="pv" stroke="#82ca9d" fill="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <h3>Daily P&L</h3>
                    <div className="new-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tradesByDay} margin={{left:40,right:80,top:40,bottom:40}}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="profit_loss" fill="#0c9"  /> 
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ------------------------------------------- */}
                    <h3>Trades P&L</h3>
                    <div className="new-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trades} margin={{left:40,right:80,top:40,bottom:40}}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
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

                    {/* ------------------------------------------- */}
                    <h3>Trades by Symbol & Day</h3>
                    <table className="table-a">
                        <thead>
                            <tr>
                                <th>Open</th>
                                <th>Symbol</th>
                                <th className="rt">Profit/Loss</th>
                                <th className="rt">Trades</th>
                            </tr>
                        </thead>
                        <tbody>
                            { tradesByDaySymbol && tradesByDaySymbol.map((trades) => 
                            <>
                                <tr  key={trades.id}>
                                    <td><button onClick={()=>{showDetails(trades.id)}} trades="trade">Show Details</button></td>
                                    <td><Link to={`trades/${trades.symbol}/${trades.date}`}>{trades.symbol}<br /><small>{trades.date}</small></Link></td>
                                    <td>{trades.profit_loss.toFixed(2)}</td>
                                    <td>{trades.trades.length}</td>
                                </tr>
                                {/* IN PROGRESS --- SHOW/HIDE if TRUE */}
                                { trades.showDetails===true && trades.trades.map(trade => 
                                    <tr key={trade.id}>
                                        <td>{trade.symbol}</td>
                                        <td>{trade.symbol}</td>
                                    </tr> 
                                )}
                                
                            </>
                            )}
                        </tbody>
                    </table> 
                    {/* ------------------------------------------- */}
                    {/* <h3>Trades</h3>
                    <table className="table-a">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th className="rt">Profit/Loss</th>
                                <th className="rt">Side</th>
                            </tr>
                        </thead>
                        <tbody>
                            { trades && trades.map((trades,i) => 
                                <tr key={i}>
                                    <td>{trades.symbol}<br /><small>{trades.date}</small></td>
                                    <td className="rt">{trades.profit_loss.toFixed(2)}</td>
                                    <td className="rt">{trades.side}</td>
                                </tr>
                            )}
                        </tbody>
                    </table> */}  
                </div>
            </div> 
        </div>
    )
}
export default Dashboard2;