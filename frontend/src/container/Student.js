import React, { Component } from 'react'

// import './Student.css'

class Student extends Component {
    constructor(props) {
    super(props);
    this.state = {speed: 18};
    }

    

    Logout = e => {
        console.log("student logout");
        /* 前往request頁面 */
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
                    window.location = `http://10.5.0.231:3000`;
                }
            })
    }

    render() {
        return (
        <div className="student_square">
            <h1>Welcome, Student</h1>
            <div className="Speed">
                <p>The Internet Speed is :</p>
                <p className="num">{this.state.speed} Mbps</p>
            </div>
            <div>
                <input type="text" className="form-control request" id="request" placeholder="send request IP..." />
                <button type="button" className="btn-lg btn-light" onClick={this.props.request}>Request</button>
            </div>
            <button type="button" className="btn-lg btn-outline-primary logout" onClick={this.Logout}>Logout</button>            
        </div>
        );
    }
        
}

export default Student;