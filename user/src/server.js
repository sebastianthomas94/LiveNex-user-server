import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import cors from "cors";
import mongoose from "mongoose";
import {
  signupService,
  signinService,
  Oauth,
  googleCallBack,
  youtubeAuth,
  youtubeOauthCallback,
  replyComment,
  createTicket,
  gettickets,
  getSubscriptionDetails,
  scheduleInfoUpdate,
  getUpcomingLives,
} from "./services/main.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import { authAndSave } from "./middlewear/auth-and- cookiesave.js";
import {
  facebookAuth,
  facebookOauthCallback,
} from "./services/facebookEndpoints.js";
import { twitchAuth, twitchOauthCallback } from "./services/twitchEndpoints.js";
import { uploadtos3 } from "./services/broadcast.js";
import { checkIfSubscribed } from "./helper/mongoUpdates.js";
import { razorpay, razorpaySuccess } from "./services/razorpay.js";
import {
  adminLogin,
  deleteUser,
  getAllTickets,
  getPastLives,
  getUsers,
  saveTicketReply,
  setLiveData,
} from "./services/admin.js";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const __dirname = path.resolve(path.dirname(""));
dotenv.config({ path: path.join(__dirname, "../.env") });

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to user db!"));

const app = express();

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(
  cors({
    origin: process.env.FRONT_END,
    methods: "*",
    credentials: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

// app.use((req, res, next) => {
//   let data = '';
//   console.log("header: ", req.headers);
//   req.on('data', (chunk) => {
//     data += chunk.toString();
//   });

//   req.on('end', () => {
//     console.log('FormData received at the API Gateway:', data);
//     next();
//   });
// });

app.use(express.static(path.resolve(__dirname, "../views/build")));

app.post("/user/signin", signinService);
app.post("/user/signup", signupService);
app.get("/user/logout", (req, res) => {
  console.log("logged out");
  res.end();
});
app.post("/user/reply", replyComment);
app.get("/user/auth/google", Oauth);
app.get("/user/auth/google/callback", googleCallBack);
app.get("/user/auth/youtubeauth", authAndSave, youtubeAuth);
app.get("/user/auth/youtube-oauth-callback", youtubeOauthCallback);
app.get("/user/auth/fbauuth", authAndSave, facebookAuth);
app.get("/user/auth/facebook-oauth-callback", facebookOauthCallback);
app.get("/user/auth/twitchauth", authAndSave, twitchAuth);
app.get("/user/auth/twitch-oauth-callback", twitchOauthCallback);
// app.post("/uploadvideo", upload.single('file'), uploadtos3);
app.get("/user/issubscribed", authAndSave, checkIfSubscribed);
app.get("/user/razor/orders", authAndSave, razorpay);
app.post("/user/razor/success", authAndSave, razorpaySuccess);
app.post("/user/admin/login", adminLogin);
app.get("/user/admin/getusers", getUsers);
app.post("/user/setlivedata", authAndSave, setLiveData);
app.get("/user/getpastlives", authAndSave, getPastLives);
app.get("/user/admin/deleteuser", deleteUser);
app.get("/user/createticket", authAndSave, createTicket);
app.get("/user/gettickets", authAndSave, gettickets);
app.get("/user/admin/getalltickets", getAllTickets);
app.post("/user/admin/sentticketreply", saveTicketReply);
app.get("/user/getSubscriptionDetails", authAndSave, getSubscriptionDetails);
app.post("/user/scheduleinfoupdate", authAndSave, scheduleInfoUpdate);
app.get("/user/getUpcomingLives", authAndSave, getUpcomingLives);
app.use("/user/uploadvideo", upload.single("file"), uploadtos3);

app.get('*',(req,res)=>{
  res.sendFile(path.resolve(__dirname, "../views/build/index.html"))
})

app.listen(process.env.PORT, () =>
  console.log(`User server started at ${process.env.PORT}`)
);
