import React, { useEffect } from "react";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard"
  }, [])

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white overflow-y-auto">
      <div className="container mx-auto py-10 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back, Admin</p>
        </div>

        <div className="space-y-8">
          <Metrics />
          <RecentOrders />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
