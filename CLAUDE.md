# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Daisy AI** is a Chrome browser extension (Manifest V3) designed for CelcomDigi L2 support agents. It captures ticket data from the Daisy support platform (daisy.daythree.ai), allows manual ticket logging, and exports tickets to Excel-compatible CSV format.

## Architecture

### Component Structure

The extension follows a standard Chrome Extension MV3 architecture with three main components:

1. **[manifest.json](manifest.json)** - Extension configuration
   - Permissions: `storage`, `activeTab`
   - Host permissions: `https://daisy.daythree.ai/*`
   - Content script injection on Daisy platform pages

2. **[content.js](content.js)** - Content script (runs on daisy.daythree.ai pages)
   - Injects a floating "Capture Ticket" button on Daisy ticket pages
   - Extracts ticket data from the DOM using specific selectors
   - Stores captured data in `chrome.storage.local` under the key `capturedTicket`

3. **[popup.js](popup.js)** + **[popup.html](popup.html)** - Extension popup UI
   - Two-tab interface: "Log Ticket" and "Records"
   - Manages ticket storage in `chrome.storage.local` under the key `tickets`
   - Handles manual ticket entry, auto-fill from captured data, and CSV export

### Data Flow

```
Daisy Web Page (daisy.daythree.ai)
  ↓ [User clicks "Capture Ticket" button]
content.js extracts DOM data
  ↓ [Stores in chrome.storage.local.capturedTicket]
popup.js reads capturedTicket on open
  ↓ [Auto-fills form fields]
User reviews/edits and saves
  ↓ [Stored in chrome.storage.local.tickets array]
Export to CSV
```

### Data Extraction Logic (content.js)

The content script uses a priority-based approach to extract ticket information:

- **Ticket ID**: From hidden field `#ticketID`
- **Category**: Priority order:
  1. "Error Type" from L1 data (searches for `<p>` tag with text "Error Type", then reads value from next sibling `<p>`)
  2. Falls back to `#Scenario` dropdown
- **Description**: Priority order:
  1. "Description" from L1 data (searches for `<p>` tag with text "Description", then reads value from next sibling `<p>`)
  2. Falls back to `textarea[name="Description"]`
- **Response**: Priority order:
  1. Last message from chat container `#chat-container_{ticketId}` → `.chat-self` → `.chat-bubble`
  2. Falls back to `#internal_remark` text content
  3. Filters out system messages and short/numeric values
- **Issue Type**: Always defaults to "One-Off / Intermittent Issues"

### Storage Schema

```javascript
// chrome.storage.local.tickets (array)
[
  {
    srNo: 1,                    // Auto-incremented serial number
    date: "2026-04-08",         // YYYY-MM-DD format
    ticketId: "20260408-...",
    category: "eSIM Activation",
    catYou: "...",              // "Category According to You"
    issueType: "One-Off / Intermittent Issues",
    desc: "Description text",
    response: "Response text"
  },
  ...
]

// chrome.storage.local.capturedTicket (object, temporary)
{
  ticketId: "...",
  category: "...",
  categoryYou: "...",
  issueType: "One-Off / Intermittent Issues",
  description: "...",
  response: "...",
  issueFoundAt: ""  // Always empty
}
```

### CSV Export Format

The export function ([popup.js:166-234](popup.js#L166-L234)) generates a CSV file with UTF-8 BOM for Excel compatibility:

**Column order**:
1. Sr no
2. Date
3. Ticket Id
4. Category
5. Category According to you
6. Issue Type
7. Description
8. Response
9. Issue found at (always blank)

**Filename format**: `CelcomDigi_Tickets_YYYYMMDD.csv`

## Development

### File Structure

```
ticket-logger-extension/
├── manifest.json       # Extension configuration
├── popup.html          # Popup UI (inline CSS)
├── popup.js            # Popup logic & state management
├── content.js          # Content script for Daisy pages
├── icon.png            # Extension icon (128x128)
└── README.md
```

### Testing the Extension

1. **Load unpacked extension**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this directory

2. **Test content script**:
   - Navigate to any ticket page on `https://daisy.daythree.ai/`
   - Click the floating "🎫 Capture Ticket Data" button
   - Check browser console for extraction logs

3. **Test popup**:
   - Click the extension icon in Chrome toolbar
   - Verify auto-fill from captured data
   - Test manual ticket logging and export

### Modifying Data Extraction

When the Daisy platform DOM structure changes, update extraction logic in [content.js:43-175](content.js#L43-L175). Key selectors:

- Ticket ID: `#ticketID`
- Category: Search for `<p>Error Type</p>` or `#Scenario`
- Description: Search for `<p>Description</p>` or `textarea[name="Description"]`
- Response: `#chat-container_{ticketId} .chat-self .chat-bubble` or `#internal_remark`

### Serial Number Behavior

Serial numbers are auto-incremented and re-numbered when tickets are deleted ([popup.js:133-134](popup.js#L133-L134)). This ensures consecutive numbering without gaps.

## Known Constraints

- No build system or package manager - uses vanilla JavaScript
- No automated tests
- CSS is inline in [popup.html](popup.html)
- Extension works only on `https://daisy.daythree.ai/*` domain
- Captured data is temporary and cleared after auto-fill
