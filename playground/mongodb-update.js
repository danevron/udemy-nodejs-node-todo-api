const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };

  const db = client.db('TodoApp');

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5ae9f9aa0e90fe8489da6a47')
  }, {
    $set: {
      name: 'Dan'
    },
    $inc: {
      age: 1
    }
  }, {
    returnOriginal: false
  }).then(console.log);

  client.close();
});
