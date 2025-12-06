import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { useLocation, useHistory } from 'react-router-dom';
import '../components/style.css';

export default function InventoryExport() {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    productId: '', 
    warehouseId: '', 
    quantity: '', 
    note: '' 
  });
  
  const location = useLocation(); 
  const history = useHistory(); 

  const getQueryParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching warehouses and products...');
        
        const [warehousesRes, productsRes] = await Promise.all([
          api.get('/warehouses'),
          api.get('/products')
        ]);
        
        console.log('Warehouses:', warehousesRes.data);
        console.log('Products:', productsRes.data);
        
        setWarehouses(warehousesRes.data || []);
        setProducts(productsRes.data || []);
        
        const qParams = getQueryParams();
        const p = qParams.get('product'); 
        const w = qParams.get('warehouse');
        
        console.log('URL params:', { product: p, warehouse: w });
        
        if (p || w) {
          setForm(f => ({
            ...f, 
            productId: p || f.productId, 
            warehouseId: w || f.warehouseId
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response?.data);
        alert('Lỗi khi tải dữ liệu: ' + (error.response?.data?.error || error.message));
      }
    };

    fetchData();
  }, [getQueryParams]);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!form.productId || !form.warehouseId || !form.quantity || Number(form.quantity) <= 0) { 
      alert('Vui lòng nhập đầy đủ thông tin và số lượng phải lớn hơn 0'); 
      return; 
    }
    
    setLoading(true);
    
    try {
      const payload = {
        productId: parseInt(form.productId),
        warehouseId: parseInt(form.warehouseId),
        quantity: parseInt(form.quantity),
        note: form.note
      };
      
      console.log('Sending export request:', payload);
      
      const res = await api.post('/inventory/export', payload);
      alert('Xuất kho thành công. Tồn hiện tại: ' + res.data.current_stock);
      history.push('/inventory'); 
    } catch (err) { 
      console.error('Export error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Lỗi không xác định';
      alert('Lỗi: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Xuất kho</h2>
      <div className="card add-form">
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Sản phẩm</label>
            <select 
              value={form.productId} 
              onChange={e => setForm({...form, productId: e.target.value})}
              required
            >
              <option value="">--Chọn SP--</option>
              {products.map(p => (
                <option key={p.Id} value={p.Id}>
                  {p.Title || p.Product_name}
                </option>
              ))}
            </select>
            {products.length > 0 && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Đã tải {products.length} sản phẩm. Ví dụ: {products[0].Title || products[0].Product_name}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Kho</label>
            <select 
              value={form.warehouseId} 
              onChange={e => setForm({...form, warehouseId: e.target.value})}
              required
            >
              <option value="">--Chọn kho--</option>
              {warehouses.map(w => (
                <option key={w.Id} value={w.Id}>{w.Warehouse_name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Số lượng</label>
            <input 
              type="number" 
              min="1" 
              value={form.quantity} 
              onChange={e => setForm({...form, quantity: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea 
              value={form.note} 
              onChange={e => setForm({...form, note: e.target.value})}
              placeholder="Ghi chú (tùy chọn)"
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="btn btn-submit" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Xuất kho'}
            </button>
            <button 
              type="button" 
              className="btn btn-cancel"
              onClick={() => history.push('/inventory')}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}