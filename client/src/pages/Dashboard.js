import { NavLink, Link, useHistory  } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import UploadTrades from '../components/UploadTrades';
import Format from 'date-fns/format';
import { BarChart, Area, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
import 'material-icons/iconfont/material-icons.css';

const Dashboard2 = ({user}) => {
    
    // Use Effect?
    useEffect(() => {getData()},[])

    const history = useHistory();

    // State
    // let [recentTrades, setRecentTrades ] = useState([]);
    const [symbolFilter, setSymbolFilter ] = useState(null);
    let [trades, setTrades ] = useState([]);
    let [tradesByDay, setTradesByDay ] = useState([]);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState([]);
    let [profitAllTime, setProfitAllTime] = useState(0);

    // Data Filter
    let [dateFrom, setDateFrom] = useState(new Date('01-01-2020'));
    let [dateTo, setDateTo] = useState(new Date());

    // Http Request: Get Trade Data
    const getData = ()=>{

        let search = window.location.search
        let paramsUrl = new URLSearchParams(search)
        const symbol = paramsUrl.get('symbol')

        setSymbolFilter(symbol)

        const params = {
            'dateFrom': Format(dateFrom, 'yyyy-MM-dd'), 
            'dateTo': Format(dateTo, 'yyyy-MM-dd')
        }

        if (symbol && symbol !== '') {
            params.symbol = symbol
        }

        Axios.post("http://"+window.location.hostname+":3001/get-trades", params).then((response)=> {
            setTrades(response.data.trades);
            // setRecentTrades(response.data.trades.slice(-100));
            setTradesByDay(response.data.tradesByDay);
            setTradesByDaySymbol(response.data.tradesByDaySymbol);
            setProfitAllTime(response.data.profitAllTime);
        });
    }

    // Delete Request
    const deleteTrades = ()=>{
        Axios.get("http://"+window.location.hostname+":3001"+"/deleteTrades")
            .then((response)=> {
                console.log("Deleted Trades");
                getData();
            }
        );
    }

    const handleSubmitFilter = (event) => {
        event.preventDefault();

        const value = event.target.symbol.value
        if (value === '') {
            history.push({
                pathname: '/dashboard'
            })
        } else {
            history.push({
                pathname: '/dashboard',
                search: `?symbol=${value}`
            })
        }

        getData()
    }

    // Chart Styling
    let margin = {top:30,right:20,left:0,bottom:30};

    // Toggle Table Row
    const showDetails = id => setTradesByDaySymbol(tradesByDaySymbol.map(trade => trade.id === id ? {...trade, showDetails: !trade.showDetails} :  {...trade, showDetails: false} ));//trade));

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
                <hr />
                {/* <Link to="/journal"><span class="material-icons">upload</span>Upload Trades</Link> */}
                <button><span class="material-icons">upload</span>Upload Trades <UploadTrades user={user} callback={getData} /></button>
                <button onClick={deleteTrades}><span class="material-icons">delete</span>Delete Trades</button>
            </div>
            <div className="not-sidebar">
                <div className="inner">

                    {/* ------------------------------------------- */}
                    <h1>Dashboard</h1>

                    <div class="container">
                        <div class="row">
                            <div class="col-6">
                                <button>{Format(dateFrom, 'MMM d, yyyy')}</button> - <button>Today</button>
                            </div>

                            <div class="col-6">
                                <form className='filter-box' onSubmit={handleSubmitFilter}>
                                    <input
                                        className='filter-input'
                                        placeholder="Type Symbol Here ..."
                                        type="text"
                                        id="symbol"
                                        name="symbol"
                                        onChange={(e) => setSymbolFilter(e.target.value)}
                                        value={symbolFilter}
                                    />

                                    <button type="submit">Filter</button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <table className="table-a">
                        <thead>
                            <tr>
                                <th>Profit</th>
                                <th>Trades</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{ profitAllTime }</td>
                                <td>{ trades.length }</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    {/* ------------------------------------------- */}
                    <h3>Running P&L</h3>
                    <div className="new-chart"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tradesByDay} margin={margin} fontSize={12}>
                                {/* <XAxis name="date" /> */}
                                <CartesianGrid strokeDasharray="1" stroke="rgba(255,255,255,.15)" />
                                <YAxis tickCount={8}/>
                                <Tooltip />
                                <Line dataKey="running_profit" stroke="#8884d8" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* ------------------------------------------- */}
                    <h3>Daily P&L</h3>
                    <div className="new-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={tradesByDay} margin={margin} fontSize={12}>
                                <XAxis dataKey="symbol" />
                                <YAxis/>
                                <Tooltip />
                                <Legend />
                                <Bar name="Profit Loss" dataKey="profit_loss"> 
                                    { tradesByDay.map((trade) => (
                                        <Cell key={trade.id} fill={trade.profit_loss >= 0 ? '#0c9' : '#c22' }/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* ------------------------------------------- */}
                    <h3>Trades P&L</h3>
                    <div className="new-chart">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trades} margin={margin} fontSize={12}>
                                <YAxis tickCount={10} />
                                <Tooltip />
                                <Bar dataKey="profit_loss"> 
                                    { trades.map((trade) => (
                                        <Cell key={trade.id} fill={trade.profit_loss >= 0 ? '#0c9' : '#c22' }/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ------------------------------------------- */}
                    <table className="table-a">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th className="rt">Profit/Loss</th>
                                <th className="rt">Trades</th>
                            </tr>
                        </thead>
                        <tbody>
                            { tradesByDaySymbol && tradesByDaySymbol.slice(0).reverse().map((trades) => 
                            <>
                                <tr key={trades.id} className={trades.showDetails && 'open'} onClick={()=>{showDetails(trades.id)}}>
                                    <td>
                                        <Link to={`trades/${trades.symbol}/${trades.date}`}>{trades.symbol}</Link>
                                        <br />
                                        {trades.date}
                                    </td>
                                    <td className="rt">{trades.profit_loss.toFixed(2)}</td>
                                    <td className="rt">{trades.trades.length}</td>
                                </tr>
                                { trades.showDetails === true && trades.trades.map(trade => 
                                    <tr key={trade.id} class="child">
                                        <td className="">{trade.time_in_nice} - {trade.time_out_nice}</td>
                                        <td className="rt">{trade.profit_loss.toFixed(2)}</td>
                                        <td className="rt">{trade.side}</td>
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