const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { users } = require('./data.js');

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
  // res.setHeader("Content-type", "text/html")
  res.redirect(`http://${myIp}:3000`);
//   res.setHeader('Content-type', 'text/html');
//   res.send(`
// 	<html>
// 		<form action="api/login" method="post">
// 			name: <input type="text" name="name" />
// 			</br>
// 			password: <input type="password" name="password" />
// 			</br>
// 			<button>GO!</button>
// 		</form>
// 	</html>
// 	`);
});

app.post('/api/login', (req, res) => {
  console.log('in api login');
  const { account } = req.body;
  const { password } = req.body;
  const remoteIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(account, password, remoteIp);
  const rejectIp = '157.240.15.35';    // facebook domain
  const acceptIp = '140.112.0.0/16';   // NTU domain
  if (account === 'admin' && password === 'admin') {
    // admin
    users[0].login = true;
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
      console.log(users[i]);
      if (account === users[i].account && password === users[i].password) {
        // exist user data
        users[i].ip = remoteIp;
        users[i].login = true;
        if (users[i].type === 1) {
          // good student
          // available for all websites
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-I', 'FORWARD', '-d', remoteIp, '-j', 'ACCEPT']);

          // reject for facebook
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-d', rejectIp, '-j', 'DROP']);
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', rejectIp, '-d', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-d', rejectIp, '-j', 'DROP']);
          spawn('iptables', ['-I', 'FORWARD', '-s', rejectIp, '-d', remoteIp, '-j', 'DROP']);
        } else if (users[i].type === 2) {
          // bad student
          // non availanle for all websites
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-j', 'DROP']);
          spawn('iptables', ['-I', 'FORWARD', '-d', remoteIp, '-j', 'DROP']);

          // they can only go to NTU domain website
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remoteIp, '-d', acceptIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', acceptIp, '-d', remoteIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-I', 'FORWARD', '-s', remoteIp, '-d', acceptIp, '-j', 'ACCEPT']);
          spawn('iptables', ['-I', 'FORWARD', '-s', acceptIp, '-d', remoteIp, '-j', 'ACCEPT']);
        }
        exist = true;
        break;
      }
    }
    if (exist) {
      // login success
      res.send(JSON.stringify({ result: 'success', type: 'student' }));
    } else {
      res.send(JSON.stringify({ result: 'fail' }));
    }
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-I', 'FORWARD', '-d', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remote_ip, '-j', 'DROP']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-j', 'DROP']);
    // spawn('iptables', ['-I', 'FORWARD', '-d', remote_ip, '-j', 'DROP']);

    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-d', accept_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', accept_ip, '-d', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-d', accept_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', accept_ip, '-d', remote_ip, '-j', 'ACCEPT']);


    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-d', reject_ip, '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', reject_ip, '-d', remote_ip, '-j', 'DROP']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-d', reject_ip, '-j', 'DROP']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', reject_ip, '-d', remote_ip, '-j', 'DROP']);

    // spawn('iptables', ['-t', 'nat', '-A' ,'PREROUTING' ,'-j', 'blockfacebook']);
    // spawn('iptables', ['-t', 'nat', '-A' ,'blockfacebook' ,'-s', remote_ip, '-d', 'facebook.com', '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-A' ,'blockfacebook' ,'-s', remote_ip, '-d', 'www.facebook.com', '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-A' ,'blockfacebook' ,'-s', remote_ip, '-d', 'apps.facebook.com', '-j', 'DROP']);
  }
});

app.listen(8889);
console.log('start listening on port 8889!!');
