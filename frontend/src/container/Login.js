import React, { Component } from 'react'

import './Login.css'

class Login extends Component {
    constructor(props) {
    super(props);
    this.state = {};
    }

    RegisterTheForm = e => {
        console.log("RegisterTheForm");
        /* 按下Register之後 */
    }

    SubmitTheForm = e => {
        console.log("SubmitTheForm");
        /* 按下Submit之後 */
    }

    render() {
        return (
        <div className="form">
            <form>
                <h1>Login</h1>
                <div className="form-group row input">
                    <span className="glyphicon glyphicon-user"></span>
                    <input type="text" className="col-sm-10 form-control" id="date" placeholder="account"/>
                </div>
                <div className="form-group row input">
                    <span className="glyphicon glyphicon-lock"></span>
                    <input type="text" className="col-sm-10 form-control" id="time" placeholder="password"/>
                </div>
                <button className="btn btn-light" onClick={this.RegisterTheForm}>Register</button>
                <button className="btn btn-primary submit" onClick={this.SubmitTheForm}>Submit</button>
            </form>
        </div>
        );
    }
        
}

export default Login;