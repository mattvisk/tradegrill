import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { BrowserRouter as Redirect, useHistory } from 'react-router-dom';



const Header = ({user}) => {
    const history = useHistory();
    let [searchValue, setSearchValue] = useState()

    const submitSearch = () => {
        console.log(searchValue);
        history.push("/trades/"+searchValue+"/04-08-2021");
    }

    const onKeyUp = (e) => {
       if (e.code === 'Enter') submitSearch(); 
    }
    return (
        <div className="header">
            <Link to="/" className='logo'>
                TradeGrill
            </Link>
            <div>
            { !user && 
                <>
                <Link to="/">Home</Link> 
                <Link to="/pricing">Pricing</Link> 
                <Link to="/register">Sign Up</Link> 
                <Link to="/login">Login</Link> 
                </>
            }
            </div>            
                { user && <Link to="/dashboard">Dashboard</Link> }
                { user && <Link to="/statistics">Statistics</Link> }
                { user && <><input value={searchValue} onKeyUp={onKeyUp} onChange={(e)=>{setSearchValue(e.target.value)}}></input><button type="submit" onClick={submitSearch}>Search</button></> }
            <div className="right">
                { user && <Link to="/profile"><FaUser />{user.username}</Link> }
                { user && <Link to="/logout">Logout</Link> }             
            </div>
        </div>
    )
}
export default Header;