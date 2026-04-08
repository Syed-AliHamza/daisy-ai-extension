// Content script for Daisy ticket page
// Injects a floating "Capture Ticket" button and extracts ticket data

(function() {
  'use strict';

  // Only run on Daisy ticket pages
  if (!window.location.href.includes('daisy.daythree.ai')) return;

  // Create floating capture button
  const captureBtn = document.createElement('button');
  captureBtn.id = 'celcomdigi-capture-btn';
  captureBtn.innerHTML = '🎫 Capture Ticket Data';
  captureBtn.style.cssText = `
    position: fixed;
    bottom: 50px;
    right: 50px;
    z-index: 999999;
    background: linear-gradient(135deg, #FF6200, #cc4e00);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255,98,0,0.3);
    transition: all 0.3s ease;
    font-family: 'Segoe UI', Arial, sans-serif;
  `;

  captureBtn.onmouseover = () => {
    captureBtn.style.transform = 'scale(1.05)';
    captureBtn.style.boxShadow = '0 6px 16px rgba(255,98,0,0.4)';
  };

  captureBtn.onmouseout = () => {
    captureBtn.style.transform = 'scale(1)';
    captureBtn.style.boxShadow = '0 4px 12px rgba(255,98,0,0.3)';
  };

  // Extract ticket data from the page
  function extractTicketData() {
    const ticketData = {
      issueFoundAt: '', // Always empty as requested
      ticketId: '',
      category: '',
      categoryYou: '',
      issueType: 'One-Off / Intermittent Issues', // Always set to this value
      description: '',
      response: '',
    };

    // Extract Ticket ID (hidden field #ticketID)
    const ticketIdElem = document.querySelector('#ticketID');
    if (ticketIdElem) {
      ticketData.ticketId = ticketIdElem.value.trim();
    }

    // Extract Category - Priority: Error Type from L1 data, then Scenario
    // In L1 data: label is in one <p>, value is in the next <p> (sibling)
    let errorTypeFound = false;

    // Search for all <p> tags
    const allParagraphs = document.querySelectorAll('p');

    allParagraphs.forEach(p => {
      const text = p.textContent.trim();

      // Check if this paragraph contains "Error Type" label
      if (!errorTypeFound && text === 'Error Type') {
        // The value is in the next sibling <p> tag
        const nextP = p.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          const errorType = nextP.textContent.trim();

          if (errorType && errorType !== '-' && errorType !== 'No Data' && errorType.length > 2) {
            ticketData.category = errorType;
            errorTypeFound = true;
          }
        }
      }
    });

    // If Error Type not found, use Scenario dropdown
    if (!errorTypeFound) {
      const scenarioElem = document.querySelector('#Scenario');
      if (scenarioElem) {
        ticketData.category = scenarioElem.value.trim();
      }
    }

    // Extract Description - In L1 data: label in one <p>, value in next <p>
    allParagraphs.forEach(p => {
      const text = p.textContent.trim();

      // Check if this paragraph contains "Description" label
      if (!ticketData.description && text === 'Description') {
        // The value is in the next sibling <p> tag
        const nextP = p.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          const desc = nextP.textContent.trim();

          if (desc && desc !== 'No Data' && desc.length > 10) {
            ticketData.description = desc;
          }
        }
      }
    });

    // Fallback: Try the main Description textarea
    if (!ticketData.description) {
      const descElem = document.querySelector('textarea[name="Description"]');
      if (descElem) {
        ticketData.description = descElem.value.trim();
      }
    }

    // Extract Response from chat messages
    // Find the chat container for this specific ticket
    const chatContainer = document.querySelector('#chat-container_' + ticketData.ticketId);

    if (chatContainer) {
      // Find all "chat-self" divs (messages from You)
      const selfChats = chatContainer.querySelectorAll('.chat-self');

      if (selfChats.length > 0) {
        // Get the last "You" message
        const lastSelfChat = selfChats[selfChats.length - 1];
        const chatBubble = lastSelfChat.querySelector('.chat-bubble');

        if (chatBubble) {
          // Get text content from the bubble
          const messageText = chatBubble.innerText || chatBubble.textContent;
          const cleanText = messageText.trim();

          // Filter out system messages and short/numeric values
          const isSystemMessage = cleanText.includes('Automate -') ||
                                  cleanText.includes('Send Messages') ||
                                  cleanText.includes('Update Internal Remarks') ||
                                  cleanText.length < 15 ||
                                  /^\d+$/.test(cleanText);

          if (cleanText && !isSystemMessage) {
            ticketData.response = cleanText;
          }
        }
      }
    }

    // Fallback: try to get from internal remarks section
    if (!ticketData.response) {
      const internalRemark = document.querySelector('#internal_remark');
      if (internalRemark) {
        const remarkText = internalRemark.innerText || internalRemark.textContent;
        // Extract only the message part (after "You")
        const lines = remarkText.split('\n');
        const filtered = lines.filter(line => {
          const trimmed = line.trim();
          return trimmed &&
                 trimmed !== 'You' &&
                 !trimmed.includes('Automate -') &&
                 !trimmed.includes('Send Messages') &&
                 !trimmed.includes('Update Internal Remarks') &&
                 trimmed.length >= 15 &&
                 !/^\d+$/.test(trimmed);
        });
        if (filtered.length > 0) {
          ticketData.response = filtered.join('\n').trim();
        }
      }
    }

    return ticketData;
  }

  // Handle button click
  captureBtn.onclick = () => {
    captureBtn.disabled = true;
    captureBtn.innerHTML = '⏳ Capturing...';

    const ticketData = extractTicketData();

    console.log('Captured ticket data:', ticketData);

    // Send data to popup
    chrome.storage.local.set({ capturedTicket: ticketData }, () => {
      // Show success feedback
      captureBtn.innerHTML = '✅ Captured! Open Extension';
      captureBtn.style.background = '#1a7a4a';

      console.log('Data saved to storage. Open the extension popup to see it auto-filled.');

      // Reset button after 3 seconds
      setTimeout(() => {
        captureBtn.innerHTML = '🎫 Capture Ticket Data';
        captureBtn.style.background = 'linear-gradient(135deg, #FF6200, #cc4e00)';
        captureBtn.disabled = false;
      }, 3000);
    });
  };

  // Add button to page
  document.body.appendChild(captureBtn);

  // Add helper button for debugging - Find response text
  // const helperBtn = document.createElement('button');
  // helperBtn.id = 'celcomdigi-helper-btn';
  // helperBtn.innerHTML = '🔍 Find Response';
  // helperBtn.style.cssText = `
  //   position: fixed;
  //   bottom: 70px;
  //   right: 20px;
  //   z-index: 999999;
  //   background: #6c757d;
  //   color: white;
  //   border: none;
  //   border-radius: 8px;
  //   padding: 10px 16px;
  //   font-size: 12px;
  //   font-weight: 600;
  //   cursor: pointer;
  //   box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  //   font-family: 'Segoe UI', Arial, sans-serif;
  // `;

  // helperBtn.onclick = () => {
  //   console.log('=== FINDING RESPONSE TEXT ===');
  //   console.log('Searching for elements containing response text...\n');

  //   // Search for text containing "Hi Team" or "Please advise"
  //   const searchTerms = ['Hi Team', 'Please advise', 'auto reload', 'CelcomDigi app'];

  //   const allElements = document.querySelectorAll('div, p, span, textarea, .note-editable, [contenteditable]');
  //   let found = false;

  //   allElements.forEach((elem, idx) => {
  //     const text = (elem.innerText || elem.textContent || elem.value || '').trim();

  //     for (const term of searchTerms) {
  //       if (text.includes(term) && text.length > 20 && text.length < 500) {
  //         console.log(`Found #${idx + 1}:`);
  //         console.log(`Element: ${elem.tagName}.${elem.className} #${elem.id}`);
  //         console.log(`Text: "${text.substring(0, 150)}..."`);
  //         console.log('---');
  //         found = true;
  //         break;
  //       }
  //     }
  //   });

  //   if (!found) {
  //     console.log('No response text found. Try typing your response first, then click this button.');
  //   }

  //   alert('Check console to see where response text was found!');
  // };

  // document.body.appendChild(helperBtn);

  console.log('CelcomDigi Ticket Logger: Buttons injected');
  console.log('Click "🔍 Find Fields" to see all available form fields');
})();
