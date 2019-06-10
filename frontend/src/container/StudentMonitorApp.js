import React, { Component } from 'react'
import { Switch, BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import Login from './Login';
import Admin from './Admin';
import Student from './Student';
import Request from './Request';
import Monitor from './Monitor';

class StudentMonitorApp extends Component {
    constructor(props) {
    super(props);
    }

    render() {
        return (
        <div className="StudentMonitorApp">
            <Router>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/student" component={Student} />
                    <Route path="/admin" component={Admin} />
                    <Route path="/request" component={Request} />
                    <Route path="/monitor" component={Monitor} />
                </Switch>
            </Router>
        </div>
        );
    }
        
}

export default StudentMonitorApp;