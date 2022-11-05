import { useState, useEffect } from 'react';
import Axios from 'axios';
import UploadTrades from '../components/UploadTrades';
import { FaSpinner} from 'react-icons/fa';
import DatePicker from "react-datepicker";
import Format from 'date-fns/format';
import PLChart from '../components/PLChart';
import ProfitLossCandles from '../components/Charts/ProfitLossCandles/ProfitLossCandles';
import TableTrades from '../components/Tables/TableTrades';
import Trades from '../components/Trade2';
import "react-datepicker/dist/react-datepicker.css";
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
        <table>
            { tradeData && tradeData.map((execution,i) => 
                <tr>
                    <td>{execution.trade_id}</td>
                    <td>{execution.symbol}</td>
                    <td>{execution.profit_loss}</td>
                </tr>
            )}
        </table>
    )
}
export default Dashboard2;