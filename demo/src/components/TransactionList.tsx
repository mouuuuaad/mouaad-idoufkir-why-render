import React, { useState } from 'react';
import { useWhyRender } from '@mouaad_idoufkir/why-render';

interface Transaction {
    id: string;
    type: 'buy' | 'sell';
    amount: number;
    timestamp: number;
}

export const TransactionList: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: '1', type: 'buy', amount: 0.5, timestamp: Date.now() },
        { id: '2', type: 'sell', amount: 1.2, timestamp: Date.now() - 10000 },
        { id: '3', type: 'buy', amount: 0.1, timestamp: Date.now() - 20000 },
    ]);

    const addTransaction = () => {
        const newTx: Transaction = {
            id: Date.now().toString(),
            type: Math.random() > 0.5 ? 'buy' : 'sell',
            amount: Math.random() * 2,
            timestamp: Date.now(),
        };
        // ISSUE: Creating new array reference triggers re-render of all children if not memoized
        setTransactions([newTx, ...transactions]);
    };

    useWhyRender({ transactionsCount: transactions.length }, 'TransactionList');

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-100">Recent Transactions</h2>
                <button
                    onClick={addTransaction}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                >
                    Add New
                </button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2">
                {transactions.map(tx => (
                    <TransactionItem key={tx.id} transaction={tx} />
                ))}
            </div>
        </div>
    );
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    // ISSUE: This component is cheap, but rendering 100s of them is expensive without memo
    useWhyRender({ transaction }, `TransactionItem:${transaction.id}`);

    return (
        <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded border border-slate-700/50">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${transaction.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="capitalize text-slate-300">{transaction.type}</span>
            </div>
            <div className="font-mono text-slate-200">{transaction.amount.toFixed(4)} BTC</div>
        </div>
    );
};
