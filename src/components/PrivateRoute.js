import React from 'react';
import {Redirect, Route} from 'react-router-dom';

const PrivateRoute = ({component: Component, ...rest }) => {
  const isLoggedIn = true;
  return (
    <Route
      {...rest}
      render = { props => isLoggedIn ? (<Component {...props} />):(<Redirect to={{ pathname: "/login", state: {form: props.location}}}/>) }
    />
  )
}


export default PrivateRoute;
