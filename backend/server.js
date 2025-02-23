require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');

const sequelize = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const redis = require('redis');
const { createClient } = require('redis');
const RedisStore = require('connect-redis').default;
const config = require("./config/index");



const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const redisClient = createClient({
  url: `redis://localhost:6379`
});


redisClient.connect().catch(console.error);



app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'session:'
    }),

    secret: config.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);


app.use(passport.initialize());
app.use(passport.session());

sequelize.sync()
  .then(() => {
    console.log('Database and tables created successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });



const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', dataRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the MERN Stack Application');
});


const PORT = config.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
