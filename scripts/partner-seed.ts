/* Demo Partner Portal accounts for two publishers already in the catalogue. Password for both: torii-demo */
import { hashPassword } from "../lib/password";
import { PARTNER_TERMS } from "../lib/config";
import type { PartnerOrg, PartnerUser } from "../lib/types";

export function partnerSeed(t: (daysAgo: number) => string) {
  const org = (id: string, publisherId: string, name: string, nameJa: string, website: string, contactName: string, days: number): PartnerOrg => ({
    id, publisherId, name, nameJa, country: "Japan", website, contactName, email: `rights@${publisherId}.example`, verified: true,
    agreementVersion: PARTNER_TERMS.version, agreementAcceptedAt: t(days), createdAt: t(days),
  });
  const partners: PartnerOrg[] = [
    org("org_shueisha", "shueisha", "Shueisha", "集英社", "https://www.shueisha.co.jp", "Haruka Sato", 110),
    org("org_kodansha", "kodansha", "Kodansha", "講談社", "https://www.kodansha.co.jp", "Kenji Mori", 95),
  ];
  // Fixed salts keep the seed output stable between runs.
  const partnerUsers: PartnerUser[] = [
    { id: "pu_shueisha", orgId: "org_shueisha", email: "partner@shueisha.example", name: "Haruka Sato", role: "owner",
      passwordHash: hashPassword("torii-demo", "5eed5hue15ha0001"), createdAt: t(110), lastLoginAt: null },
    { id: "pu_kodansha", orgId: "org_kodansha", email: "partner@kodansha.example", name: "Kenji Mori", role: "owner",
      passwordHash: hashPassword("torii-demo", "5eedk0dan5ha0001"), createdAt: t(95), lastLoginAt: null },
  ];
  return { partners, partnerUsers, submissions: [] };
}
