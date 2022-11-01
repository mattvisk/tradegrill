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
const Dashboard = ({user})=>{    
    let [tradeData, setTradeData ] = useState(false);
    let [loading, setLoading ]= useState(true);
    let [startDate, setStartDate] = useState(new Date('2021-01-01'));
    let [endDate, setEndDate] = useState(new Date());
    let [showCustom, setShowCustom] = useState(false);

    let changeDateAll = ()=>{
        setStartDate(new Date('2020-01-01'));
        setEndDate(new Date());
        setShowCustom(false);
    }
    let changeDate2020 = ()=>{
        setStartDate(new Date('2020-01-02'));
        setEndDate(new Date('2021-01-01'));
        setShowCustom(false);
    }
    let changeDate2021 = ()=>{
        setStartDate(new Date('2021-01-02'));
        setEndDate(new Date('2022-01-01'));
        setShowCustom(false);
    }

    let changeDate2022 = ()=>{
        setStartDate(new Date('2022-01-02'));
        setEndDate(new Date('2023-01-01'));
        setShowCustom(false);
    }

    let changeDateCustom = ()=> {setShowCustom(!showCustom)}
    
    /* Get Dashboard Trade Data
    --------------------------------------*/
    useEffect(() => {
        getOverview();
    },[startDate, endDate])


    let getOverview = ()=>{
        setLoading(true);
        Axios.post("http://"+window.location.hostname+":3001"+"/dashboardGet", {
                'startDate': Format(startDate, 'yyyy-MM-dd'), 
                'endDate': Format(endDate, 'yyyy-MM-dd')
            })
            .then((response)=> {
            setTradeData(response.data) 
            setLoading(false);
        });
    }
    
    /* Dashboard
    --------------------------------------*/
    return (
        <>
            <div className="dashboard-header">                
                <div>
                    <a onClick={changeDateAll}>All Time</a>
                    <a onClick={changeDate2020}>2020</a>
                    <a onClick={changeDate2021}>2021</a>
                    <a onClick={changeDate2022}>2022</a>
                    <a onClick={changeDateCustom}>Custom</a>
                    { showCustom && <>
                    <DatePicker className="input" selected={startDate} onChange={(date) => setStartDate(date)} />
                    <DatePicker className="input" selected={endDate} onChange={(date) => setEndDate(date)} />
                    </> }
                </div>
                <div>
                    <UploadTrades user={user} updateData={getOverview} />
                    { loading && <FaSpinner className="spinner" /> }
                </div>
            </div>

            { tradeData.success &&
                <div>
                    <ProfitLossCandles data={tradeData} /> 
                    <TableTrades data={tradeData} /> 
                </div>
            }
        </>
    )
}
export default Dashboard;