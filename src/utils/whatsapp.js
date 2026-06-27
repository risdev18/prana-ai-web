export const getWhatsAppLink = (phone, message = "") => {
  if (!phone) return null;
  
  // Remove spaces, dashes, brackets, and non-digits
  let cleanedPhone = phone.replace(/\D/g, '');
  
  if (cleanedPhone.length === 0) return null;

  // Assume India (+91) if length is 10
  if (cleanedPhone.length === 10) {
    cleanedPhone = `91${cleanedPhone}`;
  } else if (cleanedPhone.startsWith('0') && cleanedPhone.length === 11) {
    cleanedPhone = `91${cleanedPhone.slice(1)}`;
  }

  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;
};
