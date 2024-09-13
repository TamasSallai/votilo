import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createUserID } from './utils/createIds';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { JoinPollDto } from './dto/join-poll.dto';

@Controller('polls')
export class PollsController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly pollsService: PollsService,
  ) {}

  @Post()
  async create(@Body() { topic, votesPerVoter, name }: CreatePollDto) {
    const createdPoll = await this.pollsService.create({
      topic,
      votesPerVoter,
    });

    const accessToken = this.jwtService.sign(
      {
        pollID: createdPoll.id,
        name,
      },
      {
        subject: createdPoll.adminID,
      },
    );

    return {
      accessToken,
      poll: createdPoll,
    };
  }

  @Post('/join')
  async join(@Body() { pollID, name }: JoinPollDto) {
    const userID = createUserID();
    const poll = await this.pollsService.findOne(pollID);

    const accessToken = this.jwtService.sign(
      {
        pollID: poll.id,
        name,
      },
      {
        subject: userID,
      },
    );

    return {
      accessToken,
      poll,
    };
  }
}
