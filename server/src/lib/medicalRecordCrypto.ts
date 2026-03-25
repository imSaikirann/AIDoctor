import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

type EncryptedPayload = {
  v: 1;
  iv: string;
  tag: string;
  data: string;
};

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const source = process.env.MEDICAL_RECORDS_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!source) {
    throw new Error(
      "Missing MEDICAL_RECORDS_ENCRYPTION_KEY or JWT_SECRET. Cannot encrypt medical records."
    );
  }

  return createHash("sha256").update(source).digest();
}

export function encryptMedicalRecordContent(plainText: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    v: 1,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };

  return JSON.stringify(payload);
}

export function decryptMedicalRecordContent(cipherText: string): string {
  const payload = JSON.parse(cipherText) as EncryptedPayload;
  if (!payload || payload.v !== 1 || !payload.iv || !payload.tag || !payload.data) {
    throw new Error("Invalid encrypted medical record payload");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(payload.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
