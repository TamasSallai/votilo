import { IsString, Length } from 'class-validator';

export class RemoveNominationDto {
  @IsString()
  @Length(8, 8)
  id: string;
}
