const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "chatav";
const collectionName = "UserData";

async function connectDB() {
  await client.connect();
  return client.db(dbName).collection(collectionName);
}

async function insertData(name, email_ph, pass, age, gender, img) {
  const collection = await connectDB();
  const result = await collection.insertOne({
    name: name,
    contract: email_ph,
    password: pass,
    age: age,
    gender: gender,
    img: img
  });
  return result;
}

async function getAllData() {
  const collection = await connectDB();
  const data = await collection.find({}).toArray();
  return data;
}

async function getDataById(id) {
  const collection = await connectDB();
  const data = await collection.findOne({ _id: new ObjectId(id) });
  return data;
}

async function updateData(id, updatedFields) {
  const collection = await connectDB();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedFields }
  );
  return result;
}

async function deleteData(id) {
  const collection = await connectDB();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result;
}


async function deleteAllData() {
  const collection = await connectDB();
  const result = await collection.deleteMany({});
  return result;
}

module.exports = {
  connectDB,
  insertData,
  getAllData,
  getDataById,
  updateData,
  deleteData,
  deleteAllData 
};
