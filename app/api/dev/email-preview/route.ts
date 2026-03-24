export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import ejs from "ejs";
import { NextResponse } from "next/server";

type TemplateName =
  | "welcome"
  | "verification-otp"
  | "verification-link"
  | "reset-password"
  | "funding-approved";

const allowedTemplates = new Set<TemplateName>([
  "welcome",
  "verification-otp",
  "verification-link",
  "reset-password",
  "funding-approved",
]);

function isPreviewAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_EMAIL_PREVIEW === "true";
}

function getBaseData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    appName: "PayMyFees",
    appUrl,
    fullName: "John",
    otp: "123456",
    verificationUrl: `${appUrl}/auth/verify/link?token=sample-token`,
    loginUrl: `${appUrl}/auth/login`,
    dashboardUrl: `${appUrl}/dashboard`,
    amount: "₦500,000",
    schoolName: "University of Lagos",
  };
}

function getTemplateDefaults(template: TemplateName) {
  switch (template) {
    case "welcome":
      return { fullName: "John" };
    case "verification-otp":
      return { fullName: "John", otp: "903117" };
    case "verification-link":
      return { fullName: "John" };
    case "reset-password":
      return { fullName: "John" };
    case "funding-approved":
      return {
        fullName: "John",
        amount: "₦500,000",
        plan: "6 months",
        schoolName: "University of Lagos",
      };
    default:
      return {};
  }
}

function safeJsonParse(value: string | null): Record<string, any> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch {
    return {};
  }
}

async function renderEmail(template: TemplateName, customData: Record<string, any>) {
  const templatePath = path.join(process.cwd(), "views", "emails", `${template}.ejs`);
  await fs.promises.access(templatePath);

  const data = {
    ...getBaseData(),
    ...getTemplateDefaults(template),
    ...customData,
  };

  return ejs.renderFile(templatePath, data);
}

export async function GET(req: Request) {
  if (!isPreviewAllowed()) {
    return NextResponse.json({ error: "Email preview is disabled" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const templateParam = (searchParams.get("template") || "welcome") as TemplateName;

  if (!allowedTemplates.has(templateParam)) {
    return NextResponse.json(
      {
        error: "Invalid template",
        allowedTemplates: Array.from(allowedTemplates),
      },
      { status: 400 },
    );
  }

  const customData = safeJsonParse(searchParams.get("data"));

  try {
    const html = await renderEmail(templateParam, customData);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to render template",
        template: templateParam,
        message: error?.message || "Unknown render error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!isPreviewAllowed()) {
    return NextResponse.json({ error: "Email preview is disabled" }, { status: 403 });
  }

  let body: { template?: TemplateName; data?: Record<string, any> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const template = body.template || "welcome";
  if (!allowedTemplates.has(template)) {
    return NextResponse.json(
      {
        error: "Invalid template",
        allowedTemplates: Array.from(allowedTemplates),
      },
      { status: 400 },
    );
  }

  try {
    const html = await renderEmail(template, body.data || {});
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to render template",
        template,
        message: error?.message || "Unknown render error",
      },
      { status: 500 },
    );
  }
}
