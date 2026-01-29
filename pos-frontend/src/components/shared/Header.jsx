import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaReceipt } from "react-icons/fa6";
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../../redux/slices/appSlice";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
      {/* LOGO */}
      <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer">
        <img src={logo} className="h-8 w-8" alt="restro logo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] tracking-wide">
          FryDate Cafe
        </h1>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-4">
        {/* Dashboard - visible to all authenticated users */}
        <div
          onClick={() => navigate("/dashboard")}
          className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer hover:bg-orange-500/20 hover:text-orange-500 transition-all group"
          title="Dashboard"
        >
          <MdDashboard className="text-[#f5f5f5] text-2xl group-hover:text-orange-500" />
        </div>

        {/* Receipts - visible to all authenticated users */}
        <div
          onClick={() => navigate("/receipts")}
          className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer hover:bg-orange-500/20 hover:text-orange-500 transition-all group"
          title="Receipts"
        >
          <FaReceipt className="text-[#f5f5f5] text-2xl group-hover:text-orange-500" />
        </div>

        <div className="flex items-center gap-3 cursor-pointer bg-[#1f1f1f] py-2 px-4 rounded-[15px] border border-white/5">
          <FaUserCircle className="text-[#f5f5f5] text-3xl" />
          <div className="flex flex-col items-start mr-2">
            <h1 className="text-sm text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "User"}
            </h1>
            <p className="text-[10px] text-[#ababab] font-medium uppercase tracking-wider">
              {userData.role || "Staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
