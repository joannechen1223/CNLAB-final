const express = require('express');
const bodyParser = require('body-parser');
const {spawn} = require('child_process');

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
  let account = req.body.account;
  let password = req.body.password;
  let remote_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(account, password, remote_ip);
  let reject_ip = '157.240.15.35';
  let accept_ip = '140.112.0.0/16'
  if (account === 'admin' && password === 'admin') {
    res.redirect(`http://${myIp}:3000/admin`);
    //修改防火牆 並且把此人ip記下來
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remote_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-I', 'FORWARD', '-d', remote_ip, '-j', 'ACCEPT']);
  } else {
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-j', 'ACCEPT']);
    // spawn('iptables', ['-I', 'FORWARD', '-d', remote_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-j', 'DROP']);
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-d', remote_ip, '-j', 'DROP']);
    spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-j', 'DROP']);
    spawn('iptables', ['-I', 'FORWARD', '-d', remote_ip, '-j', 'DROP']);

    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-d', accept_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', accept_ip, '-d', remote_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-d', accept_ip, '-j', 'ACCEPT']);
    spawn('iptables', ['-I', 'FORWARD', '-s', accept_ip, '-d', remote_ip, '-j', 'ACCEPT']);

    

    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', remote_ip, '-d', reject_ip, '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-I', 'PREROUTING', '1', '-s', reject_ip, '-d', remote_ip, '-j', 'DROP']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', remote_ip, '-d', reject_ip, '-j', 'DROP']);
    // spawn('iptables', ['-I', 'FORWARD', '-s', reject_ip, '-d', remote_ip, '-j', 'DROP']);

    // spawn('iptables', ['-t', 'nat', '-A' ,'PREROUTING' ,'-j', 'blockfacebook']);
    // spawn('iptables', ['-t', 'nat', '-A' ,'blockfacebook' ,'-s', remote_ip, '-d', 'facebook.com', '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-A' ,'blockfacebook' ,'-s', remote_ip, '-d', 'www.facebook.com', '-j', 'DROP']);
    // spawn('iptables', ['-t', 'nat', '-A' ,'blockfacebook' ,'-s', remote_ip, '-d', 'apps.facebook.com', '-j', 'DROP']);
    res.redirect(`http://${myIp}:3000/student`);
  }
});

app.listen(8889);
console.log('start listening on port 8889!!');
