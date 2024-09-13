import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import {
  AddNominationData,
  AddParticipantData,
  AddRankingsData,
  CreatePollData,
  Nominations,
  Poll,
  Rankings,
  RemoveNominationData,
  RemoveParticipantData,
  Results,
} from './types';
import {
  createNominationID,
  createPollID,
  createUserID,
} from './utils/createIds';

@Injectable()
export class PollsService {
  private readonly pollTTL: string;

  constructor(
    configService: ConfigService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {
    this.pollTTL = configService.get('POLL_TTL');
  }

  private computeResults(
    rankings: Rankings,
    nominations: Nominations,
    votesPerVoter: number,
  ): Results {
    const scores: { [nominationID: string]: number } = {};

    Object.values(rankings).forEach((rankings) => {
      let voteValue = votesPerVoter;
      rankings.forEach((nominationID, n) => {
        scores[nominationID] = (scores[nominationID] ?? 0) + voteValue;
        voteValue++;
      });
    });

    const result = Object.entries(scores).map(([nominationID, score]) => ({
      nominationID,
      nominationText: nominations[nominationID].text,
      score,
    }));

    return result;
  }

  async create({ topic, votesPerVoter }: CreatePollData): Promise<Poll> {
    const pollID = createPollID();
    const userID = createUserID();

    const poll: Poll = {
      id: pollID,
      topic,
      votesPerVoter,
      adminID: userID,
      participants: {},
      nominations: {},
      rankings: {},
      results: [],
      hasVotingStarted: false,
    };

    const result = await this.redisClient
      .multi()
      .call('JSON.SET', `polls:${pollID}`, '.', JSON.stringify(poll))
      .call('EXPIRE', `polls:${pollID}`, this.pollTTL)
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const createdPoll = JSON.parse(result[2][1] as string) as Poll;

    return createdPoll;
  }

  async findOne(id: string): Promise<Poll> {
    const poll = await this.redisClient.call('JSON.GET', `polls:${id}`);

    if (!poll) {
      throw new NotFoundException(`Poll with id: ${id} not found`);
    }

    return JSON.parse(poll as string);
  }

  async addParticipant({
    pollID,
    userID,
    name,
  }: AddParticipantData): Promise<Poll> {
    const result = await this.redisClient
      .multi()
      .call(
        'JSON.SET',
        `polls:${pollID}`,
        `.participants.${userID}`,
        JSON.stringify(name),
      )
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const poll = JSON.parse(result[1][1] as string) as Poll;
    return poll;
  }

  async removeParticipant({
    pollID,
    userID,
  }: RemoveParticipantData): Promise<Poll> {
    const result = await this.redisClient
      .multi()
      .call('JSON.DEL', `polls:${pollID}`, `.participants.${userID}`)
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const poll = JSON.parse(result[1][1] as string) as Poll;

    return poll;
  }

  async addNomination({
    pollID,
    userID,
    text,
  }: AddNominationData): Promise<Poll> {
    const nominationID = createNominationID();

    const nomination = {
      userID,
      text,
    };

    const result = await this.redisClient
      .multi()
      .call(
        'JSON.SET',
        `polls:${pollID}`,
        `.nominations.${nominationID}`,
        JSON.stringify(nomination),
      )
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const poll = JSON.parse(result[1][1] as string) as Poll;
    return poll;
  }

  async removeNomination({
    pollID,
    nominationID,
  }: RemoveNominationData): Promise<Poll> {
    const result = await this.redisClient
      .multi()
      .call('JSON.DEL', `polls:${pollID}`, `.nominations.${nominationID}`)
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const poll = JSON.parse(result[1][1] as string) as Poll;
    return poll;
  }

  async startPoll(pollID: string): Promise<Poll> {
    const result = await this.redisClient
      .multi()
      .call('JSON.SET', `polls:${pollID}`, '.hasVotingStarted', 'true')
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const poll = JSON.parse(result[1][1] as string) as Poll;
    return poll;
  }

  async addRankings({
    pollID,
    userID,
    rankings,
  }: AddRankingsData): Promise<Poll> {
    const result = await this.redisClient
      .multi()
      .call(
        'JSON.SET',
        `polls:${pollID}`,
        `.rankings.${userID}`,
        JSON.stringify(rankings),
      )
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const poll = JSON.parse(result[1][1] as string) as Poll;
    return poll;
  }

  async getResults(pollID: string): Promise<Poll> {
    const poll = await this.findOne(pollID);

    const pollResults = this.computeResults(
      poll.rankings,
      poll.nominations,
      poll.votesPerVoter,
    );

    const result = await this.redisClient
      .multi()
      .call(
        'JSON.SET',
        `polls:${pollID}`,
        '.results',
        JSON.stringify(pollResults),
      )
      .call('JSON.GET', `polls:${pollID}`)
      .exec();

    const updatedPoll = JSON.parse(result[1][1] as string) as Poll;

    return updatedPoll;
  }

  async deletePoll(pollID: string) {
    await this.redisClient.call('DEL', `polls:${pollID}`);
  }
}
