// agenda.js
import Agenda from "agenda";

const username = 'foundersreddit_db_user';
const password = process.env.MONGODB_PASSWORD;

var dbUrl = 'mongodb+srv://'+username+':'+password+'@cluster0.pxlgkov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const agenda = new Agenda({
  db: {
    address: dbUrl, // ✅ Your MongoDB connection string
    collection: "agenda_jobs",      // Collection where jobs will be stored
  },
  processEvery: "30 seconds", // How often it checks for due jobs
});

export default agenda;
