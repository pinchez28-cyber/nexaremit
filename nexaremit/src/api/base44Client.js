const transactions = [
  { id: "tx-001", recipient_name: "Amara Okafor", destination_country: "Nigeria", currency: "USD", send_amount: 520, status: "completed", created_date: "May 14" },
  { id: "tx-002", recipient_name: "Daniel Mwangi", destination_country: "Kenya", currency: "GBP", send_amount: 230, status: "completed", created_date: "May 12" },
  { id: "tx-003", recipient_name: "Efua Mensah", destination_country: "Ghana", currency: "EUR", send_amount: 410, status: "completed", created_date: "May 10" },
  { id: "tx-004", recipient_name: "Amara Okafor", destination_country: "Nigeria", currency: "USD", send_amount: 180, status: "processing", created_date: "May 09" },
  { id: "tx-005", recipient_name: "Kofi Boateng", destination_country: "Ghana", currency: "USD", send_amount: 690, status: "completed", created_date: "May 06" }
];

export const base44 = {
  entities: {
    Transaction: {
      async list() {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return transactions;
      }
    }
  }
};
