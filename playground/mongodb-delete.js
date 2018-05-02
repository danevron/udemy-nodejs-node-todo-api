const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  };

  const db = client.db('TodoApp');

  db.collection('Users').deleteMany({age: 25}).then((results) => {
    console.log(results);
  });


  db.collection('Users').deleteOne({age: 24}).then((results) => {
    console.log(results);
  });

  db.collection('Users').findOneAndDelete({age: 65}).then(console.log);

  client.close();
});
