import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Trade from '../pages/Trade';
import CurrencyFormat from 'react-currency-format';
const DashboardRow = (day) => {

    const [toggle, setToggle] = useState(false)


    return (
        <>
            
            {/* Recent Trades
            ----------------------------------------------- */}
            <tr>
                <td>{day.data.date}</td>
                <td>
                    <b>{day.data.symbols.map((e,i)=>
                        <Link key={i} to={'/trades/'+e+'/'+day.data.date}>{e}</Link>)}
                    </b>
                </td>
                
                <td><a onClick={() => {setToggle(!toggle)}}>Quick Chart</a></td>
                <td className={day.data.profit >= 0 ? 'green':'red'}>{<CurrencyFormat value={day.data.profit.toFixed(2)} displayType={'text'} thousandSeparator={true} prefix={'$'} />}</td>
            </tr> 
            
            
            {/* Show chart
            ---------------------------- */}
            <tr className={!toggle ? "chart-preview" : "chart-preview active"}>
                {toggle && <td colspan="4"><Trade symbol={day.data.symbols[0]} dateIn={day.data.date} days={0} /></td> }
            </tr>
            

        </>
    )
}

export default DashboardRow;