# CelcomDigi Ticket Logger — Chrome Extension

A Chrome extension for CelcomDigi L2 support agents to capture, log, and export resolved support tickets from the Daisy platform.

- **Version:** 1.0.0
- **Author:** Syed Ali Hamza — syedalihamza01@outlook.com
- **Platform:** Google Chrome (Manifest V3)

---

## Requirements

- Google Chrome browser (version 88 or later)
- Access to [https://daisy.daythree.ai](https://daisy.daythree.ai)
- No internet connection required after installation — works fully offline

---

## Installation Guide

### Step 1 — Download the Extension

1. Open this link in your browser: [https://github.com/Syed-AliHamza/daisy-ai-extension](https://github.com/Syed-AliHamza/daisy-ai-extension)
2. Click the green **"Code"** button.
3. Select **"Download ZIP"**.
4. Once downloaded, right-click the ZIP file → **Extract All** → choose a permanent location (e.g. `Documents\daisy-extension`).

> **Important:** Do not delete or move the extracted folder after installing. Chrome loads the extension directly from this folder.

---

### Step 2 — Open Chrome Extensions Page

1. Open **Google Chrome**.
2. In the address bar, type:
   ```
   chrome://extensions
   ```
   and press **Enter**.

---

### Step 3 — Enable Developer Mode

In the top-right corner of the Extensions page, toggle **Developer mode** to **ON**.

---

### Step 4 — Load the Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode).
2. In the file picker, navigate to the extracted folder (e.g. `Documents\daisy-extension`).
3. Select the folder and click **"Select Folder"**.

The extension will appear in your list as **"CelcomDigi Ticket Logger"**.

---

### Step 5 — Pin the Extension

1. Click the **puzzle piece icon** (Extensions) in the Chrome toolbar.
2. Find **CelcomDigi Ticket Logger** and click the **pin icon** next to it.

The extension icon will now always be visible in your toolbar.

---

## How to Use

### Capturing a Ticket from Daisy

1. Open a ticket on [https://daisy.daythree.ai](https://daisy.daythree.ai).
2. A floating **"Capture Ticket Data"** button will appear on the page.
3. Click it — the ticket data (ID, category, description, response) is captured automatically.
4. Click the extension icon in the toolbar to open the popup.
5. The form will be **auto-filled** with the captured data.
6. Review and edit the fields if needed, then click **Save Ticket**.

### Logging a Ticket Manually

1. Click the extension icon to open the popup.
2. Fill in the form fields manually.
3. Click **Save Ticket**.

### Exporting to Excel

1. Click the extension icon to open the popup.
2. Go to the **Records** tab to view saved tickets.
3. Click **Export to CSV**.
4. Open the downloaded `.csv` file in Microsoft Excel.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| The "Capture Ticket" button does not appear | Refresh the Daisy page. Make sure you are on `daisy.daythree.ai`. |
| Extension disappeared from toolbar | Go to `chrome://extensions` and check if it is still enabled. |
| Extension shows an error after PC restart | The folder may have been moved. Re-load it from its new location via `chrome://extensions` → Load unpacked. |
| Fields are empty after clicking Capture | The page layout may have changed. Contact Syed Ali Hamza at syedalihamza01@outlook.com. |

---

## Notes

- Each team member's tickets are stored **locally** on their own browser — data is not shared across devices.
- To transfer records to another computer, use the **Export to CSV** function and save the file.
- The extension only activates on `https://daisy.daythree.ai/*` pages.
- If the extension is updated, re-download the ZIP from [https://github.com/Syed-AliHamza/daisy-ai-extension](https://github.com/Syed-AliHamza/daisy-ai-extension) and repeat Steps 1 and 4 to get the latest version.

---

## Author

**Syed Ali Hamza**
Email: syedalihamza01@outlook.com
GitHub: [https://github.com/Syed-AliHamza](https://github.com/Syed-AliHamza)

For questions, issues, or feature requests, reach out via email or open an issue on the GitHub repository.

---

## License

This tool is intended for internal use by CelcomDigi L2 support agents only. Redistribution or use outside of CelcomDigi is not permitted without explicit approval.
