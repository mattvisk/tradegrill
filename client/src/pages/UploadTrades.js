import { NavLink, Link } from 'react-router-dom';
import UploadTrades from '../components/UploadTrades';

const UploadTradesPage = ({user}) => {
    
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
                <NavLink to="/upload-trades"><span class="material-icons">upload</span>Upload Trades</NavLink>
            </div>
            <div className="not-sidebar">
                <div className="inner">

                    <h1>Upload Trades</h1>
                    
                    <UploadTrades/>
                </div>
            </div> 
        </div>
    )
}
export default UploadTradesPage;