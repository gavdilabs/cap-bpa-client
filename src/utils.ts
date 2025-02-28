import { QueryBuilder } from "./query-builder";

export function constructQuery(
  query: string | QueryBuilder | undefined | null,
): string {
  if (!query) return "";
  else if (typeof query === "string") {
    return query;
  }

  return query.build();
}
