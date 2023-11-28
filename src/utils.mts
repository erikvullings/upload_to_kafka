/**
 * An AVRO-based JSON file often contains type annotations, e.g.
 * instead of { title: 'My title" }, it uses { title: { string: 'My title" }.
 * This function tries to get rid of them.
 *
 * @param input JSON object
 * @returns JSON object
 */
export function convertAvroToJson(input: any): any {
  if (Array.isArray(input)) {
    return input.map(convertAvroToJson);
  } else if (typeof input === 'object' && input !== null) {
    if (
      Object.keys(input).length === 1 &&
      ('array' in input ||
        'string' in input ||
        'double' in input ||
        'float' in input ||
        'int' in input ||
        'long' in input ||
        'boolean' in input ||
        'bytes' in input)
    ) {
      return input.array
        ? convertAvroToJson(input.array)
        : input.string ||
            input.double ||
            input.float ||
            input.int ||
            input.long ||
            input.boolean ||
            input.bytes;
    } else {
      const output: any = {};
      for (const key in input) {
        output[key] = convertAvroToJson(input[key]);
      }
      return output;
    }
  } else {
    return input;
  }
}
