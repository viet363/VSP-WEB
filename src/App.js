import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/layout/Layout";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/dashboard" component={Layout} />
      </Switch>
    </Router>
  );
};

export default App;
