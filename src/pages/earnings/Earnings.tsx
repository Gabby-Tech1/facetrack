import React from "react";
import { ScrollArea } from "@radix-ui/themes";
import {
    DollarSign,
    Clock,
    Calendar,
    TrendingUp,
    Download,
    CreditCard,
    X,
} from "lucide-react";
import Sidebar from "../../components/sidebar/Sidebar";
import Header from "../../components/dashboard/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useData } from "../../contexts/DataContext";
import type { Lecturer } from "../../interfaces/user.interface"; // Added import
import { toast } from "sonner";

const Earnings: React.FC = () => {
    const { user } = useAuth();
    const { sessions, updateLecturer } = useData();
    const lecturer = user as Lecturer;

    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [paymentForm, setPaymentForm] = React.useState({
        provider: lecturer.paymentDetails?.provider || "MTN",
        accountName: lecturer.paymentDetails?.accountName || lecturer.name,
        accountNumber: lecturer.paymentDetails?.accountNumber || ""
    });

    // Filter sessions for this lecturer
    const mySessions = sessions.filter(s => s.creator.id === lecturer.id);
    const completedSessions = mySessions.filter((s) => s.status === "CLOSED");

    // Calculate stats
    const totalHours = completedSessions.reduce((acc, session) => {
        const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
        return acc + (duration / (1000 * 60 * 60));
    }, 0);

    const calculatedTotalEarnings = totalHours * lecturer.hourlyRate;

    // Group by month
    const earningsByMonth = completedSessions.reduce((acc, session) => {
        const month = new Date(session.startTime).toLocaleString('default', { month: 'long' });
        const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
        const hours = duration / (1000 * 60 * 60);
        const amount = hours * lecturer.hourlyRate;

        if (!acc[month]) {
            acc[month] = { month, hours: 0, amount: 0 };
        }
        acc[month].hours += hours;
        acc[month].amount += amount;
        return acc;
    }, {} as Record<string, { month: string; hours: number; amount: number }>);

    const monthlyEarnings = Object.values(earningsByMonth);
    // If no data, show empty state or keeping the array empty is fine.

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-950 px-4 sm:px-6 pt-6 pb-4">
                    <Header />
                </div>

                <ScrollArea type="auto" className="flex-1">
                    <div className="px-4 sm:px-6 pb-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
                                <p className="text-slate-500 dark:text-slate-400">Your earnings and payment history</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg transition-colors border border-slate-300 dark:border-slate-700">
                                <Download size={18} />
                                Export Report
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-green-600 dark:bg-green-700 border border-green-500 dark:border-green-600 rounded-xl p-5 shadow-lg shadow-green-900/20">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-green-100 opacity-90">Total Earnings</p>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <DollarSign size={20} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white">
                                    GH₵{calculatedTotalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-green-100 mt-1 opacity-80">All time</p>
                            </div>

                            <StatCard icon={Clock} label="Hours Worked" value={`${totalHours.toFixed(1)}h`} color="blue" />
                            <StatCard icon={TrendingUp} label="Hourly Rate" value={`GH₵${lecturer.hourlyRate || 0}`} color="purple" />
                            <StatCard icon={Calendar} label="Sessions" value={completedSessions.length} color="amber" />
                        </div>

                        {/* Monthly Breakdown */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-6 shadow-sm dark:shadow-none">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Monthly Breakdown</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                                            <th className="pb-3 font-medium">Month</th>
                                            <th className="pb-3 font-medium">Hours Worked</th>
                                            <th className="pb-3 font-medium">Rate</th>
                                            <th className="pb-3 font-medium">Amount</th>
                                            <th className="pb-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyEarnings.map((item, idx) => (
                                            <tr key={item.month} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <td className="py-4 text-slate-900 dark:text-white font-medium">{item.month}</td>
                                                <td className="py-4 text-slate-600 dark:text-slate-400">{item.hours.toFixed(1)} hours</td>
                                                <td className="py-4 text-slate-600 dark:text-slate-400">GH₵{lecturer.hourlyRate}/hr</td>
                                                <td className="py-4 text-green-600 dark:text-green-400 font-bold">GH₵{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="py-4">
                                                    <span
                                                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${idx === monthlyEarnings.length - 1 ? "bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-400" : "bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400"
                                                            }`}
                                                    >
                                                        {idx === monthlyEarnings.length - 1 ? "Pending" : "Paid"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Method</h2>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                                    <CreditCard size={24} />
                                </div>
                                <div>
                                    <p className="text-slate-900 dark:text-white font-semibold">
                                        Mobile Money - {lecturer.paymentDetails?.provider || "Not Set"}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {lecturer.paymentDetails?.accountNumber
                                            ? `**** **** ${lecturer.paymentDetails.accountNumber.slice(-4)}`
                                            : "No account linked"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="ml-auto text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                >
                                    Update
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
                                Payments are processed automatically at the end of each month.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
                {/* Payment Update Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Payment Method</h2>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Provider</label>
                                    <select
                                        value={paymentForm.provider}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="MTN">MTN Mobile Money</option>
                                        <option value="VODAFONE">Vodafone Cash</option>
                                        <option value="AIRTELTIGO">AirtelTigo Money</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Account Name</label>
                                    <input
                                        type="text"
                                        value={paymentForm.accountName}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={paymentForm.accountNumber}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                                        placeholder="024XXXXXXX"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (lecturer.role === "lecturer") {
                                            updateLecturer(lecturer.id, {
                                                paymentDetails: {
                                                    provider: paymentForm.provider as any,
                                                    accountName: paymentForm.accountName,
                                                    accountNumber: paymentForm.accountNumber
                                                }
                                            });
                                            toast.success("Payment details updated!");
                                            setShowPaymentModal(false);
                                        }
                                    }}
                                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Earnings;

// Stat Card
const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
}) => {
    const c: Record<string, string> = { blue: "bg-blue-600", purple: "bg-purple-600", amber: "bg-amber-600" };
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <div className={`p-2 ${c[color] || "bg-slate-600"} rounded-lg shadow-lg shadow-${color}-500/20`}>
                    <Icon size={18} className="text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
};
