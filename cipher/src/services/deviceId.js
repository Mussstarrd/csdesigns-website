import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'cipher.deviceId';

/** Stable anonymous device id — the free-tier quota key. */
export async function getDeviceId() {
  let id = await AsyncStorage.getItem(KEY);
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(KEY, id);
  }
  return id;
}
