// database boundary

import { validateDto } from "../../dto/_shared.ts";
import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { CategoryListDto } from "../../dto/category-list-dto.ts";
import { getKv } from "../../db.ts";

interface CategoryRow {
  categoryId: string;
  name: string;
}

export class Category {
  private async kv(): Promise<Deno.Kv> {
    return await getKv();
  }

  static async checkUnique(name: string): Promise<void> {
    const kv = await getKv();
    const existing = await kv.get(["category_names", name]);
    if (existing.value !== null) throw new Error("duplicate-name");
  }

  async insert(input: CreateCategoryDto): Promise<CategoryDto> {
    await validateDto(input);
    const kv = await this.kv();
    const categoryId = crypto.randomUUID();

    const result = await kv.atomic()
      .check({ key: ["category_names", input.name], versionstamp: null })
      .set(["category_names", input.name], categoryId)
      .set(["categories", categoryId], { categoryId, name: input.name } as CategoryRow)
      .commit();

    if (!result.ok) throw new Error("duplicate-name");

    const dto = new CategoryDto({ categoryId, name: input.name });
    await validateDto(dto);
    return dto;
  }

  async list(): Promise<CategoryListDto> {
    const kv = await this.kv();
    const iter = kv.list<CategoryRow>({ prefix: ["categories"] });
    const dtos: CategoryDto[] = [];
    for await (const { value } of iter) {
      dtos.push(new CategoryDto({ categoryId: value.categoryId, name: value.name }));
    }
    dtos.sort((a, b) => a.name.localeCompare(b.name));
    const dto = new CategoryListDto({ categorys: dtos });
    await validateDto(dto);
    return dto;
  }

  async get(categoryId: string): Promise<CategoryDto> {
    const kv = await this.kv();
    const entry = await kv.get<CategoryRow>(["categories", categoryId]);
    if (entry.value === null) throw new Error("not-found");
    const dto = new CategoryDto({
      categoryId: entry.value.categoryId,
      name: entry.value.name,
    });
    await validateDto(dto);
    return dto;
  }
}
