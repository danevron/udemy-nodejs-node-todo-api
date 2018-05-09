const { ObjectID } = require('mongodb');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const todos = [{
  _id: new ObjectID(),
  text: 'first test todo'
}, {
  _id: new ObjectID(),
  text: 'second test todo',
  completed: true,
  completedAt: 123
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const users = [{
  _id: userOneId,
  email: 'one@example.com',
  password: 'one111',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'two@example.com',
  password: 'two222'
}];

const populateUsers = (done) => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const usertwo = new User(users[1]).save();

    return Promise.all([userOne, usertwo]);
  }).then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
