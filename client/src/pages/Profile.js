import '../css/Profile.scss';
import axios from 'axios';

const Profile = ({user}) => {

    const deleteTrades = ()=>{
        axios.get("http://"+window.location.hostname+":3001"+"/deleteTrades").then((response)=> {
            
        });
    }

    return (
        <div className="profile">
            <div>
                <div className="avatar"></div>
            </div>
            <div>
                <h1>Profile</h1>
                <>
                    <p>{user.first_name} {user.last_name}</p>
                    <p>{user.username}</p>
                    <button onClick={deleteTrades}>Delete Trades</button>
                </>
            </div>
        </div>

    )
}
export default Profile;