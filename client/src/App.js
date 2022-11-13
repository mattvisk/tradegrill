import { useState, useEffect } from "react";
import Axios from "axios";
import Register from "./components/Register";
import Login from "./pages/Login";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import DashboardOld from "./pages/Dashboard-old";
import Dashboard from "./pages/Dashboard";
import Trade from "./pages/Trade";
import Logout from "./pages/Logout";
import Statistics from "./pages/Statistics";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import "./css/Tokens.scss";
import "./css/App.scss";
function App() {
  let [user, setUser] = useState();
  useEffect(() => {
    const isLoggedIn = () => {
      Axios.get("http://" + window.location.hostname + ":3001/isLoggedIn").then((response) => {
        if (response.data.username) setUser(response.data)
          else setUser(false)
      });
    };
    isLoggedIn();
  }, []);

  const afterLoginPage = "/dashboard";
  const LoginRedirect = () => {
    return <Redirect to="/login" />;
  };

  return (
    <Router>
      <Header user={user} setUser={setUser} />
      <div className="container">
        <Switch>
          <Route exact path="/" />
          <Route exact path="/register" component={Register} />
          <Route exact path="/login">{!user ? (<Login user={user} setUser={setUser} />) : (<Redirect to={afterLoginPage} />)}</Route>
          <Route exact path="/dashboard-old">{user ? <DashboardOld user={user} /> : <LoginRedirect />}</Route>
          <Route exact path="/dashboard"><Dashboard user={user} /></Route>
          <Route exact path="/trades/:urlSymbol/:urlDate/:urlDays"><Trade user={user} /></Route>
          <Route exact path="/trades/:urlSymbol/:urlDate"><Trade user={user} /></Route>
          <Route exact path="/statistics">{" "}{user ? <Statistics user={user} /> : <LoginRedirect />}{" "}</Route>
          <Route exact path="/profile">{" "}{user ? <Profile user={user} /> : <LoginRedirect />}{" "}</Route>
          <Route exact path="/logout">{" "}{user ? (<Logout user={user} setUser={setUser} />) : (<LoginRedirect />)}{" "}</Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
