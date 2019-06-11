module.exports = {
  users: [
    {
      userId: 0,
      account: 'admin',
      password: 'admin',
      type: 0,
      ip: '',
    },
    {
      userId: 1,
      account: 'good',
      password: 'good',
      type: 1,
      ip: '',
    },
    {
      userId: 2,
      account: 'bad',
      password: 'bad',
      type: 2,
      ip: '',
    },
  ],
  rejectIp: [
    '104.31.230.9',
    '104.31.231.9',
    '34.96.117.106',
  ],
  acceptIp: [
    '140.112.0.0/16',
  ],
};
