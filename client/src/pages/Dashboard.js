import { NavLink, Link, useHistory  } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import UploadTrades from '../components/UploadTrades';
import Format from 'date-fns/format';
import { BarChart, Area, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'material-icons/iconfont/material-icons.css';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard2 = ({user}) => {
    
    // Use Effect?
    useEffect(() => {
        getData()
        getPatterns()
    }, [])

    const history = useHistory();

    // State
    // let [recentTrades, setRecentTrades ] = useState([]);
    const [symbolFilter, setSymbolFilter ] = useState(null);
    const [patternFilter, setPatternFilter ] = useState(null);
    const [patterns, setPatterns ] = useState([]);
    let [trades, setTrades ] = useState([]);
    let [tradesByDay, setTradesByDay ] = useState([]);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState([]);
    let [profitAllTime, setProfitAllTime] = useState(0);

    // Data Filter
    let [dateFrom, setDateFrom] = useState(new Date('01-01-2022'));
    let [dateTo, setDateTo] = useState(new Date());

    const getPatterns = async () => {
        const { data } = await Axios.get("http://"+window.location.hostname+":3001/patterns")
        setPatterns(data)
    }

    // Http Request: Get Trade Data
    const getData = ()=>{

        let search = window.location.search
        let paramsUrl = new URLSearchParams(search)
        const symbol = paramsUrl.get('symbol')
        const pattern = paramsUrl.get('pattern')

        setSymbolFilter(symbol)
        setPatternFilter(pattern)

        const params = {
            'dateFrom': Format(dateFrom, 'yyyy-MM-dd'), 
            'dateTo': Format(dateTo, 'yyyy-MM-dd')
        }

        if (symbol && symbol !== '') {
            params.symbol = symbol
        }

        if (pattern && pattern !== '') {
            params.pattern = pattern
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
 
        const symbol = event.target.symbol.value
        const pattern = event.target.pattern.value

        const filters = [{
            type: 'symbol',
            value: symbol
        }, {
            type: 'pattern',
            value: pattern
        }]

        if (symbol === '' && pattern === '') {
            history.push({
                pathname: '/dashboard'
            })
        } else {
            let query = `?`
            filters.map((filter) => filter.value !== '' && filter.value !== null ? query += `${filter.type}=${filter.value}&` : '')
            history.push({
                pathname: '/dashboard',
                search: query
            })
        }

        getData()
    }

    const handleDateFilter = (type, value) => {
        if (type === 'date_from') {
            setDateFrom(value)
        } else {
            setDateTo(value)
        }
    }

    useEffect(() => {
        getData()
    }, [dateFrom, dateTo])

    const handlePatternChange = async (event, trades) => {
        const pattern_id = event.target.value
        const trade_id = []
        trades.map((trade) => trade_id.push(trade.id))

        const { status, data } = await Axios.post(`http://${window.location.hostname}:3001/update-trade`, {
            pattern_id,
            trade_id
        })

        if (status === 200) {
            toast.success(data.message, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        } else {
            toast.error(data.message, {
                position: "top-left",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        }
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
                <hr />

                <h4>Date</h4>
                <DatePicker
                    className='filter-input'
                    selected={dateFrom}
                    onChange={(date) => handleDateFilter('date_from', date)}
                    selectsStart
                    startDate={dateFrom}
                    endDate={dateTo}
                />
                <DatePicker
                    className='filter-input'
                    selected={dateTo}
                    onChange={(date) => handleDateFilter('date_to', date)}
                    selectsEnd
                    startDate={dateFrom}
                    endDate={dateTo}
                />
                
                <form className='filter-box' onSubmit={handleSubmitFilter}>
                    <br/>
                    <input
                        className='filter-input'
                        placeholder="Type Symbol Here ..."
                        type="text"
                        id="symbol"
                        name="symbol"
                        onChange={(e) => setSymbolFilter(e.target.value)}
                        value={symbolFilter}
                    />
                    <select className='filter-select' name="pattern">
                        <option value="" selected={patternFilter === null || patternFilter === '' ? 'selected' : ''}>Select Pattern</option>
                        {patterns.map((pattern) => 
                            <option value={pattern.pattern_slug} selected={patternFilter === pattern.pattern_slug}>{pattern.pattern_name}</option>
                        )}
                    </select>
                    <button type="submit">Filter</button>
                </form>
            </div>
            <div className="not-sidebar">
                <div className="inner">
                    <ToastContainer />

                    {/* ------------------------------------------- */}
                    <h1>Dashboard</h1>
                    <table className="table-a">
                        <thead>
                            <tr>
                                <th>Profit</th>
                                <th>Trades</th>
                                <th>Winning Trades</th>
                                <th>Losing Trades</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{ profitAllTime }</td>
                                <td>{ trades.length }</td>
                                <td>#</td>
                                <td>#</td>
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
                                <th className="rt">Pattern</th>
                            </tr>
                        </thead>
                        <tbody>
                            { tradesByDaySymbol && tradesByDaySymbol.slice(0).reverse().map((trades) => 
                            <>
                                <tr key={trades.id} className={trades.showDetails && 'open'}>
                                    <td>
                                        <Link to={`trades/${trades.symbol}/${trades.date}`}>{trades.symbol}</Link>
                                        <br />
                                        {trades.date}
                                    </td>
                                    <td className="rt">{trades.profit_loss.toFixed(2)}</td>
                                    <td onClick={()=>{showDetails(trades.id)}} className="rt">{trades.trades.length} Open</td>
                                    <td className="rt">
                                        <select onChange={(event) => handlePatternChange(event, trades.trades)}>
                                            <option value="">None</option>
                                            {patterns.map((pattern) => 
                                                <option value={pattern.id} selected={trades.pattern_id === pattern.id}>{pattern.pattern_name}</option>
                                            )}
                                        </select>
                                    </td>
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
                </div>
            </div> 
        </div>
    )
}
export default Dashboard2;