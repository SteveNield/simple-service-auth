const Express = require('express');
const auth = require('../../index');

const port = 5221;

const secret = 'supersecretdonttellanyone';
const users = [{
  key: '123123123123',
  role: 'User'
}, {
  key: '234kjh234kjh2k34',
  role: 'Contributor'
}, {
  key: '234234234234',
  role: 'Admin'
}];

const app = new Express();

auth.setup({ 
  users, 
  secret 
});
auth.http.route(app);
app.use(auth.http.protect([
  'User',
  'Admin'
]));

app.get(
  '/protected_resource_1',
  (req,res) => {
    res.status(200).json({ message: 'Only Users and Admins can read this' });
  }
);

app.get(
  '/protected_resource_2',
  (req,res) => {
    res.status(200).json({ message: 'Only Users and Admins can read this' });
  }
)

module.exports = app.listen(port, () => {
  console.log(`listening on ${port}`);
});
