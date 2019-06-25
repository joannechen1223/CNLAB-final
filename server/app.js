const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { users, rejectIp, acceptIp } = require('./data.js');

console.log(users);

const app = express();


const myIp = '10.5.0.231';
const myPort = '8889';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// spawn('iptables', ['-F']);
// spawn('iptables', ['-F', '-t', 'nat']);
spawn('iptables', ['-A', 'FORWARD', '-i', 'wlx74da38db1813', '-p', 'tcp', '--dport', '53', '-j', 'ACCEPT']);
spawn('iptables', ['-A', 'FORWARD', '-i', 'wlx74da38db1813', '-p', 'udp', '--dport', '53', '-j', 'ACCEPT']);
spawn('iptables', ['-A', 'FORWARD', '-i', 'wlx74da38db1813', '-p', 'tcp', '--dport', myPort, '-d', myIp, '-j', 'ACCEPT']);
spawn('iptables', ['-A', 'FORWARD', '-i', 'wlx74da38db1813', '-j', 'DROP']);
spawn('iptables', ['-t', 'nat', '-A', 'PREROUTING', '-i', 'wlx74da38db1813', '-p', 'tcp', '--dport', '80', '-j', 'DNAT', '--to-destination', `${myIp}:${myPort}`]);
spawn('iptables', ['-t', 'nat', '-A', 'PREROUTING', '-i', 'wlx74da38db1813', '-p', 'tcp', '--dport', '443', '-j', 'DNAT', '--to-destination', `${myIp}:${myPort}`]);


app.get(/\/*/, (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`${ip} is asking for wifi`);
  res.redirect(`http://${myIp}:3000`);
});

app.post('/api/login', (req, res) => {
  console.log('in api login');
  const { account } = req.body;
  const { password } = req.body;
  const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(account, password, remoteIp);
  if (account === 'admin' && password === 'admin') {
    // admin
    users[0].ip = remoteIp;
    res.send(JSON.stringify({ result: 'success', type: 'admin' }));
    // 修改防火牆 並且把此人ip記下來
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-j', 'ACCEPT']);
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remoteIp, '-j', 'ACCEPT']);
    spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-j', 'ACCEPT']);
    spawn('iptables', ['-I', 'FORWARD', '-d', remoteIp, '-j', 'ACCEPT']);
  } else {
    // student
    let exist = false;
    for (let i = 0; i < users.length; i += 1) {
      if (account === users[i].account && password === users[i].password) {
        // exist user data
        users[i].ip = remoteIp;
        if (users[i].type === 1) {
          // good student
          // 可以上鎖有網頁
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-I', 'FORWARD', '-d', remoteIp, '-j', 'ACCEPT']);

          // 封鎖某些特定網頁
          for (let j = 0; j < rejectIp.length; j += 1) {
            spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-d', rejectIp[j], '-j', 'DROP']);
            spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', rejectIp[j], '-d', remoteIp, '-j', 'DROP']);
            spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-d', rejectIp[j], '-j', 'DROP']);
            spawn('iptables', ['-I', 'FORWARD', '-s', rejectIp[j], '-d', remoteIp, '-j', 'DROP']);
          }
        } else if (users[i].type === 2) {
          // bad student
          // 封鎖全部網頁
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-I', 'FORWARD', '-d', remoteIp, '-j', 'DROP']);

          // 只能上某些特定網頁 e.g.台大domain下的網頁
          for (let j = 0; j < acceptIp.length; j += 1) {
            spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-d', acceptIp[j], '-j', 'ACCEPT']);
            spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', acceptIp[j], '-d', remoteIp, '-j', 'ACCEPT']);
            spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-d', acceptIp[j], '-j', 'ACCEPT']);
            spawn('iptables', ['-I', 'FORWARD', '-s', acceptIp[j], '-d', remoteIp, '-j', 'ACCEPT']);
          }
        }
        exist = true;
        break;
      }
    }
    if (exist) {
      res.send(JSON.stringify({ result: 'success', type: 'student' }));
    } else {
      res.send(JSON.stringify({ result: 'fail' }));
    }
  }
});

app.post('/api/checkLogin', (req, res) => {
  // 確認此ip是否已經登入過
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let check = false;
  let type = 'student';
  for (let i = 0; i < users.length; i += 1) {
    if (users[i].ip === ip) {
      if (users[i] === 0) {
        type = 'admin';
      }
      check = true;
      break;
    }
  }
  if (check) {
    res.send(JSON.stringify({ login: true, type }));
  } else {
    res.send(JSON.stringify({ login: false }));
  }
});

app.post('/api/logout', (req, res) => {
  const logoutIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  for (let i = 0; i < users.length; i += 1) {
    if (users[i].ip === logoutIp) {
      users[i].ip = '';
      break;
    }
  }
  console.log(logoutIp);
  const child = spawn('iptables', ['-L', '-v', '-x']);
  let send = false;
  child.stdout.on('data', (data) => {
    if (send === false) {
      const rates = data.toString().split(/(\r?\n)/g);
      let tokens;
      for (let i = 0; i < rates.length; i += 1) {
        tokens = rates[i].split(' ');
        if (tokens[0] !== '' || tokens.length === 1) continue;
        tokens = tokens.filter(token => token !== '');
        if (tokens[7] === logoutIp || tokens[8] === logoutIp) {
          console.log(tokens);
          spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-j', tokens[2]]);
          spawn('iptables', ['-D', 'FORWARD', '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-d', tokens[8], '-j', tokens[2]]);
        }
      }
      res.send(JSON.stringify({ logout: 'success' }));
      send = true;
    }
  });
});

app.post('/api/register', (req, res) => {
  // 判斷account是否被註冊過
  const { account } = req.body;
  const { password } = req.body;
  let exist = false;
  for (let i = 0; i < users.length; i += 1) {
    if (users[i].account === account) {
      exist = true;
      break;
    }
  }
  if (exist) {
    res.send(JSON.stringify({ result: 'fail' }));
  } else {
    users.push({
      userId: users.length,
      account,
      password,
      type: 1,
      ip: '',
    });
    res.send(JSON.stringify({ result: 'success' }));
  }
});

const speedLimit = true;

app.post('/api/monitor', (req, res) => {
  const userList = { };
  for (let i = 1; i < users.length; i += 1) {
    if (users[i].ip === '') continue;
    userList[users[i].ip] = {
      studentAccount: users[i].account,
      flow: 0,
      identity: users[i].type,
    };
  }

  // console.log(userList);
  const child = spawn('iptables', ['-L', '-v', '-x']);
  let send = false;
  child.stdout.on('data', (data) => {
    if (send === false) {
      const rates = data.toString().split(/(\r?\n)/g);
      let tokens;
      for (let i = 0; i < rates.length; i += 1) {
        tokens = rates[i].split(' ');
        if (tokens[0] !== '' || tokens.length === 1) continue;
        tokens = tokens.filter(token => token !== '');
        // console.log(tokens);
        // console.log(tokens[2]);
        if (tokens[2] === 'ACCEPT') {
        // console.log(tokens[7], tokens[8]);
          if (tokens[7] in userList) {
            // console.log(`${tokens[7]}/s`);
            userList[tokens[7]].flow += parseInt(tokens[1], 10);
            // console.log(userList[tokens[7]].flow);
          } else if (tokens[8] in userList) {
            // console.log(`${tokens[8]}/d`);
            userList[tokens[8]].flow += parseInt(tokens[1], 10);
            // console.log(userList[tokens[8]].flow);
          }
        }
      }
      const threshold = 100000;

      for (const limitIp in userList) {
        
        if (userList[limitIp].flow > threshold) {
          for (let i = 0; i <= users.length; i += 1) {
            if (limitIp === users[i].ip ) {
              users[i].type = 2;
              break;
            }
          }
          // downgrade
          const child = spawn('iptables', ['-L', '-v', '-x']);
          let send = false;
          child.stdout.on('data', (data) => {
            if (send === false) {
              const rates = data.toString().split(/(\r?\n)/g);
              let tokens;
              for (let i = 0; i < rates.length; i += 1) {
                tokens = rates[i].split(' ');
                if (tokens[0] !== '' || tokens.length === 1) continue;
                tokens = tokens.filter(token => token !== '');
                if (tokens[7] === limitIp || tokens[8] === limitIp) {
                  console.log(tokens);
                  spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
                  spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
                  spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-j', tokens[2]]);
                  spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-j', tokens[2]]);
                  spawn('iptables', ['-D', 'FORWARD', '-d', tokens[8], '-j', tokens[2]]);
                  spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-d', tokens[8], '-j', tokens[2]]);
                }
              }
              // bad student
              // 封鎖全部網頁
              spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', limitIp, '-j', 'DROP']);
              spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', limitIp, '-j', 'DROP']);
              spawn('iptables', ['-I', 'FORWARD', '-s', limitIp, '-j', 'DROP']);
              spawn('iptables', ['-I', 'FORWARD', '-d', limitIp, '-j', 'DROP']);

              // 只能上某些特定網頁 e.g.台大domain下的網頁
              for (let j = 0; j < acceptIp.length; j += 1) {
                spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', limitIp, '-d', acceptIp[j], '-j', 'ACCEPT']);
                spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', acceptIp[j], '-d', limitIp, '-j', 'ACCEPT']);
                spawn('iptables', ['-I', 'FORWARD', '-s', limitIp, '-d', acceptIp[j], '-j', 'ACCEPT']);
                spawn('iptables', ['-I', 'FORWARD', '-s', acceptIp[j], '-d', limitIp, '-j', 'ACCEPT']);
              }
              send = true;
            }
          });

          console.log(limitIp);
          if (speedLimit) {
            spawn('iptables', ['-A', 'FORWARD', '-s', limitIp, '-m', 'limit', '--limit', '60/s', '-j', 'ACCEPT']);
            spawn('iptables', ['-A', 'FORWARD', '-s', limitIp, '-j', 'DROP']);
          }
        }
      }

      res.send(JSON.stringify(userList));
      send = true;
    }
  });
  // res.send(JSON.stringify(userList));
});


app.post('/api/downgrade', (req, res) => {
  console.log('in downgrade api');
  const downgradeAccount = req.body.account;
  console.log(downgradeAccount);
  let downgradeIp = '';
  for (let i = 0; i <= users.length; i += 1) {
    if (downgradeAccount === users[i].account) {
      downgradeIp = users[i].ip;
      users[i].type = 2;
      break;
    }
  }
  console.log(downgradeIp);
  const child = spawn('iptables', ['-L', '-v', '-x']);
  let send = false;
  child.stdout.on('data', (data) => {
    if (send === false) {
      const rates = data.toString().split(/(\r?\n)/g);
      let tokens;
      for (let i = 0; i < rates.length; i += 1) {
        tokens = rates[i].split(' ');
        if (tokens[0] !== '' || tokens.length === 1) continue;
        tokens = tokens.filter(token => token !== '');
        if (tokens[7] === downgradeIp || tokens[8] === downgradeIp) {
          console.log(tokens);
          spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-j', tokens[2]]);
          spawn('iptables', ['-D', 'FORWARD', '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-d', tokens[8], '-j', tokens[2]]);
        }
      }
      // bad student
      // 封鎖全部網頁
      spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', downgradeIp, '-j', 'DROP']);
      spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', downgradeIp, '-j', 'DROP']);
      spawn('iptables', ['-I', 'FORWARD', '-s', downgradeIp, '-j', 'DROP']);
      spawn('iptables', ['-I', 'FORWARD', '-d', downgradeIp, '-j', 'DROP']);

      // 只能上某些特定網頁 e.g.台大domain下的網頁
      for (let j = 0; j < acceptIp.length; j += 1) {
        spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', downgradeIp, '-d', acceptIp[j], '-j', 'ACCEPT']);
        spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', acceptIp[j], '-d', downgradeIp, '-j', 'ACCEPT']);
        spawn('iptables', ['-I', 'FORWARD', '-s', downgradeIp, '-d', acceptIp[j], '-j', 'ACCEPT']);
        spawn('iptables', ['-I', 'FORWARD', '-s', acceptIp[j], '-d', downgradeIp, '-j', 'ACCEPT']);
      }
      res.send(JSON.stringify({ upgrade: 'success' }));
      send = true;
    }
  });
  // res.send(JSON.stringify(userList));
});

app.post('/api/upgrade', (req, res) => {
  console.log('in upgrade api');
  const upgradeAccount = req.body.account;
  console.log(upgradeAccount);
  let upgradeIp = '';
  for (let i = 0; i <= users.length; i += 1) {
    if (upgradeAccount === users[i].account) {
      upgradeIp = users[i].ip;
      users[i].type = 1;
      break;
    }
  }
  console.log(upgradeIp);
  const child = spawn('iptables', ['-L', '-v', '-x']);
  let send = false;
  child.stdout.on('data', (data) => {
    if (send === false) {
      const rates = data.toString().split(/(\r?\n)/g);
      let tokens;
      for (let i = 0; i < rates.length; i += 1) {
        tokens = rates[i].split(' ');
        if (tokens[0] !== '' || tokens.length === 1) continue;
        tokens = tokens.filter(token => token !== '');
        if (tokens[7] === upgradeIp || tokens[8] === upgradeIp) {
          console.log(tokens);
          spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-D', 'FORWARD', '-s', tokens[7], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', tokens[7], '-j', tokens[2]]);
          spawn('iptables', ['-D', 'FORWARD', '-d', tokens[8], '-j', tokens[2]]);
          spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-d', tokens[8], '-j', tokens[2]]);
        }
      }
      // good student
      // 可以上鎖有網頁
      spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', upgradeIp, '-j', 'ACCEPT']);
      spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', upgradeIp, '-j', 'ACCEPT']);
      spawn('iptables', ['-I', 'FORWARD', '-s', upgradeIp, '-j', 'ACCEPT']);
      spawn('iptables', ['-I', 'FORWARD', '-d', upgradeIp, '-j', 'ACCEPT']);

      // 封鎖某些特定網頁
      for (let j = 0; j < rejectIp.length; j += 1) {
        spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', upgradeIp, '-d', rejectIp[j], '-j', 'DROP']);
        spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', rejectIp[j], '-d', upgradeIp, '-j', 'DROP']);
        spawn('iptables', ['-I', 'FORWARD', '-s', upgradeIp, '-d', rejectIp[j], '-j', 'DROP']);
        spawn('iptables', ['-I', 'FORWARD', '-s', rejectIp[j], '-d', upgradeIp, '-j', 'DROP']);
      }
      res.send(JSON.stringify({ upgrade: 'success' }));
      send = true;
    }
  });
  // res.send(JSON.stringify(userList));
});

const requestList = [];

app.post('/api/sendRequest', (req, res) => {
  console.log('in send request api');
  const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { requestIp } = req.body;
  for (let i = 0; i < users.length; i += 1) {
    if (remoteIp === users[i].ip) {
      let identity = 'good student';
      if (users[i].type === 2) {
        identity = 'bad student';
      }
      requestList.push({
        student: users[i].account,
        identity,
        website: requestIp,
      });
      break;
    }
  }
  res.send(JSON.stringify({ requestList }));
});

app.post('/api/getRequest', (req, res) => {
  console.log('in get request api');
  res.send(JSON.stringify({ requestList }));
});

app.post('/api/allow', (req, res) => {
  console.log('in allow request api');
  // const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const { requestID } = req.body;
  for (let i = 0; i < users.length; i += 1) {
    console.log(requestList[requestID]);
    console.log(users[i].account);
    if (requestList[requestID].student === users[i].account) {
      console.log(requestList[requestID].student);
      console.log(requestList[requestID].website);
      spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', users[i].ip, '-d', requestList[requestID].website, '-j', 'ACCEPT']);
      spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', requestList[requestID].website, '-d', users[i].ip, '-j', 'ACCEPT']);
      spawn('iptables', ['-I', 'FORWARD', '-s', users[i].ip, '-d', requestList[requestID].website, '-j', 'ACCEPT']);
      spawn('iptables', ['-I', 'FORWARD', '-s', requestList[requestID].website, '-d', users[i].ip, '-j', 'ACCEPT']);
      break;
    }
  }
  requestList.splice(requestID, 1);
  res.send(JSON.stringify({ allow: 'success' }));
});

app.listen(8889);
console.log('start listening on port 8889!!');
