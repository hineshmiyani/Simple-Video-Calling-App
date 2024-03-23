import { createContext, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../types";

type SocketContextType = Socket | null;

export const SocketContext = createContext<SocketContextType>(null);

export const useSocket = (): SocketContextType => useContext(SocketContext);

type Props = {
  children: React.ReactNode;
};

const SocketProvider = ({ children }: Props) => {
  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(
    () => io("http://localhost:8000"),
    []
  );

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
