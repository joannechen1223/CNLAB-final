import React, { Component } from 'react'

import './Student.css'

class Student extends Component {
    constructor(props) {
    super(props);
    this.state = {speed: 18};
    }

    render() {
        return (
        <div className="Square">
            <h1>Welcome, Student</h1>
            <h2>Go surf the Net!</h2>
            <div className="Speed">
                <p>Your Internet Speed:</p>
                <p className="num">{this.state.speed} Mbps</p>
            </div>
            

        </div>
        );
    }
        
}

export default Student;