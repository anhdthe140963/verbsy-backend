import csvToJson from 'convert-csv-to-json';
export async function convertCsvToJson(filePath: string): Promise<any> {
  try {
    return await csvToJson.getJsonFromCsv(filePath);
  } catch (error) {
    throw error;
  }
}
