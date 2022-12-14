import { useContext } from 'react';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { LoginContext } from '../Helper/Context';


const PrivateRoute = ({component: Component, ...rest}) => {

    const {loginStatus} = useContext(LoginContext);
    return (

        // Show the component only when the user is logged in
        // Otherwise, redirect the user to /signin page
        <Route {...rest} render={props => (
            loginStatus ?
                <Component {...props} />
            : <Redirect to="/login" />
        )} />
    );
};

export default PrivateRoute;