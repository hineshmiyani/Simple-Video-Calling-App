import {
  ClientToServerEvents,
  EventName,
  ServerToClientEvents,
} from "./types/index";
import { Server } from "socket.io";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(8000, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const emailToSocketIdMap = new Map<string, string>();
const socketIdToEmailMap = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`Socket Connected!`, socket?.id);

  socket?.on(EventName.ROOM_JOIN, (data) => {
    console.log(data);

    const { email, room } = data;

    emailToSocketIdMap.set(email, room);
    socketIdToEmailMap.set(room, email);

    io.to(room).emit(EventName.USER_JOINED, { email, id: socket?.id });

    socket?.join(room);

    io.to(socket?.id).emit(EventName.ROOM_JOIN, data);
  });

  socket?.on(EventName.USER_CALL, (data) => {
    console.log(EventName.USER_CALL, data);

    const { to, offer } = data;
    io.to(to).emit(EventName.INCOMING_CALL, { from: socket?.id, offer });
  });

  socket?.on(EventName.CALL_ACCEPTED, (data) => {
    const { to, answer } = data;

    io.to(to).emit(EventName.CALL_ACCEPTED, { to: socket?.id, answer });
  });

  socket?.on(EventName.PEER_NEGOTIATION_NEEDED, (data) => {
    const { to, offer } = data;
    io.to(to).emit(EventName.PEER_NEGOTIATION_NEEDED, {
      to: socket?.id,
      offer,
    });
  });

  socket?.on(EventName.PEER_NEGOTIATION_DONE, (data) => {
    const { to, answer } = data;
    io.to(to).emit(EventName.PEER_NEGOTIATION_DONE, {
      to: socket?.id,
      answer,
    });
  });
});
