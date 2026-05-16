export const formatWhatsappPhone = (phone) => {

  if (!phone) return "";

  // supprimer tout sauf chiffres
  phone = phone.replace(/\D/g, "");

  // 0612345678 → 212612345678
  if (phone.startsWith("0")) {
    return "212" + phone.substring(1);
  }

  // déjà 212
  if (phone.startsWith("212")) {
    return phone;
  }

  return phone;
};