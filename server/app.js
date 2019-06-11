const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { users, rejectIp, acceptIp } = require('./data.js');

console.log(users);

const app = express();


const myIp = '10.5.4.71';
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
  // 確認此ip是否已經登入過
  const logoutIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  for (let i = 0; i < users.length; i += 1) {
    if (users[i].ip === logoutIp) {
      users[i].ip = '';
      spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-s', logoutIp, '-j', 'ACCEPT']);
      spawn('iptables', ['-t', 'nat', '-D', 'PREROUTING', '-d', logoutIp, '-j', 'ACCEPT']);
      spawn('iptables', ['-D', 'FORWARD', '-s', logoutIp, '-j', 'ACCEPT']);
      spawn('iptables', ['-D', 'FORWARD', '-d', logoutIp, '-j', 'ACCEPT']);
      // TODOS: 沒辦法刪掉所有跟這個ip有關的規則
      break;
    }
  }
  res.send(JSON.stringify({ logout: 'success' }));
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

app.listen(8889);
console.log('start listening on port 8889!!');
