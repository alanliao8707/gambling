import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import * as XLSX from "xlsx";
import { FaPlus, FaTrash, FaDownload } from "react-icons/fa";

export default function GamblingRecord() {
  const [records, setRecords] = useState(JSON.parse(localStorage.getItem("records")) || []);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    amount: "",
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "records"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(data);
      localStorage.setItem("records", JSON.stringify(data));

      // 自動更新 Excel 檔案
      saveToExcel(data);
    });

    return () => unsubscribe();
  }, []);

  const addRecord = async () => {
    if (!newRecord.name || !newRecord.amount) {
      alert("請輸入姓名和金額！");
      return;
    }

    const recordData = { ...newRecord, amount: parseFloat(newRecord.amount) };
    await addDoc(collection(db, "records"), recordData);
    setNewRecord({ date: newRecord.date, name: "", amount: "" });
  };

  const deleteRecord = async (id) => {
    const updatedRecords = records.filter(record => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem("records", JSON.stringify(updatedRecords));

    // 刪除後更新 Excel
    saveToExcel(updatedRecords);
  };

  const saveToExcel = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "賭局記錄");
    XLSX.writeFile(workbook, "賭局記錄.xlsx");
  };

  const exportToExcel = () => {
    saveToExcel(records);
  };

  const totalProfit = records
    .filter(record => record.date === newRecord.date)
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">📊 賭局記錄</h2>

        <div className="space-y-4">
          <label className="block text-gray-600 text-sm">📅 日期</label>
          <input
            type="date"
            className="border p-3 rounded w-full text-lg"
            value={newRecord.date}
            onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
          />

          <label className="block text-gray-600 text-sm">👤 姓名</label>
          <input
            type="text"
            className="border p-3 rounded w-full text-lg"
            placeholder="輸入姓名"
            value={newRecord.name}
            onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
          />

          <label className="block text-gray-600 text-sm">💰 輸贏金額</label>
          <input
            type="number"
            className="border p-3 rounded w-full text-lg"
            placeholder="輸入金額"
            value={newRecord.amount}
            onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
          />

          <button
            onClick={addRecord}
            className="w-full flex items-center justify-center bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition text-lg"
          >
            <FaPlus className="mr-2" /> 新增記錄
          </button>
        </div>

        <h3 className="text-xl font-semibold text-gray-700 mt-6 text-center">📅 今日總輸贏: 
          <span className={totalProfit >= 0 ? "text-green-600" : "text-red-600"}> {totalProfit} 元</span>
        </h3>

        <ul className="bg-gray-50 p-4 rounded-lg mt-3">
          {records.filter(record => record.date === newRecord.date).map((record) => (
            <li key={record.id} className="flex justify-between items-center border-b py-3 text-lg">
              <span>{record.name} - {record.amount} 元</span>
              <button onClick={() => deleteRecord(record.id)} className="text-red-500 hover:text-red-700">
                <FaTrash />
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={exportToExcel}
          className="w-full flex items-center justify-center bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition mt-4 text-lg"
        >
          <FaDownload className="mr-2" /> 下載 Excel
        </button>
      </div>
    </div>
  );
}

