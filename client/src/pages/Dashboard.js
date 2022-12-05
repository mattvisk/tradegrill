import { NavLink, Link, useHistory  } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import UploadTrades from '../components/UploadTrades';
import Format from 'date-fns/format';
import { BarChart, Area, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import Select from 'react-select';
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
    const [sideFilter, setSideFilter ] = useState(null);
    const [patterns, setPatterns ] = useState([]);
    const [scrollY, setScrollY] = useState();
    let [trades, setTrades ] = useState([]);
    let [tradesByDay, setTradesByDay ] = useState([]);
    let [tradesByDaySymbol, setTradesByDaySymbol ] = useState([]);
    let [profitAllTime, setProfitAllTime] = useState(0);
    let [dateFrom, setDateFrom] = useState(new Date('01-01-2022'));
    let [dateTo, setDateTo] = useState(new Date());
    const [mousePos, setMousePos] = useState({});


    /* Get Mouse Coordinates
    -------------------------------*/
    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePos({ x: event.clientX, y: event.clientY });
            console.log(event.clicentY);
        };
    
        window.addEventListener('mousemove', handleMouseMove);
    
        return () => {
          window.removeEventListener(
            'mousemove',
            handleMouseMove
          );
        };
      }, []);








    const getPatterns = async () => {
        const { data } = await Axios.get("http://"+window.location.hostname+":3001/patterns")
        
        const tempPattern = []
        
        for (const pattern of data) {
            tempPattern.push({
                id: pattern.id,
                value: pattern.pattern_slug,
                label: pattern.pattern_name
            })
        }
        setPatterns(tempPattern)
    }

    // Http Request: Get Trade Data
    const getData = ()=>{

        let search = window.location.search
        let paramsUrl = new URLSearchParams(search)
        const symbol = paramsUrl.get('symbol')
        const pattern = paramsUrl.get('pattern')
        const side = paramsUrl.get('side')

        setSymbolFilter(symbol)
        setPatternFilter(pattern)
        setSideFilter(side)

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

        if (side && side !== '') {
            params.side = side
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
            console.log('query', query)
            history.push({
                pathname: '/dashboard',
                search: query
            })
        }

        getData()
    }

    const handlePatternFilter = (pattern) => {
        const data = []
        pattern.map((obj) => data.push(obj.value))
        setPatternFilter(data.join(','))
    }

    const handleDateFilter = (type, value) => {
        if (type === 'date_from') {
            setDateFrom(value)
        } else {
            setDateTo(value)
        }
    }

    const getDefaultValuePatternFilter = () => {
        const temp = []

        if (!patternFilter) {
            return temp
        }

        const filter = patternFilter.split(',')

        patterns.map((obj) => {
            if (filter.includes(obj.value)) {
                temp.push({value: obj.value, label: obj.label})
            }
        })
        console.log('temp', temp)
        return temp
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
                <div className="filters container">

                    <form className=' lizard-form' onSubmit={handleSubmitFilter}>
                        <label>Date</label>
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
                        <label>Symbol</label>
                        <input class="uppercase"
                            placeholder="Type Symbol Here ..."
                            type="text"
                            id="symbol"
                            name="symbol"
                            onChange={(e) => setSymbolFilter(e.target.value)}
                            value={symbolFilter}
                        />
                        <label>Type</label>
                        <select name="side">
                            <option value="" selected={sideFilter === null || sideFilter === '' ? 'selected' : ''}>Select Side</option>
                            <option value="SS" selected={sideFilter === "SS"}>Short</option>
                            <option value="B" selected={sideFilter === "B"}>Long</option>
                        </select>

                        <hr></hr>

                        {/* This is awesome, but let's just use checkboxes for now --- keep this here though commented out */}
                        <Select
                            onChange={(pattern) => handlePatternFilter(pattern)}
                            value={getDefaultValuePatternFilter()}
                            name="pattern"
                            className='mb-1'
                            isMulti
                            options={patterns}
                            styles={{
                                control: base => ({
                                    ...base,
                                    color: "black"
                                }),
                                menu: base => ({
                                    ...base,
                                    color: "black"
                                })
                            }}
                        />
                        <button type="submit" className='full-width'>Filter</button>
                    </form>
                </div>
            </div>
            <div className="not-sidebar">
                <div className="inner">
                    <ToastContainer />
                    {/* -------------------------------------------
                    <h1>Dashboard</h1>

                    <div>
                    The mouse is at position{' '}
                    <b>
                        ({mousePos.x}, {mousePos.y})
                    </b>
                    </div> */}
                    

                    <table className="viper-textbox">
                        <section>
                            <span>Profit</span>
                            <p>{ profitAllTime }</p>
                        </section>
                        <section>
                            <span>Trades</span>
                            <p>{ trades.length }</p>
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
                    <table className="table-a">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th className="rt">Profit/Loss</th>
                                <th className="rt">Trades</th>
                                <th className="rt">Pattern</th>
                                <th className="rt">Float</th>
                                <th className="rt">Market</th>
                            </tr>
                        </thead>
                        <tbody>
                            { tradesByDaySymbol && tradesByDaySymbol.slice(0).reverse().map((trades) => 
                            <>
                                <tr key={trades.id} className={trades.showDetails && 'open'}>
                                    <td>
                                        <Link to={`trades/${trades.symbol}/${trades.date}/8`}>{trades.symbol}</Link>
                                        <br />
                                        {trades.date}
                                    </td>
                                    <td className={trades.profit_loss >= 0 ? 'green':'red'}>{trades.profit_loss.toFixed(2)}</td>
                                    <td onClick={()=>{showDetails(trades.id)}} className="rt">{trades.trades.length}</td>
                                    <td>
                                        <select onChange={(event) => handlePatternChange(event, trades.trades)}>
                                            <option value="">None</option>
                                            {patterns.map((pattern) => 
                                                <option value={pattern.id} selected={trades.pattern_id === pattern.id}>{pattern.label}</option>
                                            )}
                                        </select>
                                        <input placeholder="Float" />
                                        <input placeholder="Market Cap" />
                                    </td>
                                    <td>
                                        <input placeholder="Float" />
                                    </td>
                                    <td>
                                        <input placeholder="Market Cap" />
                                    </td>
                                </tr>
                                { trades.showDetails === true && trades.trades.map(trade => 
                                    <tr key={trade.id} class="child">
                                        <td>{trade.time_in_nice} - {trade.time_out_nice}</td>
                                        <td className={trade.profit_loss >= 0 ? 'green':'red'}>{trade.profit_loss.toFixed(2)}</td>
                                        <td>-</td>
                                        <td className="rt">{trade.side == 'SS' ? 'Short':'Long'}</td>
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