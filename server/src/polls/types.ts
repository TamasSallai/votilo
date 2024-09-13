import { Socket } from 'socket.io';

type Nomination = {
  userID: string;
  text: string;
};

type NominationID = string;

export type Nominations = {
  [nominationID: NominationID]: Nomination;
};

export type Rankings = {
  [userID: string]: NominationID[];
};

export type Results = Array<{
  nominationID: NominationID;
  nominationText: string;
  score: number;
}>;

export type Poll = {
  id: string;
  topic: string;
  votesPerVoter: number;
  adminID: string;
  participants: Record<string, string>;
  nominations: Nominations;
  rankings: Rankings;
  results: Results;
  hasVotingStarted: boolean;
};

export type CreatePollData = {
  topic: string;
  votesPerVoter: number;
};

export type AddParticipantData = {
  pollID: string;
  userID: string;
  name: string;
};

export type RemoveParticipantData = {
  pollID: string;
  userID: string;
};

export type AddNominationData = {
  pollID: string;
  userID: string;
  text: string;
};

export type RemoveNominationData = {
  pollID: string;
  nominationID: string;
};

export type AddRankingsData = {
  pollID: string;
  userID: string;
  rankings: string[];
};

export type AddResultsData = {
  pollID: string;
  results: Results;
};

export type JwtPayload = {
  pollID: string;
  sub: string;
  name: string;
};

export interface SocketWithPayload extends Socket {
  payload?: JwtPayload;
}
