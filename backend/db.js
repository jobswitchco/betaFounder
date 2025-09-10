import mongoose from 'mongoose';

const username = 'foundersreddit_db_user';
const password = process.env.MONGODB_PASSWORD;

var dbUrl = 'mongodb+srv://'+username+':'+password+'@cluster0.pxlgkov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const connectToMongo = ()=>{
    mongoose.connect(dbUrl).then()
    .catch((err) => { console.error(err); });
}

export default connectToMongo;