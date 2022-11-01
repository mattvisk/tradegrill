import Axios from "axios";
import { useState, useEffect } from "react";





const StatisticForm = (stats) => {
  return (
    <form div className>
      <input></input>
      <input></input>
      <input></input>
      <input></input>
      <input></input>
      <input></input>
    </form>
  )
}






const Statistics = () => {

    const [stats, setStats] = useState(false);
    const [patternsArr, setPatternsArr] = useState([]);

    useEffect(() => {
        Axios
        .get("http://" + window.location.hostname + ":3001" + "/statistics")
        .then((response) => {setStats(response.data)})
        .catch((error) => console.log("loadChart() Error " + error));
        
        Axios
        .get("http://" + window.location.hostname + ":3001" + "/patterns")
        .then((response) => {setPatternsArr(response.data)})
        .catch((error) => console.log("loadChart() Error " + error));
    }, []);




    // Working Filter
    // console.log(patternsArr.filter(pattern => pattern.id === id));
    
    // Working Find
    // patternsArr.find(p => p.id === id).pattern_name


    const filterResults = (id) => {

        // setStats(stats.filter(stat => stat.pattern_id === id))
        

    }




    return (
        <div> 

            {/* Patterns */}
            { patternsArr.map(pattern => <button onClick={filterResults(pattern.id)}>{pattern.pattern_name}</button>)}




            <table className="stats-table">
                <tr>
                    <th>Date In</th>
                    <th>Symbol</th>
                    <th>Float</th>
                    <th>Market Cap</th>
                    <th>Pattern</th>
                    <th>Profit/Loss</th>
                    <th>W/L</th>
                </tr>
                {(stats && patternsArr) && stats.map((stat, i)=>{
                    return (
                        <tr key={i}>
                        <td>{stat.date_in}</td>
                            <td>{stat.symbol}</td> 
                            <td>{stat.float}</td> 
                            <td>{stat.market_cap}</td> 
                            <td>{patternsArr.find(pattern => pattern.id === stat.pattern_id).pattern_name}</td>
                            <td>{stat.profit_loss}</td>
                            <td>{stat.profit_loss > 0 ? 'W' : 'L'}</td>
                        </tr>
                    )
                })}
            </table>
            <StatisticForm />
        </div>
    )
}
export default Statistics;

