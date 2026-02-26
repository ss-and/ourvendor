export type OrgType = "Production" | "Developer Sandbox" | "Full Sandbox" | "Partial Sandbox";

export interface SalesforceOrg {
  id: string;
  name: string;
  type: OrgType;
  domain: string;
  lastUsed: string;
  userCount: number;
  badge: string;
  badgeColor: string;
  dotColor: string;
  ringColor: string;
  borderActive: string;
  bgActive: string;
  textActive: string;
}

export const ORGS: SalesforceOrg[] = [
  {
    id: "prod",
    name: "本番環境",
    type: "Production",
    domain: "mycompany.my.salesforce.com",
    lastUsed: "2分前",
    userCount: 42,
    badge: "本番",
    badgeColor: "bg-emerald-100 text-emerald-700",
    dotColor: "bg-emerald-400",
    ringColor: "ring-emerald-300",
    borderActive: "border-emerald-400",
    bgActive: "bg-emerald-50",
    textActive: "text-emerald-600",
  },
  {
    id: "dev",
    name: "開発サンドボックス",
    type: "Developer Sandbox",
    domain: "mycompany--dev.sandbox.my.salesforce.com",
    lastUsed: "1時間前",
    userCount: 5,
    badge: "SB/DEV",
    badgeColor: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-400",
    ringColor: "ring-blue-300",
    borderActive: "border-blue-400",
    bgActive: "bg-blue-50",
    textActive: "text-blue-600",
  },
  {
    id: "uat",
    name: "テスト環境 (UAT)",
    type: "Full Sandbox",
    domain: "mycompany--uat.sandbox.my.salesforce.com",
    lastUsed: "昨日",
    userCount: 12,
    badge: "UAT",
    badgeColor: "bg-violet-100 text-violet-700",
    dotColor: "bg-violet-400",
    ringColor: "ring-violet-300",
    borderActive: "border-violet-400",
    bgActive: "bg-violet-50",
    textActive: "text-violet-600",
  },
];
