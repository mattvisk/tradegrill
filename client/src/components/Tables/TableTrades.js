import DashboardRow from '../DashboardRow';
const TableTrades = ({data})=>{
    return (
            <div className='container center'>
                <h2 className="center headline">P/L: ${data.totalGrossProceeds.toFixed(2)}</h2>
                <div className="mv-table">
                    <table className="table-main">
                        <thead>
                            <tr>
                                <th>Symbols</th>
                                <th>Date</th>
                                {/* <th>Executions</th> */}
                                <th>P/L</th>
                                <th>Pattern</th>
                                {/* <td>Running P/L</td> */}
                            </tr>
                        </thead>
                        <tbody>
                        {
                            data.daySummaryArr.map((day,i) => <DashboardRow data={day} key={i} />             
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
    )
}
export default TableTrades;