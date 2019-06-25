import React, { Component } from 'react'

// import './Monitor.css'
import MonitorList from '../component/MonitorList.js'

class Monitor extends Component {
    constructor(props) {
    super(props);
    /* state 1 表示good student; state 2 表示bad student*/
    }

    run = e => {
        console.log("run");
        this.props.refreshMonitor();
        setTimeout(this.run, 5000);
    }


    render() {
        const modify = this.props.modify;
        // this.run();
        // this.props.refreshMonitor();
        console.log(this.props.userList);
        return (
        <div className="square">
            <h1 className="table">Monitor</h1>
            <table className="monitor_table">
                <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Student account</th>
                      <th scope="col">Identity</th>
                      <th scope="col">Flow</th>
                      <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.props.userList.map(
                        e => <MonitorList id={this.props.userList.indexOf(e)}
                                     student={e.student}
                                     identity={e.identity}
                                     flow={e.flow}
                                     click={modify}
                                     state={e.state}/>
                    )
                }
                </tbody>
            </table>
            <button onClick={this.props.refreshMonitor}>Refresh</button>
        </div>
        );
    }
        
}


export default Monitor;