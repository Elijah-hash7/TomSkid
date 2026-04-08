/**
 * Simple keyword-based bot response logic.
 * Cleans user message and returns a predefined response.
 */
export function getBotResponse(message: string): string {
  const msg = message.toLowerCase().trim();
  const compactMsg = msg.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const greetingOnlyPattern = /^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening))( there)?$/

  if (greetingOnlyPattern.test(compactMsg)) {
    return "Hi! I'm your friendly bot assistant. How can I help you today?";
  }

  if (msg.includes("how are you")) {
    return "I'm doing well, thank you for asking!";
  }

  if (msg.includes("what is tomskid")) {
    return "Tomskid is a company that provides eSIMs to travelers.";
  }

  if (msg.includes("imei")) {
    return "Your IMEI is a unique identifier for your device. You can find it by dialing *#06# on your phone.";
  }

  


  if (msg.includes("cost") || msg.includes("price") || msg.includes("pricing")) {
    return "Our pricing depends on your plan. Would you like to view our pricing page?";
  }

  if (msg.includes("thank you") || msg.includes("thanks") || msg.includes("goodbye") || msg.includes("bye")) {
    return "Goodbye👋🏽! Have a great day!";
  }

  if (msg.includes("contact") || msg.includes("support") || msg.includes("help")) {
    return "You can contact us via WhatsApp on +2349132560731";
  }

  if (msg.includes("question")) {
    return "Sure, please go ahead and ask your question.";
  }

  if (msg.includes("name") || msg.includes("who are you")) {
    return "I'm your friendly bot assistant 🤖.";
  }

  if (msg.includes("compatible") || msg.includes("devices") || msg.includes("work on my phone")) {
    return "Most modern iPhones (XS and later) and Android devices support eSIM. Please check your device settings to confirm eSIM compatibility.";
  }

  if (msg.includes("refund") || msg.includes("cancel") || msg.includes("money back")) {
    return "We offer refunds for unactivated eSIMs within 7 days of purchase. Please contact support with your order ID for assistance.";
  }

  if (msg.includes("network") || msg.includes("coverage") || msg.includes("t-mobile") || msg.includes("verizon")) {
    return "Our US eSIMs typically run on top networks like T-Mobile or Verizon to ensure the best coverage during your stay.";
  }
  
  return "I'm sorry, I didn't understand that. Can you please rephrase or contact our support team?";
}
