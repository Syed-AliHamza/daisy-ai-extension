(function() {
  'use strict';

  if (!window.location.href.includes('daisy.daythree.ai')) return;

  const captureBtn = document.createElement('button');
  captureBtn.id = 'celcomdigi-capture-btn';
  captureBtn.innerHTML = '🎫 Capture Ticket Data';
  captureBtn.style.cssText = `
    position: fixed;
    bottom: 50px;
    left: 50px;
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

  function extractTicketData() {
    const ticketData = {
      issueFoundAt: '',
      ticketId: '',
      category: '',
      categoryYou: '',
      issueType: 'One-Off / Intermittent Issues',
      description: '',
      response: '',
    };

    const ticketIdElem = document.querySelector('#ticketID');
    if (ticketIdElem) {
      ticketData.ticketId = ticketIdElem.value.trim();
    }

    let errorTypeFound = false;
    const allParagraphs = document.querySelectorAll('p');

    allParagraphs.forEach(p => {
      const text = p.textContent.trim();

      if (!errorTypeFound && text === 'Error Type') {
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

    if (!errorTypeFound) {
      const scenarioElem = document.querySelector('#Scenario');
      if (scenarioElem) {
        ticketData.category = scenarioElem.value.trim();
      }
    }

    allParagraphs.forEach(p => {
      const text = p.textContent.trim();

      if (!ticketData.description && text === 'Description') {
        const nextP = p.nextElementSibling;
        if (nextP && nextP.tagName === 'P') {
          const desc = nextP.textContent.trim();
          if (desc && desc !== 'No Data' && desc.length > 10) {
            ticketData.description = desc;
          }
        }
      }
    });

    if (!ticketData.description) {
      const descElem = document.querySelector('textarea[name="Description"]');
      if (descElem) {
        ticketData.description = descElem.value.trim();
      }
    }

    const chatContainer = document.querySelector('#chat-container_' + ticketData.ticketId);

    if (chatContainer) {
      const selfChats = chatContainer.querySelectorAll('.chat-self');

      if (selfChats.length > 0) {
        const lastSelfChat = selfChats[selfChats.length - 1];
        const chatBubble = lastSelfChat.querySelector('.chat-bubble');

        if (chatBubble) {
          const messageText = chatBubble.innerText || chatBubble.textContent;
          const cleanText = messageText.trim();

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

    if (!ticketData.response) {
      const internalRemark = document.querySelector('#internal_remark');
      if (internalRemark) {
        const remarkText = internalRemark.innerText || internalRemark.textContent;
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

  captureBtn.onclick = () => {
    captureBtn.disabled = true;
    captureBtn.innerHTML = '⏳ Capturing...';

    const ticketData = extractTicketData();

    chrome.storage.local.set({ capturedTicket: ticketData }, () => {
      captureBtn.innerHTML = '✅ Captured! Open Extension';
      captureBtn.style.background = '#1a7a4a';

      setTimeout(() => {
        captureBtn.innerHTML = '🎫 Capture Ticket Data';
        captureBtn.style.background = 'linear-gradient(135deg, #FF6200, #cc4e00)';
        captureBtn.disabled = false;
      }, 3000);
    });
  };

  document.body.appendChild(captureBtn);
})();
