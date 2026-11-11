export const statusLabel: Record<string, string> = {
  new: "Новый — Юлия свяжется с вами", awaiting_payment: "Ожидает оплаты", paid: "Оплачен", completed: "Завершён", cancelled: "Отменён",
};
export const methodLabel: Record<string, string> = { invoice: "По договору и счёту", online: "Онлайн (ЮKassa)" };
export const rub = (n: number | null | undefined) => (n ? new Intl.NumberFormat("ru-RU").format(n) + " ₽" : "—");
