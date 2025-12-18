import React, { useEffect, useState, useCallback } from 'react'; 
import Table from '../components/table/Table.jsx';
import api from '../api';
import { useHistory } from 'react-router-dom';

const headData = ['STT','ID','Sản phẩm','Kho','Tồn','Ngưỡng','Trạng thái','Hành động'];
const renderHead = (item, index) => <th key={index}>{item}</th>;

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    searchTerm: '',
    warehouseId: '',
    status: '',
    stockRange: {
      min: '',
      max: ''
    },
    minStockRange: {
      min: '',
      max: ''
    }
  });

  const history = useHistory();

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching inventory data...');
      const [invRes, whRes, productsRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      
      console.log('Raw inventory data:', invRes.data);
      
      const processedRows = invRes.data.map(item => ({
        ...item,
        Product_name: item.Product_name || 'Không có tên',
        Warehouse_name: item.Warehouse_name || 'Không có kho',
        Stock: parseInt(item.Stock) || 0,
        Min_stock: parseInt(item.Min_stock) || 0,
        ProductId: item.ProductId || item.productId,
        WarehouseId: item.WarehouseId || item.warehouseId
      }));
      
      console.log('Processed inventory:', processedRows);
      
      setRows(processedRows);
      setFilteredRows(processedRows);
      setWarehouses(whRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Không thể tải dữ liệu tồn kho');
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...rows];
    
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(row => 
        row.Product_name.toLowerCase().includes(searchTerm) ||
        row.Warehouse_name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.warehouseId) {
      result = result.filter(row => 
        row.WarehouseId === filters.warehouseId 
      );
    }
    
    if (filters.status) {
      if (filters.status === 'low') {
        result = result.filter(row => row.Stock < row.Min_stock);
      } else if (filters.status === 'warning') {
        result = result.filter(row => row.Stock === row.Min_stock);
      } else if (filters.status === 'ok') {
        result = result.filter(row => row.Stock > row.Min_stock);
      } else if (filters.status === 'critical') {
        result = result.filter(row => row.Stock <= Math.floor(row.Min_stock * 0.5));
      }
    }
    
    if (filters.stockRange.min !== '') {
      const minStock = parseInt(filters.stockRange.min);
      result = result.filter(row => row.Stock >= minStock);
    }
    
    if (filters.stockRange.max !== '') {
      const maxStock = parseInt(filters.stockRange.max);
      result = result.filter(row => row.Stock <= maxStock);
    }
    
    if (filters.minStockRange.min !== '') {
      const minThreshold = parseInt(filters.minStockRange.min);
      result = result.filter(row => row.Min_stock >= minThreshold);
    }
    
    if (filters.minStockRange.max !== '') {
      const maxThreshold = parseInt(filters.minStockRange.max);
      result = result.filter(row => row.Min_stock <= maxThreshold);
    }
    
    setFilteredRows(result);
  }, [rows, filters.searchTerm, filters.warehouseId, filters.status, filters.stockRange.min, filters.stockRange.max, filters.minStockRange.min, filters.minStockRange.max]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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
      status: '',
      stockRange: {
        min: '',
        max: ''
      },
      minStockRange: {
        min: '',
        max: ''
      }
    });
  };

  const getStockStatus = (stock, minStock) => {
    if (stock < minStock) return { text: 'Thiếu hàng', color: '#ef4444', bgColor: '#fee2e2' };
    if (stock === minStock) return { text: 'Cảnh báo', color: '#f59e0b', bgColor: '#fef3c7' };
    return { text: 'Đủ hàng', color: '#10b981', bgColor: '#d1fae5' };
  };

  const handleImport = (productId, warehouseId) => {
    history.push(`/inventory/import?product=${productId}&warehouse=${warehouseId}`);
  };

  const handleExport = (productId, warehouseId) => {
    history.push(`/inventory/export?product=${productId}&warehouse=${warehouseId}`);
  };

  const renderBody = (item, index) => {
    const stockStatus = getStockStatus(item.Stock, item.Min_stock);
    const stockPercentage = item.Min_stock > 0 ? Math.round((item.Stock / item.Min_stock) * 100) : 100;
    
    return (
      <tr key={item.Id}>
        <td>{index + 1}</td>
        <td>{item.Id}</td>
        <td>
          <span style={{ color: '#f9fafb', fontWeight: '500' }}>
            {item.Product_name}
          </span>
        </td>
        <td>
          <span style={{ color: '#d1d5db', fontSize: '13px' }}>
            {item.Warehouse_name}
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '60px', 
              height: '6px', 
              backgroundColor: '#374151',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(stockPercentage, 100)}%`,
                height: '100%',
                backgroundColor: stockStatus.color,
                borderRadius: '3px'
              }} />
            </div>
            <span style={{ 
              color: stockStatus.color, 
              fontWeight: '600',
              minWidth: '40px'
            }}>
              {item.Stock}
            </span>
          </div>
        </td>
        <td>
          <span style={{ color: '#9ca3af', fontSize: '13px' }}>
            {item.Min_stock}
          </span>
        </td>
        <td>
          <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: stockStatus.bgColor,
            color: stockStatus.color,
            display: 'inline-block'
          }}>
            {stockStatus.text}
          </span>
        </td>
        <td>
          <button 
            className="btn-import" 
            onClick={() => handleImport(item.ProductId, item.WarehouseId)}
          >
            Nhập
          </button>
          <button 
            className="btn-export" 
            onClick={() => handleExport(item.ProductId, item.WarehouseId)}
          >
            Xuất
          </button>
        </td>
      </tr>
    );
  };

  const getStats = () => {
    const total = rows.length;
    const lowStock = rows.filter(r => r.Stock < r.Min_stock).length;
    const warningStock = rows.filter(r => r.Stock === r.Min_stock).length;
    const okStock = rows.filter(r => r.Stock > r.Min_stock).length;
    
    return { total, lowStock, warningStock, okStock };
  };

  const stats = getStats();

  if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
      <div className="page-header">
        <h2 style={{ color: '#f9fafb', margin: 0 }}>Quản lý tồn kho</h2>
        <button className="btn btn-refresh" onClick={fetchData}>
          Làm mới
        </button>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card" style={{ backgroundColor: '#1f2937', borderLeft: '4px solid #3b82f6' }}>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Tổng sản phẩm</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#1f2937', borderLeft: '4px solid #10b981' }}>
            <div className="stat-number">{stats.okStock}</div>
            <div className="stat-label">Đủ hàng</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#1f2937', borderLeft: '4px solid #f59e0b' }}>
            <div className="stat-number">{stats.warningStock}</div>
            <div className="stat-label">Cảnh báo</div>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#1f2937', borderLeft: '4px solid #ef4444' }}>
            <div className="stat-number">{stats.lowStock}</div>
            <div className="stat-label">Thiếu hàng</div>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc tồn kho</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Tìm kiếm:
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên SP hoặc kho..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>

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
              {warehouses.map(w => (
                <option key={w.Id} value={w.Id}>{w.Warehouse_name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Trạng thái:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="critical">Thiếu hàng trầm trọng</option>
              <option value="low">Thiếu hàng</option>
              <option value="warning">Cảnh báo</option>
              <option value="ok">Đủ hàng</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Tồn kho hiện tại:
            </label>
            <div className="stock-range">
              <input
                type="number"
                placeholder="Từ"
                value={filters.stockRange.min}
                onChange={(e) => handleFilterChange('stockRange.min', e.target.value)}
                className="stock-input"
                min="0"
              />
              <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.stockRange.max}
                onChange={(e) => handleFilterChange('stockRange.max', e.target.value)}
                className="stock-input"
                min="0"
              />
            </div>
          </div>

          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Ngưỡng tồn tối thiểu:
            </label>
            <div className="threshold-range">
              <input
                type="number"
                placeholder="Từ"
                value={filters.minStockRange.min}
                onChange={(e) => handleFilterChange('minStockRange.min', e.target.value)}
                className="threshold-input"
                min="0"
              />
              <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.minStockRange.max}
                onChange={(e) => handleFilterChange('minStockRange.max', e.target.value)}
                className="threshold-input"
                min="0"
              />
            </div>
          </div>

          <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={resetFilters}
              className="btn-reset"
              disabled={!filters.searchTerm && !filters.warehouseId && !filters.status && 
                       !filters.stockRange.min && !filters.stockRange.max &&
                       !filters.minStockRange.min && !filters.minStockRange.max}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
          Đang hiển thị {filteredRows.length} / {rows.length} sản phẩm
          {filters.status && ` • Trạng thái: ${filters.status}`}
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          {filteredRows.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
              Không tìm thấy sản phẩm nào phù hợp với bộ lọc
            </div>
          ) : (
            <Table 
              limit="10" 
              headData={headData} 
              renderHead={renderHead} 
              bodyData={filteredRows} 
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
        
        .stats-section {
          margin-bottom: 20px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .stat-card {
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #374151;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #f9fafb;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 13px;
          color: #9ca3af;
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
        .stock-input,
        .threshold-input {
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
        .stock-input:focus,
        .threshold-input:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .stock-range,
        .threshold-range {
          display: flex;
          align-items: center;
        }
        
        .stock-input,
        .threshold-input {
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
        
        .btn-refresh {
          background: #3b82f6;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-refresh:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        
        .btn-import {
          background: #10b981;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 8px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-import:hover { 
          background: #059669;
          transform: translateY(-1px);
        }
        
        .btn-export {
          background: #ef4444;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-export:hover { 
          background: #dc2626;
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
      `}</style>
    </div>
  );
}
