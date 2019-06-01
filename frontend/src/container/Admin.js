import React, { Component } from 'react'

import './Admin.css'

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

    render() {
        return (
        <div className="ButtonList">
            <h1>Welcome, Admin</h1>
            <h2>Keep an eye on your students!</h2>
            <div className="Buttons">
               <button type="button" className="btn-lg btn-outline-primary" onClick={this.Monitor}>Monitor</button>
                <button type="button" className="btn-lg btn-outline-primary" onClick={this.Request}>Request</button>
            </div>
            

        </div>
        );
    }
        
}

export default Admin;