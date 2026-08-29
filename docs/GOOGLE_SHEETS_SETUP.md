# Google Sheets Database Setup Guide

The College Token Management System uses Google Sheets as its primary data store. Follow these steps to set up your Google Cloud project and Google Sheet.

---

## Step 1: Create a Google Spreadsheet

1. Open [Google Sheets](https://sheets.google.com).
2. Create a new blank spreadsheet.
3. Name it: `SSEC Token Database`.
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                         This part is your GOOGLE_SHEET_ID
   ```

---

## Step 2: Create a Google Cloud Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `ssec-token-system`).
3. Enable the **Google Sheets API**:
   - Go to **APIs & Services > Library**.
   - Search for **Google Sheets API** and click **Enable**.
4. Create a Service Account:
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > Service Account**.
   - Name it `sheets-service-account` and click **Create and Continue**.
   - Grant the role: **Editor** (or Sheets Editor).
   - Click **Done**.
5. Generate a Private Key:
   - Click on the created service account email.
   - Go to the **Keys** tab.
   - Click **Add Key > Create new key > JSON**.
   - Download the JSON key file.

---

## Step 3: Share the Spreadsheet with the Service Account

1. Open the downloaded JSON key file and copy the `client_email` value:
   `sheets-service-account@ssec-token-system.iam.gserviceaccount.com`
2. Open your Google Spreadsheet from Step 1.
3. Click the **Share** button (top right).
4. Paste the service account email and grant **Editor** access.
5. Uncheck "Notify people" and click **Share**.

---

## Step 4: Configure Backend Environment Variables

In `backend/.env`, set:

```env
GOOGLE_SHEET_ID="your_spreadsheet_id_here"
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account-email@your-project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0...YOUR_KEY...\n-----END RSA PRIVATE KEY-----\n"
```

> **Tip for GOOGLE_PRIVATE_KEY:**
> In the JSON file, `private_key` contains newline characters `\n`. Copy the entire string including quotes into your `.env` file.

---

## Step 5: Automated Initialization

When the backend starts, it automatically creates the necessary sheet tabs and column headers:

1. **Tokens** (ID, Token ID, Student Name, Register Number, Department, Parent Number, Student WhatsApp, Generated Date, Generated Time, Status, WhatsApp Status, PDF Reference, Created At, Updated At)
2. **Admins** (ID, Username, Password Hash, Role, Created At, Last Login)
3. **AuditLogs** (ID, Timestamp, Admin Username, Action, Target Token ID, Old Value, New Value, IP Address)
4. **Settings** (Key, Value) with initial `token_counter = 0`

No manual sheet formatting is required!
