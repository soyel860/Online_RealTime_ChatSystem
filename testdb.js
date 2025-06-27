const {
  insertData,
  getAllData,
  getDataById,
  updateData,
  deleteData,
  deleteAllData
} = require('./mongo');

async function start() {
  try {
    let res = await deleteAllData();
    console.log('All data deleted:', res);
  } catch (err) {
    console.log(err);
  }
}

async function show(){
  try{
    let result = await getAllData();
    console.log(result);
  }catch(err){
    console.log(err);
  }
}

// start();
show();
