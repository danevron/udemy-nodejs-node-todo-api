const expect = require('expect');
const request = require('supertest');

const app = require('./../server');
const { Todo } = require('./../models/todo');

describe('POST /todos', () => {

  beforeEach((done) => {
    Todo.remove({}).then(() => done());
  });

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

        Todo.find().then((todos) => {
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
          expect(todos.length).toBe(0);
          done();
        }).catch(e => done(e));
      });
  });
});
