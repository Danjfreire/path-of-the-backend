export type QueryResult<T> = {
  results: T[];
  page: number;
  nbPages: number;
  resultsPerPage: number;
  total: number;
};
