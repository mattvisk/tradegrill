import { Link  } from 'react-router-dom';

const TableChart = ({tradesByDaySymbol, patterns, showDetails, handlePatternChange}) => {
    return (
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
                        <option value={pattern.id} selected={trades.pattern_id === pattern.id}>{pattern.label}</option>
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
    )
}
export default TableChart;