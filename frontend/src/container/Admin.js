import React, { Component } from 'react'
import { Link } from "react-router-dom";
// import './Admin.css'

class Admin extends Component {
    constructor(props) {
    super(props);
    this.state = {};
    }

    

    

    Logout = e => {
        console.log("admin logout");
        fetch('/api/logout', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
            .then((res) => (res.json(res)))
            .then((data) => {
                if (data.logout === 'success') {
                    // logout success
                    window.location = `http://10.5.4.71:3000`;
                }
            })
    }

    render() {
        return (
        <div className="ButtonList">
            <h1 className="h1_admin">Welcome, Admin</h1>
            <h2>Keep an eye on your students!</h2>
            <div className="Buttons">
            <Link to="/monitor">
              <button type="button" className="btn-lg btn-outline-primary button_admin" onClick={this.props.Monitor}>Monitor</button>
            </Link>
            <Link to="/request">
              <button type="button" className="btn-lg btn-outline-primary button_admin" onClick={this.props.getRequest}>Request</button>
            </Link>
              <button type="button" className="btn-lg btn-outline-primary button_admin" onClick={this.Logout}>Logout</button>
            </div>
        </div>
        );
    }
        
}

export default Admin;