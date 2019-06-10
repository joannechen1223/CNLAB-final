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
            <h2>Go surf the Net!</h2>
            <div className="Speed">
                <p>Your Internet Speed:</p>
                <p className="num">{this.state.speed} Mbps</p>
            </div>
            <button type="button" className="btn-lg btn-outline-primary" onClick={this.Logout}>Logout</button>            

        </div>
        );
    }
        
}

export default Student;