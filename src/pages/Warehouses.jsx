import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table.jsx';
import api from '../api';
import '../components/style.css';

const headData = ['STT', 'ID', 'Tên kho', 'Địa điểm', 'Mô tả', 'Quản lý bởi', 'Hành động'];

const renderHead = (item, index) => <th key={index}>{item}</th>;

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ Warehouse_name: '', Location: '', Description: '', UserId: null });
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/warehouses/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/warehouses', form);
      }
      setForm({ Warehouse_name: '', Location: '', Description: '', UserId: null });
      fetch();
    } catch (err) { console.error(err); alert('Lỗi'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa kho này?')) return;
    await api.delete(`/warehouses/${id}`);
    fetch();
  };

const renderBody = (item, index) => (
  <tr key={item.Id}>
    <td>{index + 1}</td>
    <td>{item.Id}</td>
    <td style={{ color: 'white' }}>{item.Warehouse_name}</td>
    <td style={{ color: 'white' }}>{item.Location}</td>
    <td style={{ maxWidth: 220, color: 'white' }}>{item.Description}</td>
    <td>{item.UserId || ''}</td>
    <td>
      <button className="btn" onClick={() => {
        setEditing(item.Id);
        setForm({ Warehouse_name: item.Warehouse_name, Location: item.Location, Description: item.Description, UserId: item.UserId });
      }}>Sửa</button>
      <button className="btn btn-delete" onClick={() => remove(item.Id)}>Xóa</button>
    </td>
  </tr>
);


  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Warehouse Management</h2>
      </div>

      <div className="card add-form">
        <h3>{editing ? 'Sửa kho' : 'Thêm kho mới'}</h3>
        <form onSubmit={submit}>
          <div className="form-group ">
            <label>Tên kho</label>
            <input required value={form.Warehouse_name} onChange={e=>setForm({...form, Warehouse_name: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Địa điểm</label>
            <input value={form.Location} onChange={e=>setForm({...form, Location: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <textarea value={form.Description} onChange={e=>setForm({...form, Description: e.target.value})}/>
          </div>
          <div className="form-actions">
            <button className="btn btn-submit" type="submit">{editing ? 'Lưu' : 'Thêm'}</button>
            {editing && <button type="button" className="btn btn-cancel" onClick={()=>{setEditing(null); setForm({ Warehouse_name:'', Location:'', Description:'', UserId:null })}}>Hủy</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card__body">
          <Table limit="10" headData={headData} renderHead={renderHead} bodyData={warehouses} renderBody={renderBody}/>
        </div>
      </div>
    </div>
  );
}
