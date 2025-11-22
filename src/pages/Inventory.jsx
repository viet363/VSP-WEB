import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table.jsx';
import api from '../api';

const headData = ['STT','ID','Sản phẩm','Kho','Tồn','Ngưỡng','Trạng thái','Hành động'];
const renderHead = (item, index) => <th key={index}>{item}</th>;

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState({ q: '', warehouseId: '' });
  const [warehouses, setWarehouses] = useState([]);

  const fetch = async () => {
    const [invRes, whRes] = await Promise.all([api.get('/inventory'), api.get('/warehouses')]);
    setRows(invRes.data);
    setWarehouses(whRes.data);
  };

  useEffect(()=>{ fetch(); }, []);

  const filtered = rows.filter(r => {
    const q = filter.q.trim().toLowerCase();
    if (q && !(r.Product_name || '').toLowerCase().includes(q)) return false;
    if (filter.warehouseId && Number(filter.warehouseId) !== Number(r.WarehouseId)) return false;
    return true;
  });

  const renderBody = (item, index) => {
    const statusClass = item.Stock <= item.Min_stock ? (item.Stock < item.Min_stock ? 'text-red-500' : 'text-yellow-600') : 'text-green-600';
    return (
      <tr key={item.Id}>
        <td>{index+1}</td>
        <td>{item.Id}</td>
        <td>{item.Product_name}</td>
        <td>{item.Warehouse_name}</td>
        <td className={statusClass}>{item.Stock}</td>
        <td>{item.Min_stock}</td>
        <td>{item.Stock <= item.Min_stock ? (item.Stock < item.Min_stock ? 'Thiếu' : 'Cảnh báo') : 'OK'}</td>
        <td>
          <button className="btn" onClick={()=>window.location.href=`/inventory/import?product=${item.ProductId}&warehouse=${item.WarehouseId}`}>Nhập</button>
          <button className="btn" onClick={()=>window.location.href=`/inventory/export?product=${item.ProductId}&warehouse=${item.WarehouseId}`}>Xuất</button>
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>Inventory</h2>
      </div>

      <div className="card filters" style={{marginBottom:12}}>
        <input placeholder="Tìm sản phẩm..." value={filter.q} onChange={e=>setFilter({...filter, q:e.target.value})}/>
        <select value={filter.warehouseId} onChange={e=>setFilter({...filter, warehouseId: e.target.value})}>
          <option value="">Tất cả kho</option>
          {warehouses.map(w=> <option key={w.Id} value={w.Id}>{w.Warehouse_name}</option>)}
        </select>
        <button className="btn" onClick={fetch}>Làm mới</button>
      </div>

      <div className="card">
        <div className="card__body">
          <Table limit="10" headData={headData} renderHead={renderHead} bodyData={filtered} renderBody={renderBody}/>
        </div>
      </div>
    </div>
  );
}
