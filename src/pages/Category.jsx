import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import api from '../api';

const categoryTableHead = [
    'STT',
    'ID',
    'Tên danh mục',
    'Hình ảnh',
    'Hành động'
];

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [category, setCategory] = useState({ Category_name: '', picUrl: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCategory({ Category_name: '', picUrl: '' });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        setCategory({ Category_name: item.Category_name, picUrl: item.picUrl });
        setCurrentId(item.Id);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
            try {
                await api.delete(`/categories/${id}`);
                alert('Xóa thành công!');
                fetchCategories();
            } catch (err) {
                alert('Lỗi khi xóa: ' + err.response?.data?.error || err.message);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory({ ...category, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category.Category_name || !category.picUrl) {
            alert('Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        try {
            if (editMode) {
                await api.put(`/categories/${currentId}`, category);
                alert('Cập nhật danh mục thành công!');
            } else {
                await api.post('/categories', category);
                alert('Thêm danh mục thành công!');
            }
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            alert('Lỗi khi lưu: ' + err.response?.data?.error || err.message);
        }
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;
    const renderBody = (item, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.Id}</td>
            <td>{item.Category_name}</td>
            <td><img src={item.picUrl} alt="category" style={{ width: 50, height: 50 }} /></td>
            <td>
                <button className="btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                <button className="btn-delete" onClick={() => handleDelete(item.Id)}>Xóa</button>
            </td>
        </tr>
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <div className="page-header">
                <h2>Danh mục sản phẩm</h2>
                <button className="btn btn-add" onClick={handleAdd}>+ Thêm danh mục</button>
            </div>

            {showForm && (
                <div className="add-form">
                    <h3>{editMode ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Tên danh mục:</label>
                        <input type="text" name="Category_name" value={category.Category_name} onChange={handleChange} required />

                        <label>URL hình ảnh:</label>
                        <input type="text" name="picUrl" value={category.picUrl} onChange={handleChange} required />

                        {category.picUrl && <img src={category.picUrl} alt="preview" style={{ width: 100, marginTop: 10 }} />}

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">Lưu</button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="card__body">
                    <Table
                        limit="10"
                        headData={categoryTableHead}
                        renderHead={renderHead}
                        bodyData={categories}
                        renderBody={renderBody}
                    />
                </div>
            </div>

            <style jsx>{`
                .btn-edit {
                    background: #2196f3;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-right: 5px;
                }
                .btn-edit:hover { background: #1976d2; }
                .btn-delete {
                    background: #f44336;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .btn-delete:hover { background: #d32f2f; }
            `}</style>
        </div>
    );
};

export default Categories;