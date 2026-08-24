import AsyncStorage from "@react-native-async-storage/async-storage";

interface ReadLocalRecordsOptions<T> {
  key: string;
  initialRecords: readonly T[];
  isRecord: (value: unknown) => value is T;
}

export const readLocalRecords = async <T>({
  key,
  initialRecords,
  isRecord,
}: ReadLocalRecordsOptions<T>): Promise<readonly T[]> => {
  const serializedRecords = await AsyncStorage.getItem(key);
  if (!serializedRecords) return initialRecords;

  let parsedRecords: unknown;
  try {
    parsedRecords = JSON.parse(serializedRecords);
  } catch {
    await AsyncStorage.removeItem(key);
    return initialRecords;
  }

  if (!Array.isArray(parsedRecords) || !parsedRecords.every(isRecord)) {
    await AsyncStorage.removeItem(key);
    return initialRecords;
  }

  return parsedRecords;
};

export const writeLocalRecords = async <T>(
  key: string,
  records: readonly T[],
): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(records));
};
