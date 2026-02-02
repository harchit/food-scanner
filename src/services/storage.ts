import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanHistoryItem, Product, HalalAnalysis } from '../types';

const HISTORY_KEY = '@halal_scanner_history';
const MAX_HISTORY_ITEMS = 100;

export async function saveScanToHistory(
  product: Product,
  analysis: HalalAnalysis
): Promise<ScanHistoryItem> {
  const historyItem: ScanHistoryItem = {
    id: `${product.barcode}_${Date.now()}`,
    product,
    analysis,
    scannedAt: new Date(),
  };

  try {
    const existingHistory = await getScanHistory();

    // Check if this barcode was scanned recently (within last hour)
    const recentScan = existingHistory.find(
      item =>
        item.product.barcode === product.barcode &&
        new Date(item.scannedAt).getTime() > Date.now() - 3600000
    );

    if (recentScan) {
      // Update the existing scan instead of adding duplicate
      const updatedHistory = existingHistory.map(item =>
        item.id === recentScan.id ? historyItem : item
      );
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
      return historyItem;
    }

    // Add new item at the beginning
    const newHistory = [historyItem, ...existingHistory].slice(0, MAX_HISTORY_ITEMS);

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return historyItem;
  } catch (error) {
    console.error('Error saving scan to history:', error);
    throw error;
  }
}

export async function getScanHistory(): Promise<ScanHistoryItem[]> {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);

    if (!historyJson) {
      return [];
    }

    const history = JSON.parse(historyJson);

    // Convert date strings back to Date objects
    return history.map((item: any) => ({
      ...item,
      scannedAt: new Date(item.scannedAt),
    }));
  } catch (error) {
    console.error('Error getting scan history:', error);
    return [];
  }
}

export async function clearScanHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing scan history:', error);
    throw error;
  }
}

export async function removeScanFromHistory(id: string): Promise<void> {
  try {
    const history = await getScanHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
  } catch (error) {
    console.error('Error removing scan from history:', error);
    throw error;
  }
}

export async function getScanByBarcode(
  barcode: string
): Promise<ScanHistoryItem | null> {
  try {
    const history = await getScanHistory();
    return history.find(item => item.product.barcode === barcode) || null;
  } catch (error) {
    console.error('Error getting scan by barcode:', error);
    return null;
  }
}
