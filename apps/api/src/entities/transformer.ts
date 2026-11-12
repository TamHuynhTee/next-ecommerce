// DB save bigint as string, need to convert to str on DB write, and return plain string on DB read
export const bigintTransformer = {
  to: (value: bigint | null) =>
    value === null || value === undefined ? value : value.toString(),

  from: (value: string | null) => value,
};
