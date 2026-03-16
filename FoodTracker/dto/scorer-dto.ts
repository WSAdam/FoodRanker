import { IsString, IsNumber } from "class-validator";
import { plainToInstance } from "class-transformer";
import type { person, rating } from "./types.ts";

/** a single person's named score out of 100 for a dining entry */
export class ScorerDto {
  constructor(input: Partial<ScorerDto>) {
    Object.assign(this, plainToInstance(ScorerDto, input));
  }

  @IsString()
  person!: person;

  @IsNumber()
  rating!: rating;
}
