import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import api from '../api';

const productTableHead = [
    'STT',
    'ID',
    'Tên sản phẩm',
    'Giá',
    'Trạng thái',
    'Hình ảnh',
    'Danh mục',
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

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [product, setProduct] = useState({
        Product_name: '',
        Price: '',
        Product_status: 'Draft',
        picUrl: '',
        CategoryId: '',
        Description: '',
        model: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            console.log('Fetching products and categories...');
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            
            console.log('Raw products data:', productsRes.data);
            console.log('Categories data:', categoriesRes.data);
            
            // Đảm bảo dữ liệu không bị null/undefined
            const processedProducts = productsRes.data.map(item => ({
                ...item,
                Product_name: item.Product_name || 'Không có tên',
                Product_status: item.Product_status || 'Draft',
                Category_name: item.Category_name || 'Chưa phân loại',
                picUrl: item.picUrl || '',
                Price: item.Price || 0
            }));
            
            console.log('Processed products:', processedProducts);
            
            setProducts(processedProducts);
            setCategories(categoriesRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            console.error('Error response:', err.response?.data);
            setError(err.message);
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setProduct({
            Product_name: '',
            Price: '',
            Product_status: 'Draft',
            picUrl: '',
            CategoryId: '',
            Description: '',
            model: ''
        });
        setEditMode(false);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        console.log('Editing product:', item);
        setProduct({
            Product_name: item.Product_name || '',
            Price: item.Price || '',
            Product_status: item.Product_status || 'Draft',
            picUrl: item.picUrl || '',
            CategoryId: item.CategoryId || '',
            Description: item.Description || '',
            model: item.model || ''
        });
        setCurrentId(item.Id);
        setEditMode(true);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await api.delete(`/products/${id}`);
                alert('Xóa thành công!');
                fetchData();
            } catch (err) {
                alert('Lỗi khi xóa: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product.Product_name || !product.Price || !product.CategoryId) {
            alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
            return;
        }

        try {
            if (editMode) {
                await api.put(`/products/${currentId}`, product);
                alert('Cập nhật sản phẩm thành công!');
            } else {
                await api.post('/products', product);
                alert('Thêm sản phẩm thành công!');
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            alert('Lỗi khi lưu: ' + (err.response?.data?.error || err.message));
        }
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;
    
    const renderBody = (item, index) => {
        console.log('Rendering product item:', item);
        
        // Đảm bảo không bị lỗi với giá trị null/undefined
        const productName = item.Product_name || 'Không có tên';
        const productStatus = item.Product_status || 'Draft';
        const categoryName = item.Category_name || 'Chưa phân loại';
        const price = parseFloat(item.Price || 0);
        const imageUrl = item.picUrl;

        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.Id}</td>
                <td>{productName}</td>
                <td>{price.toLocaleString('vi-VN')} VND</td>
                <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: 
                            productStatus === 'Published' ? '#10b981' :
                            productStatus === 'Draft' ? '#f59e0b' :
                            productStatus === 'OutOfStock' ? '#ef4444' :
                            productStatus === 'Archived' ? '#6b7280' : '#3b82f6',
                        color: 'white'
                    }}>
                        {productStatus}
                    </span>
                </td>
                <td>
                    <ImageWithFallback 
                        src={imageUrl}
                        alt={productName}
                        style={{ 
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #374151'
                        }}
                    />
                </td>
                <td>{categoryName}</td>
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
                <h2 style={{ color: '#f9fafb', margin: 0 }}>Sản phẩm</h2>
                <button className="btn btn-add" onClick={handleAdd}>+ Thêm sản phẩm</button>
            </div>

            {showForm && (
                <div className="add-form">
                    <h3 style={{ color: '#f9fafb', marginTop: 0 }}>{editMode ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <label>Tên sản phẩm:</label>
                        <input 
                            type="text" 
                            name="Product_name" 
                            value={product.Product_name} 
                            onChange={handleChange} 
                            required 
                            placeholder="Nhập tên sản phẩm"
                        />

                        <label>Giá:</label>
                        <input 
                            type="number" 
                            name="Price" 
                            value={product.Price} 
                            onChange={handleChange} 
                            required 
                            min="0" 
                            step="0.01" 
                            placeholder="Nhập giá sản phẩm"
                        />

                        <label>Trạng thái:</label>
                        <select name="Product_status" value={product.Product_status} onChange={handleChange}>
                            <option value="Draft">Bản nháp</option>
                            <option value="Published">Đã xuất bản</option>
                            <option value="OutOfStock">Hết hàng</option>
                            <option value="Archived">Đã lưu trữ</option>
                        </select>

                        <label>Danh mục:</label>
                        <select name="CategoryId" value={product.CategoryId} onChange={handleChange} required>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(cat => (
                                <option key={cat.Id} value={cat.Id}>{cat.Category_name}</option>
                            ))}
                        </select>

                        <label>URL hình ảnh:</label>
                        <input 
                            type="text" 
                            name="picUrl" 
                            value={product.picUrl} 
                            onChange={handleChange} 
                            placeholder="https://example.com/image.jpg"
                        />

                        <label>Mô tả:</label>
                        <textarea 
                            name="Description" 
                            value={product.Description} 
                            onChange={handleChange} 
                            rows="3" 
                            placeholder="Nhập mô tả sản phẩm"
                        />

                        <label>Model:</label>
                        <input 
                            type="text" 
                            name="model" 
                            value={product.model} 
                            onChange={handleChange} 
                            placeholder="Nhập model sản phẩm"
                        />

                        {product.picUrl && (
                            <div>
                                <label>Preview:</label>
                                <ImageWithFallback 
                                    src={product.picUrl}
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
                        headData={productTableHead}
                        renderHead={renderHead}
                        bodyData={products}
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
                .add-form input,
                .add-form select,
                .add-form textarea {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #4b5563;
                    border-radius: 6px;
                    margin-bottom: 12px;
                    font-size: 14px;
                    box-sizing: border-box;
                    background: #374151;
                    color: #e5e7eb;
                    transition: all 0.2s;
                }
                .add-form input::placeholder,
                .add-form textarea::placeholder {
                    color: #9ca3af;
                }
                .add-form input:focus,
                .add-form select:focus,
                .add-form textarea:focus {
                    border-color: #10b981;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

export default Products;