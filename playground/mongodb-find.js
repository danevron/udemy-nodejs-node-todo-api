const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };

  const db = client.db('TodoApp');

  db.collection('Users').find({name: 'Dan'}).toArray().then((users) => {
    console.log(users);
  }, (err) => {
    console.log('Unable to finf users', err);
  });

  client.close();
});
