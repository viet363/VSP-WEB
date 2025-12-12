import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table.jsx';
import api from '../api';

const headData = ['STT','ID','Sản phẩm','Kho','Loại','Số lượng','Tồn sau','Ghi chú','Ngày'];

const renderHead = (h, i) => <th key={i}>{h}</th>;

export default function InventoryLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warehouses, setWarehouses] = useState([]);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    searchTerm: '',
    warehouseId: '',
    changeType: '',
    dateRange: {
      start: '',
      end: ''
    },
    minQuantity: '',
    maxQuantity: ''
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/inventory/log');
      console.log('Logs data:', res.data);
      
      // Đảm bảo dữ liệu không bị null/undefined
      const processedLogs = res.data.map(item => ({
        ...item,
        Product_name: item.Product_name || 'Không có tên',
        Warehouse_name: item.Warehouse_name || 'Không có kho',
        Change_type: item.Change_type || 'IN',
        Quantity: parseInt(item.Quantity) || 0,
        Current_stock: parseInt(item.Current_stock) || 0,
        Note: item.Note || 'Không có',
        Created_at: item.Created_at || new Date().toISOString()
      }));
      
      setLogs(processedLogs);
      setFilteredLogs(processedLogs);
      
      // Lấy danh sách kho để filter
      fetchWarehouses();
    } catch (err) { 
      console.error('Error fetching logs:', err);
      setError('Không thể tải dữ liệu nhật ký');
    }
    setLoading(false);
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  useEffect(() => { 
    fetchLogs(); 
  }, []);

  // Áp dụng bộ lọc khi filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [filters, logs]);

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    let result = [...logs];
    
    // Lọc theo từ khóa tìm kiếm
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(log => 
        log.Product_name.toLowerCase().includes(searchTerm) ||
        log.Note.toLowerCase().includes(searchTerm) ||
        log.Warehouse_name.toLowerCase().includes(searchTerm)
      );
    }
    
    // Lọc theo kho
    if (filters.warehouseId) {
      result = result.filter(log => 
        log.WarehouseId == filters.warehouseId
      );
    }
    
    // Lọc theo loại thay đổi
    if (filters.changeType) {
      result = result.filter(log => 
        log.Change_type === filters.changeType
      );
    }
    
    // Lọc theo ngày
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      result = result.filter(log => 
        new Date(log.Created_at) >= startDate
      );
    }
    
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(log => 
        new Date(log.Created_at) <= endDate
      );
    }
    
    // Lọc theo số lượng
    if (filters.minQuantity !== '') {
      const minQty = parseInt(filters.minQuantity);
      result = result.filter(log => 
        log.Quantity >= minQty
      );
    }
    
    if (filters.maxQuantity !== '') {
      const maxQty = parseInt(filters.maxQuantity);
      result = result.filter(log => 
        log.Quantity <= maxQty
      );
    }
    
    setFilteredLogs(result);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      warehouseId: '',
      changeType: '',
      dateRange: {
        start: '',
        end: ''
      },
      minQuantity: '',
      maxQuantity: ''
    });
  };

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
      <td>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: item.Change_type === 'IN' ? '#10b981' : '#ef4444',
          color: 'white'
        }}>
          {item.Change_type === 'IN' ? '+' : '-'}{item.Quantity}
        </span>
      </td>
      <td>{item.Current_stock}</td>
      <td style={{maxWidth: '200px'}}>{item.Note || 'Không có'}</td>
      <td>{new Date(item.Created_at).toLocaleString('vi-VN')}</td>
    </tr>
  );

  if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Loading...</div>;
  
  if (error) return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', padding: '20px' }}>
      <h2 style={{ color: '#f9fafb' }}>Inventory Logs</h2>
      <div className="alert alert-danger" style={{ 
        color: '#ef4444', 
        padding: '12px', 
        backgroundColor: '#fee2e2',
        borderRadius: '6px',
        marginBottom: '15px'
      }}>{error}</div>
      <button onClick={fetchLogs} className="btn btn-primary" style={{
        background: '#3b82f6',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
      }}>Thử lại</button>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
      <div className="page-header">
        <h2 style={{ color: '#f9fafb', margin: 0 }}>Nhật ký tồn kho</h2>
        <button onClick={fetchLogs} className="btn btn-add">
          Làm mới
        </button>
      </div>

      {/* Bộ lọc nhật ký */}
      <div className="filter-section">
        <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc nhật ký</h3>
        <div className="filter-grid">
          {/* Tìm kiếm */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Tìm kiếm:
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên SP, kho hoặc ghi chú..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Lọc theo kho */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Kho:
            </label>
            <select
              value={filters.warehouseId}
              onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả kho</option>
              {warehouses.map(wh => (
                <option key={wh.Id} value={wh.Id}>{wh.Warehouse_name}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo loại */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Loại:
            </label>
            <select
              value={filters.changeType}
              onChange={(e) => handleFilterChange('changeType', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả loại</option>
              <option value="IN">Nhập kho</option>
              <option value="OUT">Xuất kho</option>
            </select>
          </div>

          {/* Lọc theo ngày */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Ngày tạo:
            </label>
            <div className="date-range">
              <input
                type="date"
                placeholder="Từ ngày"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange.start', e.target.value)}
                className="date-input"
              />
              <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
              <input
                type="date"
                placeholder="Đến ngày"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange.end', e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          {/* Lọc theo số lượng */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Số lượng:
            </label>
            <div className="quantity-range">
              <input
                type="number"
                placeholder="Từ"
                value={filters.minQuantity}
                onChange={(e) => handleFilterChange('minQuantity', e.target.value)}
                className="quantity-input"
                min="0"
              />
              <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.maxQuantity}
                onChange={(e) => handleFilterChange('maxQuantity', e.target.value)}
                className="quantity-input"
                min="0"
              />
            </div>
          </div>

          {/* Nút reset filter */}
          <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={resetFilters}
              className="btn-reset"
              disabled={!filters.searchTerm && !filters.warehouseId && !filters.changeType && 
                       !filters.dateRange.start && !filters.dateRange.end && 
                       !filters.minQuantity && !filters.maxQuantity}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
        
        {/* Thông tin kết quả lọc */}
        <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
          Đang hiển thị {filteredLogs.length} / {logs.length} bản ghi
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          {filteredLogs.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
              Không có dữ liệu nhật ký
            </div>
          ) : (
            <Table 
              limit="15" 
              headData={headData} 
              renderHead={renderHead} 
              bodyData={filteredLogs} 
              renderBody={renderBody}
            />
          )}
        </div>
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .filter-section {
          background: #1f2937;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #374151;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        
        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
        }
        
        .filter-input,
        .filter-select,
        .date-input,
        .quantity-input {
          padding: 10px;
          border: 1px solid #4b5563;
          border-radius: 6px;
          background: #374151;
          color: #e5e7eb;
          font-size: 14px;
          width: 100%;
          box-sizing: border-box;
        }
        
        .filter-input::placeholder {
          color: #9ca3af;
          font-size: 12px;
        }
        
        .filter-input:focus,
        .filter-select:focus,
        .date-input:focus,
        .quantity-input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .date-range,
        .quantity-range {
          display: flex;
          align-items: center;
        }
        
        .date-input,
        .quantity-input {
          flex: 1;
        }
        
        .btn-reset {
          background: #6b7280;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          height: 40px;
          width: 100%;
        }
        
        .btn-reset:hover:not(:disabled) {
          background: #4b5563;
          transform: translateY(-1px);
        }
        
        .btn-reset:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .btn-add {
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-add:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        
        .card {
          background: #1f2937;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          border: 1px solid #374151;
          overflow: hidden;
        }
        
        .card__body {
          padding: 0;
        }

        /* Style cho table */
        :global(table) {
          width: 100%;
          border-collapse: collapse;
          background: #1f2937;
        }

        :global(th) {
          background: #374151;
          color: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid #4b5563;
        }

        :global(td) {
          padding: 12px;
          border-bottom: 1px solid #374151;
          color: #e5e7eb;
        }

        :global(tr:hover) {
          background: #374151;
        }

        :global(tr:nth-child(even)) {
          background: #1f2937;
        }

        :global(tr:nth-child(even):hover) {
          background: #374151;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .badge--success {
          background: #10b981;
          color: white;
        }
        
        .badge--danger {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </div>
  );
}