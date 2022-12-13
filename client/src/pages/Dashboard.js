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
    const history = useHistory();
    const [symbolFilter, setSymbolFilter ] = useState(null);
    const [patternFilter, setPatternFilter ] = useState(null);
    const [sideFilter, setSideFilter ] = useState(null);
    const [patterns, setPatterns ] = useState([]);
    const [selectedPatterns, setSelected] = useState([0,1,2,3,4,5,6,7]);
    let [trades, setTrades ] = useState([]);
    let [tradesByDay, setTradesByDay ] = useState([]);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState([]);
    let [profitAllTime, setProfitAllTime] = useState(0);
    let [dateFrom, setDateFrom] = useState(new Date('01-01-2022'));
    let [dateTo, setDateTo] = useState(new Date());

    /* Run Once
    ---------------------------*/
    useEffect(() => {
        getData()
        getPatterns()
    }, [selectedPatterns])


    /* Get Trade Data
    ---------------------------*/
    const getData = () => {
        let search = window.location.search
        let paramsUrl = new URLSearchParams(search)
        const symbol = paramsUrl.get('symbol')
        // const patterns = paramsUrl.get('patterns')
        const side = paramsUrl.get('side')
        setSymbolFilter(symbol)
        setSideFilter(side)
        const params = {
            'dateFrom': Format(dateFrom, 'yyyy-MM-dd'), 
            'dateTo': Format(dateTo, 'yyyy-MM-dd'),
            'patterns': selectedPatterns
        }
        if (symbol && symbol !== '') params.symbol = symbol;
        if (side && side !== '') params.side = side;
        Axios.post("http://"+window.location.hostname+":3001/get-trades", params).then((response)=> {
            setTrades(response.data.trades);
            setTradesByDay(response.data.tradesByDay);
            setTradesByDaySymbol(response.data.tradesByDaySymbol);
            setProfitAllTime(response.data.profitAllTime);
            // toast.success('Done!', {
            //     position: "top-right",
            //     autoClose: 1000,
            //     hideProgressBar: true,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     draggable: true,
            //     theme: "colored",
            // });
        });
    }

    /* Delete Trades
    ---------------------------*/
    const deleteTrades = ()=>{
        Axios.get("http://"+window.location.hostname+":3001"+"/deleteTrades")
            .then((response)=> {
                getData();
            }
        );
    }

    /* Trade Data Filters
    ---------------------------*/
    const handleSubmitFilter = (event) => {
        event.preventDefault();        
        const symbol = event.target.symbol.value
        const side = event.target.side.value
        const filters = [{
            type: 'symbol',
            value: symbol
        }, {
            type: 'pattern',
            value: patternFilter
        }, {
            type: 'side',
            value: side
        }]
        if (symbol === '' && patternFilter === '' && side === '') {
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

    /* Get Date Filter
    ---------------------------*/
    const handleDateFilter = (type, value) => {
        if (type === 'date_from') {
            setDateFrom(value)
        } else {
            setDateTo(value)
        }
    }

    /* Assign Pattern
    ---------------------------*/
    const assignPattern = async (event, trades) => {
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

    /* Get Patterns
    ---------------------------*/
    const getPatterns = () => { 
        Axios.get("http://"+window.location.hostname+":3001/patterns").then((response)=> {
            setPatterns(response.data);
        });
    }

    /* Checkboxes
    -----------------------------*/
    function handleCheckbox(e) {
        if (selectedPatterns.includes(+e.target.value)) {
            setSelected(selectedPatterns.filter(option => option !== +e.target.value));
        } else {
            setSelected([...selectedPatterns, +e.target.value]);
        }
        console.log(selectedPatterns);
    }
    function checkAll() {
        if (selectedPatterns.length){
            // Uncheck All
            setSelected([]);
        } else {
            // Check All
            setSelected(patterns.map(pattern => pattern.id))
        }
    }
    const clickCheckbox = (id) => {
        setSelected([id]);
    }



    return (
        <div className="with-sidebar">
            <div class="sidebar">                
                {/* --------------------------- Sidebar Nav ----------------------------------- 
                <Link to="/" className='logo'> TradeGrill</Link>
                <NavLink to="/dashboard"><span class="material-icons">dashboard</span>Dashboard</NavLink>
                <NavLink to="/calendar"><span class="material-icons">calendar_month</span>Calendar</NavLink>
                <NavLink to="/all-trades"><span class="material-icons">bar_chart</span>Trades</NavLink>
                <NavLink to="/journal"><span class="material-icons">school</span>Journal</NavLink>
                <hr />
                */}  
                {/* ------------------ Upload / Delete ------------------ */}
                <button><span class="material-icons">upload</span>Upload Trades <UploadTrades user={user} callback={getData} /></button>
                {/* <button onClick={deleteTrades}><span class="material-icons">delete</span>Delete Trades</button>             */}
                {/* ----------------------------------- Filters ----------------------------------- */}
                <form className='lizard-form form-secondary' onSubmit={handleSubmitFilter}>
                    <hr />
                    <DatePicker
                        selected={dateFrom}
                        onChange={(date) => handleDateFilter('date_from', date)}
                        selectsStart
                        startDate={dateFrom}
                        endDate={dateTo}
                    />
                    <DatePicker
                        selected={dateTo}
                        onChange={(date) => handleDateFilter('date_to', date)}
                        selectsEnd
                        startDate={dateFrom}
                        endDate={dateTo}
                    />
                    <select name="side">
                        <option value="" selected={sideFilter === null || sideFilter === '' ? 'selected' : ''}>All</option>
                        <option value="SS" selected={sideFilter === "SS"}>Short</option>
                        <option value="B" selected={sideFilter === "B"}>Long</option>
                    </select>
                    <input class="uppercase"
                        type="text"
                        id="symbol"
                        name="symbol"
                        placeholder='Symbol'
                        onChange={(e) => setSymbolFilter(e.target.value)}
                        value={symbolFilter}
                    />

                    <hr />

                    {patterns.map(pattern => (
                        <div className="checkbox">
                            <label onClick={()=>clickCheckbox(pattern.id)} key={pattern.id}>{pattern.pattern_name}</label>
                            <input
                                type="checkbox"
                                value={pattern.id}
                                onChange={handleCheckbox}
                                checked={selectedPatterns.includes(pattern.id)}
                            />
                        </div>
                    ))}
                    { patterns && <span onClick={checkAll}>{selectedPatterns.length ? 'Clear' : 'Check All' }</span> }

                    <button type="submit" className="btn">Search</button>
                </form>
            </div>
            {/* --------------------------- Not Sidebar ----------------------------------- */}
            <div className="not-sidebar">
                <div className="inner">
                    <ToastContainer />
                    <table className="viper-textbox">
                        <section>
                            <span>Profit</span>
                            <p>{ profitAllTime }</p>
                        </section>
                        <section>
                            <span>Stats</span>
                            <p>Days { tradesByDay.length }</p>
                            <p>Trades { trades.length }</p>
                        </section>
                        <section>
                            <span>Winning Days</span>
                            <p>{ tradesByDay.filter(trade => trade.profit_loss > 0).length }</p>
                            <p>{ trades.filter(trade => trade.profit_loss > 0).length }</p>
                        </section>
                        <section>
                            <span>Losing Days</span>
                            <p>{ tradesByDay.filter(trade => trade.profit_loss < 0).length }</p>
                            <p>{ trades.filter(trade => trade.profit_loss < 0).length }</p>
                        </section>
                        <section>
                            <span>Win %</span>
                            <p>{ Math.round(tradesByDay.filter(trade => trade.profit_loss > 0).length / tradesByDay.length * 100)}%</p>
                            <p>{ Math.round(trades.filter(trade => trade.profit_loss > 0).length / trades.length * 100)}%</p>
                        </section>
                    </table>
                    
                    {/* ------------------------------------------- */}
                    <h3>Running P&L</h3>
                    <div className="new-chart"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={tradesByDay} margin={margin} fontSize={12}>
                                {/* <XAxis name="date" /> */}
                                <CartesianGrid strokeDasharray="1" stroke="rgba(255,255,255,.08)" />
                                <YAxis tickCount={10}/>
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
                                <YAxis tickCount={10} />
                                <Tooltip />
                                <CartesianGrid strokeDasharray="1" stroke="rgba(255,255,255,.08)" />
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
                    <table className="table-gorilla form-secondary">
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
                                    <td onClick={()=>{showDetails(trades.id)}} >
                                        <Link to={`trades/${trades.symbol}/${trades.date}/8`}>{trades.symbol}</Link>
                                        <br />
                                        {trades.date}
                                    </td>
                                    <td onClick={()=>{showDetails(trades.id)}}  className={trades.profit_loss >= 0 ? 'green':'red'}>{trades.profit_loss.toFixed(2)}</td>
                                    <td onClick={()=>{showDetails(trades.id)}} className="rt">{trades.trades.length}</td>
                                    <td>
                                        { trades.showDetails && <label>Pattern</label> }
                                        <select onChange={(event) => assignPattern(event, trades.trades)}>
                                            <option value=""></option>
                                            {patterns.map((pattern) => 
                                                <option value={pattern.id} selected={trades.pattern_id === pattern.id}>{pattern.pattern_name}</option>
                                            )}
                                        </select>
                                        { trades.showDetails &&
                                            <>
                                                <label>Float (M)</label>
                                                <input placeholder="Float" />
                                                <label>Market Cap (M)</label>
                                                <input placeholder="34" />
                                                <label>Day Volume (M)</label>
                                                <input placeholder="210" />
                                                <label>Premarket Volume (M)</label>
                                                <input placeholder="18" />
                                            </>
                                        }
                                    </td>
                                </tr>
                                { trades.showDetails === true && trades.trades.map(trade => 
                                    <>
                                        <tr key={trade.id} class="child">
                                            <td>{trade.time_in_nice} - {trade.time_out_nice}</td>
                                            <td className={trade.profit_loss >= 0 ? 'green':'red'}>{trade.profit_loss.toFixed(2)}</td>
                                            <td>-</td>
                                            <td className="rt">{trade.side == 'SS' ? 'Short':'Long'}</td>
                                        </tr> 
                                    </>
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