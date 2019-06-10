import React, { Component } from 'react'

// import './Admin.css'

class Admin extends Component {
    constructor(props) {
    super(props);
    this.state = {};
    }

    Monitor = e => {
        console.log("go to Monitor Page");
        /* 前往monitor頁面 */
    }

    Request = e => {
        console.log("go to Request Page");
        /* 前往request頁面 */
    }

    Logout = e => {
        console.log("admin logout");
        /* 前往request頁面 */
    }

    render() {
        return (
        <div className="ButtonList">
            <h1 className="h1_admin">Welcome, Admin</h1>
            <h2>Keep an eye on your students!</h2>
            <div className="Buttons">
              <button type="button" className="btn-lg btn-outline-primary button_admin" onClick={this.Monitor}>Monitor</button>
              <button type="button" className="btn-lg btn-outline-primary button_admin" onClick={this.Request}>Request</button>
              <button type="button" className="btn-lg btn-outline-primary button_admin" onClick={this.Logout}>Logout</button>
            </div>
            

        </div>
        );
    }
        
}

export default Admin;