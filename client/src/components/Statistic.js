import axios from "axios"
import { useState } from "react";
const FormPattern = ({...props}) => {

    const [fields, setFields] = useState({
        symbol: 'TSLA',
        date_in: '2010-05-22',
        profit_loss: 25320.25
    });

    const submitForm = () => {
        axios.post("http://" + window.location.hostname + ":3001" + "/add_statistic", {...fields}).then((response) => {
            //setCompanyData(response.data);
        }).catch((error) => console.log("Company Profile Error " + error));
    }
    return (
        <>
        
            <div className="tableForm">
                <div>
                    <label>Statistic ID:</label>
                    <input value={props.statistic_id} />
                </div>
                <div>
                    <label>Symbol</label>
                    <input value={props.urlSymbol} />
                </div>
                <div>
                    <label>Pattern</label>
                    <input value={props.pattern_id} />
                </div>
                <div>
                    <label>Date In</label>
                    <input value={props.urlDate} />
                </div>
                <div>
                    <label>Date Out</label>
                    <input value={''} />
                </div>
                <div>
                    <label>Price In</label>
                    <input value={''} />
                </div>
                <div>
                    <label>Price Out</label>
                    <input value={''} />
                </div>
                { props.tradeData && 
                <div>
                    <label>Profit/Loss</label>
                    <input value={props.tradeData.profitLoss.toFixed(2)} />
                </div>}
                <div>
                    <label>W/L</label>
                    <input value={props.tradeData.profitLoss >= 0 ? 'W':'L'}  />
                </div>
                <div><button type="submit" onClick={submitForm}>+ Add Statistic</button></div>
            </div>

        </>
    )
}  

export default FormPattern