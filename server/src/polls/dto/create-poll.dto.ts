import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreatePollDto {
  @IsString()
  @Length(2, 25)
  name: string;

  @IsString()
  @Length(1, 100)
  topic: string;

  @IsInt()
  @Min(1)
  @Max(10)
  votesPerVoter: number;
}
