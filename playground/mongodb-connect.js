const { MongoClient } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };

  const db = client.db('TodoApp');

  db.collection('Todos').insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert Todo', err);
    };

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  db.collection('Users').insertOne({
    name: 'Donald',
    age: 65
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    };

    console.log(JSON.stringify(result.ops, undefined, 2));
  });

  client.close();
});
