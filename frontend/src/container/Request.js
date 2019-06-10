import React, { Component } from 'react'

// import './Request.css'
import RequestList from '../component/RequestList.js'

class Request extends Component {
    constructor(props) {
    super(props);
    /* state 1 表示good student; state 2 表示bad student*/
    this.state = {data: [
        {student: "Mark",
        identity: "good student",
         website: "10.1.2.3",
           state: "downgrade"},
        {student: "Jacob",
        identity: "bad student",
         website: "10.1.2.3",
           state: "upgrade"},
        {student: "Larry",
        identity: "good student",
         website: "10.1.2.3",
           state: "downgrade"}]};
    }

    allow = e => {
        /* 這裡要允許request */

    }

    render() {
        return (
        <div className="square">
            <h1 className="table">Request</h1>
            <table className="request_table">
                <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Student</th>
                      <th scope="col">Identity</th>
                      <th scope="col">Request Website</th>
                      <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.state.data.map(
                        e => <RequestList id={this.state.data.indexOf(e)}
                                     student={e.student}
                                     identity={e.identity}
                                     website={e.website}
                                     state={e.state}
                                     click={this.allow}/>
                    )
                }
                </tbody>
            </table>
        </div>
        );
    }
        
}

export default Request;