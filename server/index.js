const express = require("express");
const cors = require("cors");

const app = express();
const socket = require("socket.io");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messagesRoute");

require("dotenv").config();
const PORT = process.env.PORT || 5000
const Database = require("./config/database");

app.use(cors());
app.use(express.json());

//db connect
Database.dbConnect();

app.get("/ping", (req, res) => {
    return res.json({ msg: "Ping Successful" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages",messageRoutes);

const server = app.listen(PORT, () =>
    console.log(`Server started on port ${PORT}`)
);

const io = socket(server, {
    cors: {
      origin: "https://chat-app-steel-six.vercel.app",
      credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        // Notify all clients that this user is online
        io.emit("user-online", userId);
        //send all online user list to all user
        const onlineUserIds = Array.from(onlineUsers.keys());
        io.emit("recieve-user",onlineUserIds);
    });

    socket.on("disconnect", () => {
        // Find the user who disconnected and remove them from the onlineUsers Map
        
        for (let [userId, id] of onlineUsers.entries()) {
            if (id === socket.id) {
                onlineUsers.delete(userId);
                // Notify all clients that this user is offline
                io.emit("user-offline", userId);
                //send all online user list to all user
                const onlineUserIds = Array.from(onlineUsers.keys());
                io.emit("recieve-user",onlineUserIds);
                break;
            }
        }
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });

    // Add a new event to check if a user is online
    socket.on("check-online", (userId) => {
        const isOnline = onlineUsers.has(userId);
        socket.emit("user-online-status", { userId, isOnline });
    });

    // get list of all online user
    socket.on("getAll-user",()=>{
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit("recieve-user",onlineUserIds);
    })

});


