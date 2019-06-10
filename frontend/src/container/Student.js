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
                <input type="text" className="form-control request" placeholder="send request..." />
                <button type="button" className="btn-lg btn-light">Request</button>
            </div>
            <button type="button" className="btn-lg btn-outline-primary logout" onClick={this.Logout}>Logout</button>            
        </div>
        );
    }
        
}

export default Student;