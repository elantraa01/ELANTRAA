import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface WhatsAppSubscriberData {
  id: string;
  phone: string;
  name?: string;
  source: string;
  isOptedIn: boolean;
  discountCode: string;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "whatsapp-subscribers.json");

function ensureDataFile(): WhatsAppSubscriberData[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const content = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("Failed to read whatsapp-subscribers.json:", err);
    return [];
  }
}

function writeDataFile(items: WhatsAppSubscriberData[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write whatsapp-subscribers.json:", err);
  }
}

/**
 * Normalizes phone numbers: removes non-digits, ensures international country code (default 91 for India)
 */
export function cleanPhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

export async function saveWhatsAppSubscriber({
  phone,
  name,
  source = "POPUP",
  discountCode = "ELANTRAAGOLD",
}: {
  phone: string;
  name?: string;
  source?: string;
  discountCode?: string;
}): Promise<{ subscriber: WhatsAppSubscriberData; isNew: boolean }> {
  const formattedPhone = cleanPhoneNumber(phone);
  const now = new Date().toISOString();

  // 1. Always update/save in fallback JSON file
  const localItems = ensureDataFile();
  const existingIdx = localItems.findIndex((s) => s.phone === formattedPhone);

  let resultSubscriber: WhatsAppSubscriberData;
  let isNew = false;

  if (existingIdx >= 0) {
    localItems[existingIdx].updatedAt = now;
    if (name && !localItems[existingIdx].name) {
      localItems[existingIdx].name = name;
    }
    localItems[existingIdx].isOptedIn = true;
    resultSubscriber = localItems[existingIdx];
  } else {
    isNew = true;
    resultSubscriber = {
      id: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      phone: formattedPhone,
      name: name?.trim() || undefined,
      source,
      isOptedIn: true,
      discountCode,
      createdAt: now,
      updatedAt: now,
    };
    localItems.unshift(resultSubscriber);
  }
  writeDataFile(localItems);

  // 2. Attempt Prisma DB persistence if database is connected
  try {
    const subscriberModel = (
      prisma as unknown as Record<
        string,
        {
          upsert?: (args: unknown) => Promise<Record<string, unknown>>;
        }
      >
    ).whatsAppSubscriber;

    if (subscriberModel && typeof subscriberModel.upsert === "function") {
      await subscriberModel.upsert({
        where: { phone: formattedPhone },
        update: {
          name: name?.trim() || undefined,
          isOptedIn: true,
          updatedAt: new Date(),
        },
        create: {
          phone: formattedPhone,
          name: name?.trim() || null,
          source,
          isOptedIn: true,
          discountCode,
        },
      });
    }
  } catch (dbErr) {
    // Database may be offline during local tests; local JSON ensures durability
    console.warn("DB save for WhatsApp subscriber skipped (file backup active):", (dbErr as Error).message);
  }

  return { subscriber: resultSubscriber, isNew };
}

export async function getWhatsAppSubscribers(): Promise<WhatsAppSubscriberData[]> {
  // Try DB first
  try {
    const subscriberModel = (
      prisma as unknown as Record<
        string,
        {
          findMany?: (args: unknown) => Promise<Record<string, unknown>[]>;
        }
      >
    ).whatsAppSubscriber;

    if (subscriberModel && typeof subscriberModel.findMany === "function") {
      const dbRecords = await subscriberModel.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (dbRecords && dbRecords.length > 0) {
        return dbRecords.map((r) => ({
          id: String(r.id),
          phone: String(r.phone),
          name: r.name ? String(r.name) : undefined,
          source: String(r.source || "POPUP"),
          isOptedIn: Boolean(r.isOptedIn),
          discountCode: String(r.discountCode || "ELANTRAAGOLD"),
          createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
          updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : String(r.updatedAt),
        }));
      }
    }
  } catch {
    // Fall back to file
  }

  return ensureDataFile();
}
