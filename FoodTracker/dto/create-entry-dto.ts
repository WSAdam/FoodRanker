import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type, plainToInstance } from "class-transformer";
import type { categoryId, date, restaurant, ordered, impressions, price, notes } from "./types.ts";
import { ScorerDto } from "./scorer-dto.ts";

/** input for logging a new dining experience with one or more named scores */
export class CreateEntryDto {
  constructor(input: Partial<CreateEntryDto>) {
    Object.assign(this, plainToInstance(CreateEntryDto, input));
  }

  @IsString()
  categoryId!: categoryId;

  @IsString()
  date!: date;

  @IsString()
  restaurant!: restaurant;

  @IsString()
  ordered!: ordered;

  @IsString()
  impressions!: impressions;

  @IsString()
  price!: price;

  @IsString()
  notes!: notes;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScorerDto)
  scorers!: ScorerDto[];
}
