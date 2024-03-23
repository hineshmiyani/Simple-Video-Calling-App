export enum EventName {
  ROOM_JOIN = "room:join",
  USER_JOINED = "user:joined",
  USER_CALL = "user:call",
  INCOMING_CALL = "incoming:call",
  CALL_ACCEPTED = "call:accepted",
  PEER_NEGOTIATION_NEEDED = "peer:negotiation-needed",
  PEER_NEGOTIATION_DONE = "peer:negotiation-done",
}

export interface RoomJoinData {
  email: string;
  room: string;
}

export interface UserJoinedData {
  email: string;
  id: string;
}

export interface UserCallData {
  to: string;
  offer: RTCSessionDescriptionInit;
}

export interface IncomingCallData {
  from: string;
  offer: RTCSessionDescriptionInit;
}

export interface AcceptedCallData {
  to: string;
  answer: RTCSessionDescriptionInit;
}

export interface PeerNegotiationNeededData {
  offer: RTCSessionDescriptionInit;
  to: string;
}

export interface PeerNegotiationDoneData {
  answer: RTCSessionDescriptionInit;
  to: string;
}

export interface ServerToClientEvents {
  [EventName.ROOM_JOIN]: (data: RoomJoinData) => void;
  [EventName.USER_JOINED]: (data: UserJoinedData) => void;
  [EventName.USER_CALL]: (data: UserCallData) => void;
  [EventName.INCOMING_CALL]: (data: IncomingCallData) => void;
  [EventName.CALL_ACCEPTED]: (data: AcceptedCallData) => void;
  [EventName.PEER_NEGOTIATION_NEEDED]: (
    data: PeerNegotiationNeededData
  ) => void;
  [EventName.PEER_NEGOTIATION_DONE]: (data: PeerNegotiationDoneData) => void;
}

export interface ClientToServerEvents {
  [EventName.ROOM_JOIN]: (data: RoomJoinData) => void;
  [EventName.USER_JOINED]: (data: UserJoinedData) => void;
  [EventName.USER_CALL]: (data: UserCallData) => void;
  [EventName.INCOMING_CALL]: (data: IncomingCallData) => void;
  [EventName.CALL_ACCEPTED]: (data: AcceptedCallData) => void;
  [EventName.PEER_NEGOTIATION_NEEDED]: (
    data: PeerNegotiationNeededData
  ) => void;
  [EventName.PEER_NEGOTIATION_DONE]: (data: PeerNegotiationDoneData) => void;
}

export interface InterServerEvents {
  ping: () => void;
}
