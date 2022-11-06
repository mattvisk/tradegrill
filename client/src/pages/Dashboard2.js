import { useState, useEffect } from 'react';
import Axios from 'axios';
import { format } from 'date-fns'
const Dashboard2 = ({user})=>{    
    

    let [tradeData, setTradeData ] = useState(false);

    useEffect(() => {
        getOverview();
    },[])

    let getOverview = ()=>{
        Axios.get("http://"+window.location.hostname+":3001"+"/get-trades").then((response)=> {
            setTradeData(response.data);
            console.log(response.data);
        });
    }
    
    return (
        <table className="table-a">
            <tr>
                <th>Symbol</th>
                <th>Date In</th>
                <th>Date Out</th>
                <th>Profit/Loss</th>
            </tr>
            { tradeData && tradeData.map((execution,i) => 
                <tr>
                    <td>{execution.symbol}</td>
                    <td>{execution.date_in_nice}</td>
                    <td>{execution.date_out_nice}</td>
                    <td>{execution.profit_loss.toFixed(2)}</td>
                </tr>
            )}
        </table>
    )
}
export default Dashboard2;