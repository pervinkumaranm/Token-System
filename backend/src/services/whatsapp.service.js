// src/services/whatsapp.service.js
// Non-blocking background WhatsApp sending service

const whatsappStatuses = new Map();

/**
 * Get current WhatsApp delivery status for a token.
 * Default is null (meaning never sent/requested).
 */
function getWhatsAppStatus(tokenId) {
  const cleanId = (tokenId || '').trim().toUpperCase();
  return whatsappStatuses.get(cleanId) || null;
}

/**
 * Set current WhatsApp delivery status for a token.
 */
function setWhatsAppStatus(tokenId, status) {
  const cleanId = (tokenId || '').trim().toUpperCase();
  whatsappStatuses.set(cleanId, status);
}

/**
 * Asynchronously send WhatsApp message in the background.
 * Returns immediately, does not block the caller.
 */
function sendWhatsAppBackground(tokenId) {
  const cleanId = (tokenId || '').trim().toUpperCase();
  
  // Set initial status to PENDING
  whatsappStatuses.set(cleanId, 'PENDING');

  // Perform background simulation (using standard Promise/setTimeout)
  // This executes outside the main request event loop thread
  Promise.resolve().then(() => {
    setTimeout(async () => {
      try {
        console.log(`[WhatsApp Background] Simulating delivery for token: ${cleanId}...`);
        
        // Simulating a 3% random failure rate
        const isSuccessful = Math.random() >= 0.03;
        
        if (isSuccessful) {
          whatsappStatuses.set(cleanId, 'SENT');
          console.log(`[WhatsApp Background] Delivery SUCCESS for token: ${cleanId}`);
        } else {
          whatsappStatuses.set(cleanId, 'FAILED');
          console.warn(`[WhatsApp Background] Delivery FAILED for token: ${cleanId}`);
        }
      } catch (err) {
        console.error(`[WhatsApp Background] Unexpected error for token: ${cleanId}`, err);
        whatsappStatuses.set(cleanId, 'FAILED');
      }
    }, 3000); // 3-second simulated network delay
  });
}

module.exports = {
  getWhatsAppStatus,
  setWhatsAppStatus,
  sendWhatsAppBackground
};
