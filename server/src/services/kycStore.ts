import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'kyc_store.json');

function readStore(): Record<string, any> {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Error reading KYC store:', e);
    return {};
  }
}

function writeStore(obj: Record<string, any>) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing KYC store:', e);
  }
}

export function getKycStatus(accountId: string): boolean {
  const store = readStore();
  return !!store[accountId]?.kycVerified;
}

export function setKycStatus(accountId: string, payload: { kycVerified: boolean; name?: string; idNumber?: string; }): void {
  const store = readStore();
  store[accountId] = {
    ...(store[accountId] || {}),
    ...payload,
    updatedAt: Date.now()
  };
  writeStore(store);
}

export function listKyc(): Record<string, any> {
  return readStore();
}
