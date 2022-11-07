import { useState, useEffect } from "react";
import Axios from "axios";
import Register from "./components/Register";
import Login from "./pages/Login";
import Header from "./components/Header";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import Trade from "./components/Trade";
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
  // User State
  let [user, setUser] = useState();

  // Authenticate
  useEffect(() => {
    const isLoggedIn = () => {
      // Axios.get("http://tradegrill.com:3001/isLoggedIn").then((response)=> {
      Axios.get(
        "http://" + window.location.hostname + ":3001/isLoggedIn"
      ).then((response) => {
        if (response.data.username) {
          setUser(response.data);
        } else {
          setUser(false);
        }
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
          <Route exact path="/login">
            {!user ? (
              <Login user={user} setUser={setUser} />
            ) : (
              <Redirect to={afterLoginPage} />
            )}
          </Route>
          <Route exact path="/dashboard">
            {user ? <Dashboard user={user} /> : <LoginRedirect />}
          </Route>
          <Route exact path="/all-trades">
            <Dashboard2 user={user} />
          </Route>
          <Route exact path="/trades/:urlSymbol/:urlDate/:urlDays">
            <Trade user={user} />
          </Route>
          <Route exact path="/trades/:urlSymbol/:urlDate">
            <Trade user={user} />
          </Route>
          <Route exact path="/statistics">
            {" "}
            {user ? <Statistics user={user} /> : <LoginRedirect />}{" "}
          </Route>
          <Route exact path="/profile">
            {" "}
            {user ? <Profile user={user} /> : <LoginRedirect />}{" "}
          </Route>
          <Route exact path="/logout">
            {" "}
            {user ? (
              <Logout user={user} setUser={setUser} />
            ) : (
              <LoginRedirect />
            )}{" "}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
