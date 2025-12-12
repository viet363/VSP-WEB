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

// Component xử lý lỗi hình ảnh
const ImageWithFallback = ({ src, alt, ...props }) => {
    const [imgError, setImgError] = useState(false);

    if (imgError || !src) {
        return <span style={{ color: '#aaa', fontStyle: 'italic' }}>No image</span>;
    }

    return (
        <img 
            src={src} 
            alt={alt}
            onError={() => setImgError(true)}
            {...props}
        />
    );
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    // State cho bộ lọc
    const [filters, setFilters] = useState({
        searchTerm: '',
    });

    const [category, setCategory] = useState({ Category_name: '', picUrl: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    // Áp dụng bộ lọc khi filters thay đổi
    useEffect(() => {
        applyFilters();
    }, [filters, categories]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            console.log('Raw categories data:', response.data);
            
            // Đảm bảo dữ liệu không bị null/undefined
            const processedCategories = response.data.map(item => ({
                ...item,
                Category_name: item.Category_name || 'Không có tên',
                picUrl: item.picUrl || ''
            }));
            
            console.log('Processed categories:', processedCategories);
            
            setCategories(processedCategories);
            setFilteredCategories(processedCategories); // Khởi tạo filteredCategories
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Hàm áp dụng bộ lọc
    const applyFilters = () => {
        let result = [...categories];
        
        // Lọc theo từ khóa tìm kiếm
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            result = result.filter(category => 
                category.Category_name.toLowerCase().includes(searchTerm)
            );
        }
        
        setFilteredCategories(result);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
        });
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
                alert('Lỗi khi xóa: ' + (err.response?.data?.error || err.message));
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
            alert('Lỗi khi lưu: ' + (err.response?.data?.error || err.message));
        }
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;
    
    const renderBody = (item, index) => {
        const categoryName = item.Category_name || 'Không có tên';
        const imageUrl = item.picUrl;

        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.Id}</td>
                <td>{categoryName}</td>
                <td>
                    <ImageWithFallback 
                        src={imageUrl}
                        alt={categoryName}
                        style={{ 
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #374151'
                        }}
                    />
                </td>
                <td>
                    <button className="btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(item.Id)}>Xóa</button>
                </td>
            </tr>
        );
    };

    if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Loading...</div>;
    if (error) return <div style={{ color: '#ef4444', padding: '20px' }}>Error: {error}</div>;

    return (
        <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
            <div className="page-header">
                <h2 style={{ color: '#f9fafb', margin: 0 }}>Danh mục sản phẩm</h2>
                <button className="btn btn-add" onClick={handleAdd}>+ Thêm danh mục</button>
            </div>

            {/* Bộ lọc danh mục */}
            <div className="filter-section">
                <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc danh mục</h3>
                <div className="filter-grid">
                    {/* Tìm kiếm theo tên */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Tìm kiếm danh mục:
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên danh mục..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    {/* Nút reset filter */}
                    <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                        <button
                            onClick={resetFilters}
                            className="btn-reset"
                            disabled={!filters.searchTerm}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
                
                {/* Thông tin kết quả lọc */}
                <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
                    Đang hiển thị {filteredCategories.length} / {categories.length} danh mục
                </div>
            </div>

            {showForm && (
                <div className="add-form">
                    <h3 style={{ color: '#f9fafb', marginTop: 0 }}>{editMode ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Tên danh mục:</label>
                        <input 
                            type="text" 
                            name="Category_name" 
                            value={category.Category_name} 
                            onChange={handleChange} 
                            required 
                            placeholder="Nhập tên danh mục"
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

                        <label>URL hình ảnh:</label>
                        <input 
                            type="text" 
                            name="picUrl" 
                            value={category.picUrl} 
                            onChange={handleChange} 
                            required 
                            placeholder="https://example.com/image.jpg"
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

                        {category.picUrl && (
                            <div>
                                <label>Preview:</label>
                                <ImageWithFallback 
                                    src={category.picUrl}
                                    alt="preview"
                                    style={{ 
                                        width: 100, 
                                        marginTop: 10,
                                        borderRadius: '4px',
                                        border: '1px solid #374151'
                                    }}
                                />
                            </div>
                        )}

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
                        bodyData={filteredCategories}
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
                
                .filter-input {
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
                
                .filter-input:focus {
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
                
                .add-form label {
                    display: block;
                    margin: 12px 0 6px;
                    font-weight: 500;
                    color: #e5e7eb;
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
};

export default Categories;