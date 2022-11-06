import { NavLink, Link } from 'react-router-dom';
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
            { !user && 
                <div>
                    <Link to="/">Home</Link> 
                    <Link to="/pricing">Pricing</Link> 
                    <Link to="/register">Sign Up</Link> 
                    <Link to="/login">Login</Link> 
                </div>
            }   
            { user && 
                <div>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/dashboard-new">Overview</NavLink>
                </div>
            }
            { user && 
                <div className="right">
                    {/* { user && <><input value={searchValue} onKeyUp={onKeyUp} onChange={(e)=>{setSearchValue(e.target.value)}}></input><button type="submit" onClick={submitSearch}>Search</button></> } */}
                    <NavLink to="/profile"><FaUser />{user.username}</NavLink>
                    <NavLink to="/logout">Logout</NavLink>     
                </div>
            }
        </div>
    )
}
export default Header;