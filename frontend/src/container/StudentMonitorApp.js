import React, { Component } from 'react'
import { Switch, BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import Login from './Login';
import Admin from './Admin';
import Student from './Student';
import Request from './Request';
import Monitor from './Monitor';

class StudentMonitorApp extends Component {
    constructor(props) {
      super(props);
    //   this.Monitor = this.Monitor.bind(this);
    //   this.modify = this.modify.bind(this);
      this.state = {
        userList: [],
        requestList: [],
      };
    }

    request = e => {
        console.log("send request");
        // console.log(document.getElementById("request").value);
        const studentRequest = document.getElementById("request").value;
        document.getElementById("request").value = "";
        fetch('/api/sendRequest', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requestIp: studentRequest, 
            }),
        })
            .then((res) => (res.json(res)))
            .then((data) => {
                console.log(data);
                
            })

    }

    getRequest = e => {
        console.log("go to Request Page and get request Data");
        /* 前往request頁面 */
        fetch('/api/getRequest', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then((res) => (res.json(res)))
            .then((data) => {
                console.log(data);
                this.setState({
                    requestList: data.requestList,
                });
            })
    }

    modify = e => {
        const studentName = e.target.parentNode.parentNode.childNodes[1].innerHTML;
        if (e.target.value === "downgrade") {
            console.log("downgrade");
            /* 這裡要降級 */
            fetch('/api/downgrade', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account: studentName,
                }),
            })
                .then((res) => (res.json(res)))
                .then((data) => {
                    console.log(data);
                    this.Monitor();
                })
        }
        else if (e.target.value === "upgrade") {
            console.log("upgrade");
            /* 這裡要升級 */
            fetch('/api/upgrade', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account: studentName,
                }),
            })
                .then((res) => (res.json(res)))
                .then((data) => {
                    console.log(data);
                    this.Monitor();
                })
        }
    }
    

    Monitor = e => {
        console.log("go to Monitor Page");
        /* 前往monitor頁面 */
        fetch('/api/monitor', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
            .then((res) => (res.json(res)))
            .then((data) => {
                console.log(data);
                // console.log(data['0.0.0.1']);
                const newUserList = [];
                for (var key in data){
                //   console.log(data[key]);
                    let studentData = {
                        student: data[key].studentAccount,
                        identity: '',
                        flow: data[key].flow,
                        state: '',
                    }
                    if (data[key].identity === 1) {
                        studentData.identity = 'good student';
                        studentData.state = 'downgrade';
                    } else {
                        studentData.identity = 'bad student';
                        studentData.state = 'upgrade';
                    }
                    newUserList.push(studentData);
                    
                }
                this.setState({
                    userList: newUserList,
                });
                console.log(this.state.userList);
            })
    }

    render() {
        return (
        <div className="StudentMonitorApp">
            <Router>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/student" render={() => (<Student request={this.request}/>)} />
                    <Route path="/admin" render={() => (<Admin Monitor={this.Monitor} getRequest={this.getRequest}/>)} />
                    <Route path="/request" render={() => (<Request requestList={this.state.requestList} getRequest={this.getRequest}/>)} />
                    <Route path="/monitor" render={() => (<Monitor userList={this.state.userList} refreshMonitor={this.Monitor} modify={this.modify}/>)} />
                </Switch>
            </Router>
        </div>
        );
    }
}

export default StudentMonitorApp;