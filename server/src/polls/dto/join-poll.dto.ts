import { IsString, Length } from 'class-validator';

export class JoinPollDto {
  @IsString()
  @Length(8, 8)
  pollID: string;

  @IsString()
  @Length(2, 25)
  name: string;
}
