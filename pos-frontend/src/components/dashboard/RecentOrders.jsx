import React, { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getOrders } from "../../https/index";
import { formatDateAndTime } from "../../utils";

const RecentOrders = () => {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: resData, isError, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => getOrders({ page, limit }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <div className="text-white p-8 text-center bg-[#262626] rounded-xl">Loading orders...</div>;
  if (isError) {
    enqueueSnackbar("Something went wrong!", { variant: "error" });
    return <div className="text-red-500 p-8 text-center bg-[#262626] rounded-xl">Error loading orders</div>;
  }

  const ordersList = resData?.data?.data || [];
  const pagination = resData?.data?.pagination || { totalPages: 1, total: 0 };

  return (
    <div className="container mx-auto bg-[#262626] p-6 rounded-2xl border border-white/5 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#f5f5f5] text-xl font-black tracking-tight uppercase">
          Recent Orders
        </h2>
        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
          Total: {pagination.total}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left text-[#f5f5f5]">
          <thead className="bg-[#1a1a1a] text-[#ababab] border-b border-white/10 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Items</th>
              <th className="p-4">Table No</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-center">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ordersList.map((order, index) => (
              <tr
                key={order._id}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-4 font-mono text-sm text-gray-400">#{order.order_id}</td>
                <td className="p-4 font-bold text-sm">{order.customerDetails?.name || 'Guest'}</td>
                <td className="p-4 text-xs text-gray-500">{formatDateAndTime(order.timestamp || order.createdAt)}</td>
                <td className="p-4 text-xs font-bold bg-white/5 rounded my-2 inline-block mx-4">{order.items.length} Items</td>
                <td className="p-4 text-sm text-center font-mono">{order.table || '0'}</td>
                <td className="p-4 font-black text-orange-500 font-mono">PKR {order.total_amount}</td>
                <td className="p-4 text-center">
                  <span className="text-[10px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                    {order.paymentMethod}
                  </span>
                </td>
              </tr>
            ))}
            {ordersList.length === 0 && (
              <tr>
                <td colSpan="7" className="p-12 text-center text-gray-600 uppercase tracking-widest text-xs font-bold">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-xs font-black transition-all ${page === i + 1 ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
