const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {

  it('creates and save a todo', (done) => {
    const text = 'test text';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch(e => done(e));
      });
  });

  it('does not create a todo with invalid data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('returns all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('returns a todo', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('returns 404 when no todo is found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });


  it('returns 404 when id is not an ObjectID', (done) => {
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /todos/:id', () => {
  it('deletes a todo', (done) => {
    const id = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch(e => done(e));
      });
  });

  it('returns 404 if todo does not exist', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('returns 404 when id is not an ObjectID', (done) => {
    request(app)
      .delete(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  const id = todos[0]._id.toHexString();

  it('updates a todo', (done) => {
    request(app)
      .patch(`/todos/${id}`)
      .send({ text: 'new text', completed: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe('new text');
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(todo.text).toBe('new text');
          done();
        }).catch(e => done(e));
      });
  });

  it('clears completedAt when todo is not completed', (done) => {
    const id = todos[1]._id.toHexString();

    request(app)
      .patch(`/todos/${id}`)
      .send({ completed: false })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(id).then((todo) => {
          expect(res.body.todo.completedAt).toNotExist();
          done();
        }).catch(e => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('returns a user when authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
      })
      .end(done);
  });

  it('returns 401 when not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token + 'a')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('creates a user', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'free@example.com',
        password: '123456'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('free@example.com');
        expect(res.headers['x-auth']).toExist();
      })
      .end(done);
  });

  it('returns a validation error for invalid request', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'free@example.com',
        password: '1234'
      })
      .expect(400)
      .end(done);
  });

  it('returns a validation error if email is in use', (done) => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password: '123456'})
      .expect(400)
      .end(done);
  })
});

describe('POST /users/login', () => {
  it('returns auth token on valid credentials', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        };

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('returns 400 on invalid credentials', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: 'one@example.com',
        password: 'wrong!!'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end(done);
  });
});
