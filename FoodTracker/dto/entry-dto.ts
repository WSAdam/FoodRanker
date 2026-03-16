import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type, plainToInstance } from "class-transformer";
import type { entryId, categoryId, date, restaurant, ordered, impressions, price, notes } from "./types.ts";
import { ScorerDto } from "./scorer-dto.ts";

/** a fully resolved dining entry with all fields and scores */
export class EntryDto {
  constructor(input: Partial<EntryDto>) {
    Object.assign(this, plainToInstance(EntryDto, input));
  }

  @IsString()
  entryId!: entryId;

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
