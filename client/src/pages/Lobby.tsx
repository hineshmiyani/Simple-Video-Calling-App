import { useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { EventName, RoomJoinData } from "../types";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = useCallback((data: RoomJoinData) => {
    const { email, room } = data;
    console.log({ email, room });
    navigate(`room/${room}`);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(EventName.ROOM_JOIN, handleJoinRoom);

    return () => {
      socket.off(EventName.ROOM_JOIN, handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = new FormData(e.target as HTMLFormElement);
      const formProps = Object.fromEntries(formData);

      if (socket) {
        socket.emit(EventName.ROOM_JOIN, {
          ...formProps,
        });
      }
    },
    [socket]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full mx-auto my-12 bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Lobby
        </h1>
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-md font-semibold text-gray-700 mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="room"
              className="block text-md font-semibold text-gray-700 mb-2"
            >
              Room Number:
            </label>
            <input
              type="text"
              id="room"
              name="room"
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="py-3 px-6 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition duration-150 ease-in-out"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
