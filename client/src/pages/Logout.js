import Axios from 'axios';


const Logout = ({setUser}) => {
    
    
    Axios.get("http://"+window.location.hostname+":3001"+"/logout").then((response)=> {   
        setUser(false);  
        
    });

    return null;
}
export default Logout;