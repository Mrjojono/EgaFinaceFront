
export interface Transaction {
  id: string;
  date: string;
  label: string;
  receiver: string;
  sender: string;
  senderAccount: string;
  receiverAccount: string;
  amount: number;
  fees: number;
  status: string;
}
