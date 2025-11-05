import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  FileDown,
  Upload,
  Phone,
} from "lucide-react";

interface WalletData {
  totalSales: number;
  commissions: number;
  netPayouts: number;
  pending: number;
  available: number;
}

interface Payout {
  id: string;
  amount: number;
  date: string;
  status: "pending" | "processed" | "completed" | "failed";
  method: "mpesa" | "bank";
  reference: string;
}

interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  commission: number;
  netAmount: number;
  date: string;
  status: string;
}

const FinancePage = () => {
  const [walletData] = useState<WalletData>({
    totalSales: 250000,
    commissions: 25000,
    netPayouts: 200000,
    pending: 15000,
    available: 10000,
  });

  const [payouts] = useState<Payout[]>([
    {
      id: "PAY-001",
      amount: 50000,
      date: "2025-11-01",
      status: "completed",
      method: "mpesa",
      reference: "MPESA123456",
    },
    {
      id: "PAY-002",
      amount: 45000,
      date: "2025-10-28",
      status: "completed",
      method: "bank",
      reference: "BANK789012",
    },
    {
      id: "PAY-003",
      amount: 15000,
      date: "2025-11-05",
      status: "pending",
      method: "mpesa",
      reference: "MPESA345678",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      id: "TXN-001",
      orderId: "ORD-001",
      amount: 8500,
      commission: 850,
      netAmount: 7650,
      date: "2025-11-05",
      status: "settled",
    },
    {
      id: "TXN-002",
      orderId: "ORD-002",
      amount: 12000,
      commission: 1200,
      netAmount: 10800,
      date: "2025-11-04",
      status: "settled",
    },
    {
      id: "TXN-003",
      orderId: "ORD-003",
      amount: 6500,
      commission: 650,
      netAmount: 5850,
      date: "2025-11-04",
      status: "pending",
    },
  ]);

  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [withdrawalMethod, setWithdrawalMethod] = useState<"mpesa" | "bank">("mpesa");
  const [mpesaNumber, setMpesaNumber] = useState("");

  const handleWithdrawal = () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      alert("Please enter a valid withdrawal amount");
      return;
    }
    if (withdrawalMethod === "mpesa" && !mpesaNumber) {
      alert("Please enter your M-Pesa number");
      return;
    }
    alert(`Withdrawal request submitted: KES ${withdrawalAmount} via ${withdrawalMethod.toUpperCase()}`);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      processed: { label: "Processed", className: "bg-blue-100 text-blue-800" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      failed: { label: "Failed", className: "bg-red-100 text-red-800" },
      settled: { label: "Settled", className: "bg-green-100 text-green-800" },
    };
    const { label, className } = config[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Finance</h1>
          <p className="text-sm text-netflix-light-gray mt-1">
            See your money, understand your earnings, and withdraw easily
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
            <FileDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-netflix-medium-gray text-green-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-netflix-light-gray mb-1">Total Sales</div>
          <div className="text-2xl font-bold text-white">
            KES {walletData.totalSales.toLocaleString()}
          </div>
        </div>

        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-netflix-medium-gray text-yellow-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-netflix-light-gray mb-1">Commissions</div>
          <div className="text-2xl font-bold text-white">
            KES {walletData.commissions.toLocaleString()}
          </div>
          <div className="text-xs text-netflix-light-gray mt-1">10% platform fee</div>
        </div>

        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-netflix-medium-gray text-blue-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-netflix-light-gray mb-1">Net Payouts</div>
          <div className="text-2xl font-bold text-white">
            KES {walletData.netPayouts.toLocaleString()}
          </div>
        </div>

        <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-netflix-medium-gray text-purple-400">
              <ArrowDownCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-sm text-netflix-light-gray mb-1">Available</div>
          <div className="text-2xl font-bold text-green-400">
            KES {walletData.available.toLocaleString()}
          </div>
          <div className="text-xs text-netflix-light-gray mt-1">Ready to withdraw</div>
        </div>
      </div>

      {/* Withdrawal Request */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Withdrawal Request</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">Withdrawal Amount (KES)</label>
              <Input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
              />
              <p className="text-xs text-netflix-light-gray mt-1">
                Available: KES {walletData.available.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-white text-sm mb-2 block">Withdrawal Method</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="mpesa"
                    checked={withdrawalMethod === "mpesa"}
                    onChange={(e) => setWithdrawalMethod(e.target.value as "mpesa" | "bank")}
                    className="mr-2"
                  />
                  <span className="text-white">M-Pesa</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="bank"
                    checked={withdrawalMethod === "bank"}
                    onChange={(e) => setWithdrawalMethod(e.target.value as "mpesa" | "bank")}
                    className="mr-2"
                  />
                  <span className="text-white">Bank Transfer</span>
                </label>
              </div>
            </div>

            {withdrawalMethod === "mpesa" && (
              <div>
                <label className="text-white text-sm mb-2 block flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  M-Pesa Number
                </label>
                <Input
                  type="tel"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="bg-netflix-medium-gray border-netflix-medium-gray text-white placeholder:text-netflix-light-gray focus:border-netflix-red"
                />
              </div>
            )}

            <Button
              onClick={handleWithdrawal}
              className="w-full bg-netflix-red hover:bg-[#c11119] text-white font-semibold"
            >
              Request Withdrawal
            </Button>
          </div>

          <div className="bg-netflix-medium-gray rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Transaction Fees Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-netflix-light-gray">
                <span>Platform Commission</span>
                <span className="text-white">10%</span>
              </div>
              <div className="flex justify-between text-netflix-light-gray">
                <span>M-Pesa Fee</span>
                <span className="text-white">KES 0</span>
              </div>
              <div className="flex justify-between text-netflix-light-gray">
                <span>Bank Transfer Fee</span>
                <span className="text-white">KES 50</span>
              </div>
              <div className="border-t border-netflix-medium-gray pt-2 mt-2">
                <div className="flex justify-between text-white font-semibold">
                  <span>Net Amount</span>
                  <span>KES {walletData.netPayouts.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray overflow-hidden">
        <div className="p-6 border-b border-netflix-medium-gray">
          <h2 className="text-xl font-semibold text-white">Payout History</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-netflix-medium-gray">
              <TableHead className="text-white">Payout ID</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Method</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id} className="border-netflix-medium-gray">
                <TableCell className="font-medium text-white">{payout.id}</TableCell>
                <TableCell className="font-semibold text-white">
                  KES {payout.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-white uppercase">{payout.method}</TableCell>
                <TableCell className="text-white">{new Date(payout.date).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(payout.status)}</TableCell>
                <TableCell className="text-netflix-light-gray font-mono text-sm">
                  {payout.reference}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Transaction History */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray overflow-hidden">
        <div className="p-6 border-b border-netflix-medium-gray flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Transaction History</h2>
          <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-netflix-medium-gray">
              <TableHead className="text-white">Transaction ID</TableHead>
              <TableHead className="text-white">Order ID</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Commission</TableHead>
              <TableHead className="text-white">Net Amount</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id} className="border-netflix-medium-gray">
                <TableCell className="font-medium text-white">{txn.id}</TableCell>
                <TableCell className="text-white">{txn.orderId}</TableCell>
                <TableCell className="text-white">KES {txn.amount.toLocaleString()}</TableCell>
                <TableCell className="text-netflix-light-gray">KES {txn.commission.toLocaleString()}</TableCell>
                <TableCell className="font-semibold text-white">KES {txn.netAmount.toLocaleString()}</TableCell>
                <TableCell className="text-white">{new Date(txn.date).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusBadge(txn.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Commission Insights */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Commission Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-netflix-medium-gray rounded-lg p-4">
            <div className="text-sm text-netflix-light-gray mb-1">Average Commission Rate</div>
            <div className="text-2xl font-bold text-white">10%</div>
            <div className="text-xs text-netflix-light-gray mt-1">Per transaction</div>
          </div>
          <div className="bg-netflix-medium-gray rounded-lg p-4">
            <div className="text-sm text-netflix-light-gray mb-1">Total Commissions</div>
            <div className="text-2xl font-bold text-white">
              KES {walletData.commissions.toLocaleString()}
            </div>
            <div className="text-xs text-netflix-light-gray mt-1">All time</div>
          </div>
          <div className="bg-netflix-medium-gray rounded-lg p-4">
            <div className="text-sm text-netflix-light-gray mb-1">Settlement Frequency</div>
            <div className="text-2xl font-bold text-white">Weekly</div>
            <div className="text-xs text-netflix-light-gray mt-1">Every Monday</div>
          </div>
        </div>
      </div>

      {/* Tax Info */}
      <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Tax Information</h2>
          <Button variant="outline" className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray">
            <Upload className="h-4 w-4 mr-2" />
            Upload Tax Documents
          </Button>
        </div>
        <p className="text-sm text-netflix-light-gray">
          Upload your tax identification documents for compliance purposes.
        </p>
      </div>
    </div>
  );
};

export default FinancePage;
