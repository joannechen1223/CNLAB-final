import React, { Component } from 'react'

// import './Request.css'
import RequestList from '../component/RequestList.js'

class Request extends Component {
    constructor(props) {
    super(props);
    /* state 1 表示good student; state 2 表示bad student*/
    }

    allow = e => {
        /* 這裡要允許request */
        const requestID = e.target.parentNode.parentNode.id;
        console.log(requestID);
        fetch('/api/allow', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requestID,
            }),
        })
            .then((res) => (res.json(res)))
            .then((data) => {
                console.log(data);
                this.props.getRequest();
            })
    }

    render() {
        const requestList = this.props.requestList;
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
                    this.props.requestList.map(
                        e => <RequestList id={this.props.requestList.indexOf(e)}
                                     student={e.student}
                                     identity={e.identity}
                                     website={e.website}
                                     state={"allow"}
                                     click={this.allow}/>
                    )
                }
                </tbody>
            </table>
            <button onClick={this.props.getRequest}>Refresh</button>
        </div>
        );
    }
        
}

export default Request;