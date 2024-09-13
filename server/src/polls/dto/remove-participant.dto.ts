import { IsString, Length } from 'class-validator';

export class RemoveParticipantDto {
  @IsString()
  @Length(21, 21)
  id: string;
}
