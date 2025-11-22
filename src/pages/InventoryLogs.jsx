import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table.jsx';
import api from '../api';

const headData = ['STT','ID','Sản phẩm','Kho','Loại','Số lượng','Tồn sau','Ghi chú','Ngày'];

const renderHead = (h, i) => <th key={i}>{h}</th>;

export default function InventoryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      // SỬA Ở ĐÂY: đổi từ '/inventory/logs' thành '/inventory/log'
      const res = await api.get('/inventory/log');
      console.log('Logs data:', res.data);
      setLogs(res.data);
    } catch (err) { 
      console.error('Error fetching logs:', err);
      setError('Không thể tải dữ liệu nhật ký');
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchLogs(); 
  }, []);

  const renderBody = (item, index) => (
    <tr key={item.Id}>
      <td>{index + 1}</td>
      <td>{item.Id}</td>
      <td>{item.Product_name}</td>
      <td>{item.Warehouse_name}</td>
      <td>
        <span className={`badge ${item.Change_type === 'IN' ? 'badge--success' : 'badge--danger'}`}>
          {item.Change_type === 'IN' ? 'NHẬP' : 'XUẤT'}
        </span>
      </td>
      <td>{item.Quantity}</td>
      <td>{item.Current_stock}</td>
      <td style={{maxWidth: '200px'}}>{item.Note || 'Không có'}</td>
      <td>{new Date(item.Created_at).toLocaleString()}</td>
    </tr>
  );

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error) return (
    <div>
      <h2>Inventory Logs</h2>
      <div className="alert alert-danger">{error}</div>
      <button onClick={fetchLogs} className="btn btn-primary">Thử lại</button>
    </div>
  );

  return (
    <div>
      <h2>Inventory Logs</h2>
      <div className="card">
        <div className="card__header">
          <h3>Nhật ký tồn kho</h3>
          <button onClick={fetchLogs} className="btn btn-sm btn-primary">
            Làm mới
          </button>
        </div>
        <div className="card__body">
          {logs.length === 0 ? (
            <div className="text-center p-4">Không có dữ liệu nhật ký</div>
          ) : (
            <Table 
              limit="15" 
              headData={headData} 
              renderHead={renderHead} 
              bodyData={logs} 
              renderBody={renderBody}
            />
          )}
        </div>
      </div>
    </div>
  );
}