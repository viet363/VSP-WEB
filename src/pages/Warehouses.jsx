import React, { useEffect, useState, useCallback } from 'react';
import Table from '../components/table/Table.jsx';
import api from '../api';

const headData = ['STT', 'ID', 'Tên kho', 'Địa điểm', 'Mô tả', 'Quản lý bởi', 'Hành động'];

const renderHead = (item, index) => <th key={index}>{item}</th>;

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ 
    Warehouse_name: '', 
    Location: '', 
    Description: '', 
    UserId: null 
  });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // State cho bộ lọc
  const [filters, setFilters] = useState({
    searchTerm: '',
    location: '',
    managerId: ''
  });

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      console.log('Warehouses data:', res.data);
      
      // Đảm bảo dữ liệu không bị null/undefined
      const processedWarehouses = res.data.map(item => ({
        ...item,
        Warehouse_name: item.Warehouse_name || 'Không có tên',
        Location: item.Location || 'Không có địa điểm',
        Description: item.Description || 'Không có mô tả',
        UserId: item.UserId || null
      }));
      
      setWarehouses(processedWarehouses);
      setFilteredWarehouses(processedWarehouses);
    } catch (err) { 
      console.error('Error fetching warehouses:', err);
      alert('Không thể tải dữ liệu kho');
    }
    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  useEffect(() => { 
    fetchWarehouses();
    fetchUsers();
  }, [fetchWarehouses, fetchUsers]);

  // Hàm áp dụng bộ lọc - Sử dụng useCallback
  const applyFilters = useCallback(() => {
    let result = [...warehouses];
    
    // Lọc theo từ khóa tìm kiếm
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      result = result.filter(warehouse => 
        warehouse.Warehouse_name.toLowerCase().includes(searchTerm) ||
        warehouse.Location.toLowerCase().includes(searchTerm) ||
        warehouse.Description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Lọc theo địa điểm
    if (filters.location) {
      result = result.filter(warehouse => 
        warehouse.Location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Lọc theo quản lý
    if (filters.managerId) {
      result = result.filter(warehouse => 
        warehouse.UserId === filters.managerId
      );
    }
    
    setFilteredWarehouses(result);
  }, [warehouses, filters.searchTerm, filters.location, filters.managerId]);

  // Áp dụng bộ lọc khi filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      location: '',
      managerId: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.Warehouse_name) {
      alert('Vui lòng nhập tên kho');
      return;
    }

    try {
      if (editing) {
        await api.put(`/warehouses/${editing}`, form);
        alert('Cập nhật kho thành công!');
        setEditing(null);
      } else {
        await api.post('/warehouses', form);
        alert('Thêm kho mới thành công!');
      }
      setForm({ Warehouse_name: '', Location: '', Description: '', UserId: null });
      setShowForm(false);
      fetchWarehouses();
    } catch (err) { 
      console.error(err); 
      alert('Lỗi khi lưu: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa kho này?')) return;
    
    try {
      await api.delete(`/warehouses/${id}`);
      alert('Xóa kho thành công!');
      fetchWarehouses();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAdd = () => {
    setForm({ Warehouse_name: '', Location: '', Description: '', UserId: null });
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (warehouse) => {
    setForm({ 
      Warehouse_name: warehouse.Warehouse_name, 
      Location: warehouse.Location, 
      Description: warehouse.Description, 
      UserId: warehouse.UserId 
    });
    setEditing(warehouse.Id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ Warehouse_name: '', Location: '', Description: '', UserId: null });
  };

  const getUserName = (userId) => {
    if (!userId) return 'Chưa phân công';
    const user = users.find(u => u.Id === userId);
    return user ? `${user.Fullname} (${user.Username})` : `User #${userId}`;
  };

  const renderBody = (item, index) => (
    <tr key={item.Id}>
      <td>{index + 1}</td>
      <td>{item.Id}</td>
      <td>
        <span style={{
          color: '#f9fafb',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {item.Warehouse_name}
        </span>
      </td>
      <td>
        <span style={{
          color: '#d1d5db',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {item.Location}
        </span>
      </td>
      <td style={{ 
        maxWidth: '200px',
        color: '#e5e7eb',
        fontSize: '13px',
        lineHeight: '1.4'
      }}>
        {item.Description || 'Không có mô tả'}
      </td>
      <td>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: item.UserId ? '#3b82f6' : '#6b7280',
          color: 'white',
          display: 'inline-block'
        }}>
          {getUserName(item.UserId)}
        </span>
      </td>
      <td>
        <button className="btn-edit" onClick={() => handleEdit(item)}>
          Sửa
        </button>
        <button className="btn-delete" onClick={() => handleRemove(item.Id)}>
          Xóa
        </button>
      </td>
    </tr>
  );

  if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
      <div className="page-header">
        <h2 style={{ color: '#f9fafb', margin: 0 }}>Quản lý kho hàng</h2>
        <button className="btn btn-add" onClick={handleAdd}>
          + Thêm kho mới
        </button>
      </div>

      {/* Bộ lọc kho hàng */}
      <div className="filter-section">
        <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc kho hàng</h3>
        <div className="filter-grid">
          {/* Tìm kiếm */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Tìm kiếm:
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên, địa điểm hoặc mô tả..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Lọc theo địa điểm */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Địa điểm:
            </label>
            <input
              type="text"
              placeholder="Nhập địa điểm..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Lọc theo quản lý */}
          <div className="filter-group">
            <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
              Quản lý bởi:
            </label>
            <select
              value={filters.managerId}
              onChange={(e) => handleFilterChange('managerId', e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả quản lý</option>
              <option value="null">Chưa phân công</option>
              {users.map(user => (
                <option key={user.Id} value={user.Id}>
                  {user.Fullname || user.Username}
                </option>
              ))}
            </select>
          </div>

          {/* Nút reset filter */}
          <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
            <button
              onClick={resetFilters}
              className="btn-reset"
              disabled={!filters.searchTerm && !filters.location && !filters.managerId}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
        
        {/* Thông tin kết quả lọc */}
        <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
          Đang hiển thị {filteredWarehouses.length} / {warehouses.length} kho hàng
        </div>
      </div>

      {showForm && (
        <div className="add-form">
          <h3 style={{ color: '#f9fafb', marginTop: 0 }}>
            {editing ? 'Sửa thông tin kho' : 'Thêm kho mới'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Tên kho *</label>
              <input 
                required 
                value={form.Warehouse_name} 
                onChange={e => setForm({...form, Warehouse_name: e.target.value})}
                placeholder="Nhập tên kho"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  background: '#374151',
                  color: '#e5e7eb'
                }}
              />
            </div>
            <div className="form-group">
              <label>Địa điểm</label>
              <input 
                value={form.Location} 
                onChange={e => setForm({...form, Location: e.target.value})}
                placeholder="Nhập địa điểm kho"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  background: '#374151',
                  color: '#e5e7eb'
                }}
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea 
                value={form.Description} 
                onChange={e => setForm({...form, Description: e.target.value})}
                placeholder="Nhập mô tả về kho"
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  background: '#374151',
                  color: '#e5e7eb',
                  resize: 'vertical'
                }}
              />
            </div>
            <div className="form-group">
              <label>Quản lý bởi</label>
              <select
                value={form.UserId || ''}
                onChange={e => setForm({...form, UserId: e.target.value || null})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  background: '#374151',
                  color: '#e5e7eb'
                }}
              >
                <option value="">-- Chọn quản lý --</option>
                {users.map(user => (
                  <option key={user.Id} value={user.Id}>
                    {user.Fullname || user.Username} ({user.Email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-submit" type="submit">
                {editing ? 'Lưu thay đổi' : 'Thêm kho'}
              </button>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card__body">
          <Table 
            limit="10" 
            headData={headData} 
            renderHead={renderHead} 
            bodyData={filteredWarehouses} 
            renderBody={renderBody}
          />
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
        .filter-select {
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
        .filter-select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
        
        .add-form {
          background: #1f2937;
          padding: 24px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #374151;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        }
        
        .add-form h3 {
          margin-top: 0;
          color: #f9fafb;
          border-bottom: 1px solid #374151;
          padding-bottom: 10px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: '#e5e7eb';
        }
        
        .form-actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
        }
        
        .btn-submit {
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-submit:hover {
          background: #059669;
          transform: translateY(-1px);
        }
        
        .btn-cancel {
          background: #6b7280;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .btn-cancel:hover {
          background: #4b5563;
          transform: translateY(-1px);
        }
        
        .btn-edit {
          background: #3b82f6;
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
        
        .btn-edit:hover { 
          background: #2563eb;
          transform: translateY(-1px);
        }
        
        .btn-delete {
          background: #ef4444;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
          margin-left: 8px;
        }
        
        .btn-delete:hover { 
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