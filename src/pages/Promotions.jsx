import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import axios from 'axios';

const promotionHead = [
    "STT", "ID", "Sản phẩm", "Giảm giá", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Hành động"
];

const renderHead = (item, index) => <th key={index}>{item}</th>;

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        ProductId: '',
        Discount_amount: '',
        Start_date: '',
        End_date: '',
        Is_active: 1
    });

    const fetchPromotions = () => {
        axios.get("http://localhost:4000/api/promotions")
            .then(res => setPromotions(res.data))
            .catch(err => console.log(err));
    };

    const fetchProducts = () => {
        axios.get("http://localhost:4000/api/products")
            .then(res => setProducts(res.data))
            .catch(err => console.log(err));
    };

    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!form.ProductId) return alert("Chọn sản phẩm!");

        const api = editing
            ? axios.put(`http://localhost:4000/api/promotions/${editing}`, form)
            : axios.post(`http://localhost:4000/api/promotions`, form);

        api.then(() => {
            alert("Lưu thành công!");
            setShowForm(false);
            setEditing(null);
            fetchPromotions();
        });
    };

    const handleEdit = (p) => {
        setForm({
            ProductId: p.ProductId,
            Discount_amount: p.Discount_amount,
            Start_date: p.Start_date?.slice(0, 10),
            End_date: p.End_date?.slice(0, 10),
            Is_active: p.Is_active
        });
        setEditing(p.Id);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Xóa khuyến mãi này?")) {
            axios.delete(`http://localhost:4000/api/promotions/${id}`)
                .then(() => {
                    alert("Xóa thành công!");
                    fetchPromotions();
                });
        }
    };

    const renderBody = (item, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.Id}</td>
            <td>{item.Product_name}</td>
            <td>{item.Discount_amount}</td>
            <td>{item.Start_date}</td>
            <td>{item.End_date}</td>
            <td>{item.Is_active ? "Hoạt động" : "Tắt"}</td>
            <td>
                <button className="btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                <button className="btn-delete" onClick={() => handleDelete(item.Id)}>Xóa</button>
            </td>
        </tr>
    );

    return (
        <div>
            <div className="page-header">
                <h2>Quản lý khuyến mãi</h2>
                <button className="btn-add" onClick={() => { setShowForm(true); setEditing(null); }}>
                    + Thêm khuyến mãi
                </button>
            </div>

            {showForm && (
                <div className="add-form">
                    <h3>{editing ? "Cập nhật khuyến mãi" : "Thêm mới"}</h3>

                    <form onSubmit={handleSubmit}>
                        <label>Sản phẩm</label>
                        <select name="ProductId" value={form.ProductId} onChange={handleChange} required>
                            <option value="">-- chọn sản phẩm --</option>
                            {products.map(p => (
                                <option key={p.Id} value={p.Id}>{p.Product_name}</option>
                            ))}
                        </select>

                        <label>Giảm giá</label>
                        <input type="number" name="Discount_amount" value={form.Discount_amount} onChange={handleChange} required />

                        <label>Ngày bắt đầu</label>
                        <input type="date" name="Start_date" value={form.Start_date} onChange={handleChange} required />

                        <label>Ngày kết thúc</label>
                        <input type="date" name="End_date" value={form.End_date} onChange={handleChange} required />

                        <label>Trạng thái</label>
                        <select name="Is_active" value={form.Is_active} onChange={handleChange}>
                            <option value="1">Hoạt động</option>
                            <option value="0">Tắt</option>
                        </select>

                        <button type="submit" className="btn-submit">Lưu</button>
                        <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="card__body">
                    <Table
                        limit="10"
                        headData={promotionHead}
                        renderHead={renderHead}
                        bodyData={promotions}
                        renderBody={renderBody}
                    />
                </div>
            </div>
        </div>
    );
};

export default Promotions;
