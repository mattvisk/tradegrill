import { useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
Axios.defaults.withCredentials = true;

const Register = () => {

    const [emailReg, setEmailReg] = useState('')
    const [usernameReg, setUsernameReg] = useState('')
    const [passwordReg, setPasswordReg] = useState('')
  
    const register = () => {
      Axios.post('http://tradegrill.com:3001/register', {
        email: emailReg,
        username: usernameReg,
        password: passwordReg
      }).then((response) => {
        console.log('registration worked, but we dont tell you if anything good or bad happened.')
      })
    }

    return (
        <>
          <div className="form">
            <h1>Sign Up</h1>
            <label>Email:</label>
            <input type="text" onChange={(e)=>{setEmailReg(e.target.value)}} />
            <label>Username:</label>
            <input type="text" onChange={(e)=>{setUsernameReg(e.target.value)}} />
            <label>Password:</label>
            <input type="text" onChange={(e)=>{setPasswordReg(e.target.value)}} />
            <button onClick={register}>Sign Up</button>
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </>
    )
}

export default Register;