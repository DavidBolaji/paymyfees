export const runtime = "nodejs"; // force Node runtime so googleapis works

import { google } from "googleapis";
import { NextResponse } from "next/server";
import { asyncHandler } from "@/src/middleware/errorHandler";
import { lenientRateLimiter } from "@/src/middleware/rateLimiter";

export const POST = asyncHandler(async (req: Request): Promise<NextResponse> => {
  await lenientRateLimiter(req);
  
  const body = await req.json();

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          body.role,
          body.fullName,
          body.email,
          body.phone,
          body.institution,
          body.loanAmount,
        ],
      ],
    },
  });

  return NextResponse.json({ success: true });
});
