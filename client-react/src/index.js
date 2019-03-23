import React from 'react';
import ReactDOM from 'react-dom';

import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";

import Nav from './components/Nav';
import Upload from './components/Upload';
import Browse from './components/Browse';

import './bootstrap4-wizardry.css';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <Router>
        <Nav/>

        <Switch>
            <Route exact path="/upload" component={Upload}/>
            <Route exact path="/browse" component={Browse}/>
            <Route render={() => <Redirect to="/upload"/>}/>
        </Switch>

    </Router>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
