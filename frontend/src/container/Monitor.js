import React, { Component } from 'react'

// import './Monitor.css'
import MonitorList from '../component/MonitorList.js'

class Monitor extends Component {
    constructor(props) {
    super(props);
    /* state 1 表示good student; state 2 表示bad student*/
    this.state = {data: [
        {student: "Mark",
        identity: "good student",
            flow: 0,
           state: "downgrade"},
        {student: "Jacob",
        identity: "bad student",
            flow: 0,
           state: "upgrade"},
        {student: "Larry",
        identity: "good student",
            flow: 0,
           state: "downgrade"}]};
    }

    modify = e => {
        if (e.target.value === "downgrade") {
            console.log("downgrade");
            /* 這裡要降級 */
        }
        else if (e.target.value === "upgrade") {
            console.log("upgrade");
            /* 這裡要升級 */
        }

    }

    render() {
        return (
        <div className="square">
            <h1 className="table">Monitor</h1>
            <table className="monitor_table">
                <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Student</th>
                      <th scope="col">Identity</th>
                      <th scope="col">Flow</th>
                      <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.state.data.map(
                        e => <MonitorList id={this.state.data.indexOf(e)}
                                     student={e.student}
                                     identity={e.identity}
                                     flow={e.flow}
                                     click={this.modify}
                                     state={e.state}/>
                    )
                }
                </tbody>
            </table>
        </div>
        );
    }
        
}

export default Monitor;