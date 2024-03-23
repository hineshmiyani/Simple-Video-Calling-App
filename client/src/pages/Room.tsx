import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import {
  AcceptedCallData,
  EventName,
  IncomingCallData,
  PeerNegotiationDoneData,
  PeerNegotiationNeededData,
  UserJoinedData,
} from "../types";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string>();
  const [stream, setStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const handleUserJoined = useCallback(({ email, id }: UserJoinedData) => {
    console.log("User joined", { email, id });
    setRemoteSocketId(id);
  }, []);

  const handleIncomingCall = useCallback(
    async ({ from, offer }: IncomingCallData) => {
      console.log("Incoming call", { from, offer });
      if (!socket) return;

      setRemoteSocketId(from);

      // Start stream
      if (
        "mediaDevices" in navigator &&
        "getUserMedia" in navigator.mediaDevices
      ) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

          setStream(stream);
        } catch (error) {
          console.error("Error: ", error);
        }
      }

      const answer = await peer.getAnswer(offer);

      socket.emit(EventName.CALL_ACCEPTED, { to: from, answer });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    if (!stream) return;

    // send stream
    stream.getTracks().forEach((track) => {
      peer.peer?.addTrack(track, stream);
    });
  }, [stream]);

  const handleCallAccepted = useCallback(
    async ({ to, answer }: AcceptedCallData) => {
      if (!answer || !stream) return;
      await peer?.setLocalDescription(answer);
      console.log("Call accepted", { to, answer });

      sendStreams();
    },
    [sendStreams, stream]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();

    socket?.emit(EventName.PEER_NEGOTIATION_NEEDED, {
      to: remoteSocketId,
      offer,
    });
  }, [remoteSocketId, socket]);

  const handleNegotiationIncoming = useCallback(
    async ({ to, offer }: PeerNegotiationNeededData) => {
      const answer = await peer.getAnswer(offer);
      socket?.emit(EventName.PEER_NEGOTIATION_DONE, {
        to: to,
        answer,
      });
    },
    [socket]
  );

  const handleNegotiationFinal = useCallback(
    async ({ answer }: PeerNegotiationDoneData) => {
      await peer.setLocalDescription(answer);
    },
    []
  );

  useEffect(() => {
    peer.peer?.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      peer.peer?.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  useEffect(() => {
    peer.peer?.addEventListener("track", async (event) => {
      const remoteStream = event.streams?.[0];
      setRemoteStream(remoteStream);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(EventName.USER_JOINED, handleUserJoined);
    socket.on(EventName.INCOMING_CALL, handleIncomingCall);
    socket.on(EventName.CALL_ACCEPTED, handleCallAccepted);
    socket.on(EventName.PEER_NEGOTIATION_NEEDED, handleNegotiationIncoming);
    socket.on(EventName.PEER_NEGOTIATION_DONE, handleNegotiationFinal);

    return () => {
      socket.off(EventName.USER_JOINED, handleUserJoined);
      socket.off(EventName.INCOMING_CALL, handleIncomingCall);
      socket.off(EventName.CALL_ACCEPTED, handleCallAccepted);
      socket.off(EventName.PEER_NEGOTIATION_NEEDED, handleNegotiationIncoming);
      socket.off(EventName.PEER_NEGOTIATION_DONE, handleNegotiationFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotiationIncoming,
    handleNegotiationFinal,
  ]);

  const handleCallUser = useCallback(async () => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const offer = await peer.getOffer();
        console.log(offer);

        if (offer) {
          socket?.emit(EventName.USER_CALL, {
            to: remoteSocketId,
            offer: offer,
          });
        }

        setStream(stream);
      } catch (error) {
        console.error("Error: ", error);
      }
    }
  }, [socket, remoteSocketId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div>
        <h1 className="text-3xl text-center mb-5">Room Page</h1>

        <h4 className="text-xl text-center mb-5">
          {remoteSocketId ? "You're Connected" : "No one in the room!"}
        </h4>

        {remoteSocketId ? (
          <button
            type="submit"
            className="py-2 px-6 text-lg  mx-auto block font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition duration-150 ease-in-out"
            onClick={handleCallUser}
          >
            Call
          </button>
        ) : null}

        {stream ? (
          <button
            type="submit"
            className="py-2 px-6 text-lg  mx-auto block font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none transition duration-150 ease-in-out"
            onClick={sendStreams}
          >
            Send Streams
          </button>
        ) : null}

        {remoteSocketId && stream ? (
          <div className="mt-5">
            <h2 className="text-2xl">My Stream</h2>
            <ReactPlayer
              url={stream}
              width="400px"
              height="300px"
              muted
              playing
            />
          </div>
        ) : null}

        {remoteSocketId && remoteStream ? (
          <div className="mt-5">
            <h2 className="text-2xl">Remote Stream</h2>
            <ReactPlayer
              url={remoteStream}
              width="400px"
              height="300px"
              muted
              playing
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Room;
