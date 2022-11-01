import { useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
Axios.defaults.withCredentials = true;
const Login = ({setUser}) => {

    const [usernameReg, setUsernameReg] = useState()
    const [passwordReg, setPasswordReg] = useState()
    const [errorMessage, setErrorMessage] = useState()

    const submitLogin = () => {
      Axios.post("http://"+window.location.hostname+":3001"+'/login', {
        username: usernameReg,
        password: passwordReg
      }).then((response) => {
        if(response.data.username){
          setUser(response.data)
          setErrorMessage(false);
        } else {
          
          setErrorMessage(response.data.message);
        }
      })
    }
    const onKeyUp = (e) => {
      if (e.code === 'Enter') submitLogin(); 
    }


    return (
        <>
        <div className="form">
          <h1>Login</h1>
          <label>Username:</label>
          <input type="text" name="username" onKeyUp={onKeyUp} onChange={(e)=>{setUsernameReg(e.target.value)}} />
          <label>Password:</label>
          <input type="password" name="password" onKeyUp={onKeyUp}  onChange={(e)=>{setPasswordReg(e.target.value)}} />
          <button type="submit" onClick={submitLogin}>Login</button>
          { errorMessage && <p className="red">{errorMessage}</p> }
          <p>Don't have an account? <Link to="/register">Sign up</Link></p>
        </div>
        </> 
    )
}

export default Login;