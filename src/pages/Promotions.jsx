import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import api from '../api';

const promotionHead = [
    "STT", "ID", "Sản phẩm", "Giảm giá", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái", "Hành động"
];

const renderHead = (item, index) => <th key={index}>{item}</th>;

const Promotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    // State cho bộ lọc
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        discountRange: {
            min: '',
            max: ''
        },
        dateRange: {
            start: '',
            end: ''
        }
    });

    const [form, setForm] = useState({
        ProductId: '',
        Discount_amount: '',
        Start_date: '',
        End_date: '',
        Is_active: 1
    });

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const res = await api.get("/promotions");
            console.log('Promotions data:', res.data);
            
            // Đảm bảo dữ liệu không bị null/undefined
            const processedPromotions = res.data.map(item => ({
                ...item,
                Product_name: item.Product_name || 'Không có tên',
                Discount_amount: parseFloat(item.Discount_amount) || 0,
                Start_date: item.Start_date || '',
                End_date: item.End_date || '',
                Is_active: item.Is_active || 0
            }));
            
            setPromotions(processedPromotions);
            setFilteredPromotions(processedPromotions);
        } catch (err) {
            console.error('Error fetching promotions:', err);
            alert('Không thể tải dữ liệu khuyến mãi');
        }
        setLoading(false);
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    // Áp dụng bộ lọc khi filters thay đổi
    useEffect(() => {
        applyFilters();
    }, [filters, promotions]);

    // Hàm áp dụng bộ lọc
    const applyFilters = () => {
        let result = [...promotions];
        
        // Lọc theo từ khóa tìm kiếm
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            result = result.filter(promo => 
                promo.Product_name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Lọc theo trạng thái
        if (filters.status !== '') {
            const statusFilter = filters.status === 'active';
            result = result.filter(promo => 
                promo.Is_active === (statusFilter ? 1 : 0)
            );
        }
        
        // Lọc theo mức giảm giá
        if (filters.discountRange.min !== '') {
            const minDiscount = parseFloat(filters.discountRange.min);
            result = result.filter(promo => 
                promo.Discount_amount >= minDiscount
            );
        }
        
        if (filters.discountRange.max !== '') {
            const maxDiscount = parseFloat(filters.discountRange.max);
            result = result.filter(promo => 
                promo.Discount_amount <= maxDiscount
            );
        }
        
        // Lọc theo ngày
        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            result = result.filter(promo => 
                new Date(promo.Start_date) >= startDate
            );
        }
        
        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(promo => 
                new Date(promo.End_date) <= endDate
            );
        }
        
        setFilteredPromotions(result);
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
            status: '',
            discountRange: {
                min: '',
                max: ''
            },
            dateRange: {
                start: '',
                end: ''
            }
        });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.ProductId) return alert("Chọn sản phẩm!");

        try {
            if (editing) {
                await api.put(`/promotions/${editing}`, form);
                alert("Cập nhật thành công!");
            } else {
                await api.post(`/promotions`, form);
                alert("Thêm thành công!");
            }
            setShowForm(false);
            setEditing(null);
            fetchPromotions();
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.error || err.message));
        }
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

    const handleDelete = async (id) => {
        if (window.confirm("Xóa khuyến mãi này?")) {
            try {
                await api.delete(`/promotions/${id}`);
                alert("Xóa thành công!");
                fetchPromotions();
            } catch (err) {
                alert('Lỗi: ' + (err.response?.data?.error || err.message));
            }
        }
    };

    const renderBody = (item, index) => {
        const isActive = item.Is_active === 1;
        const isExpired = new Date(item.End_date) < new Date();
        
        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.Id}</td>
                <td>{item.Product_name}</td>
                <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#3b82f6',
                        color: 'white'
                    }}>
                        {item.Discount_amount}%
                    </span>
                </td>
                <td>{item.Start_date}</td>
                <td>{item.End_date}</td>
                <td>
                    <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: 
                            !isActive ? '#6b7280' :
                            isExpired ? '#ef4444' :
                            '#10b981',
                        color: 'white'
                    }}>
                        {!isActive ? 'Tắt' : isExpired ? 'Hết hạn' : 'Hoạt động'}
                    </span>
                </td>
                <td>
                    <button className="btn-edit" onClick={() => handleEdit(item)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(item.Id)}>Xóa</button>
                </td>
            </tr>
        );
    };

    if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
            <div className="page-header">
                <h2 style={{ color: '#f9fafb', margin: 0 }}>Quản lý khuyến mãi</h2>
                <button className="btn btn-add" onClick={() => { setShowForm(true); setEditing(null); }}>
                    + Thêm khuyến mãi
                </button>
            </div>

            {/* Bộ lọc khuyến mãi */}
            <div className="filter-section">
                <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc khuyến mãi</h3>
                <div className="filter-grid">
                    {/* Tìm kiếm */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Tìm kiếm:
                        </label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên sản phẩm..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    {/* Lọc theo trạng thái */}
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
                            <option value="active">Đang hoạt động</option>
                            <option value="inactive">Đã tắt</option>
                        </select>
                    </div>

                    {/* Lọc theo mức giảm giá */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Mức giảm giá (%):
                        </label>
                        <div className="discount-range">
                            <input
                                type="number"
                                placeholder="Từ %"
                                value={filters.discountRange.min}
                                onChange={(e) => handleFilterChange('discountRange.min', e.target.value)}
                                className="discount-input"
                                min="0"
                                max="100"
                            />
                            <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
                            <input
                                type="number"
                                placeholder="Đến %"
                                value={filters.discountRange.max}
                                onChange={(e) => handleFilterChange('discountRange.max', e.target.value)}
                                className="discount-input"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {/* Lọc theo ngày */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Hiệu lực:
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

                    {/* Nút reset filter */}
                    <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                        <button
                            onClick={resetFilters}
                            className="btn-reset"
                            disabled={!filters.searchTerm && !filters.status && 
                                     !filters.discountRange.min && !filters.discountRange.max && 
                                     !filters.dateRange.start && !filters.dateRange.end}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
                
                {/* Thông tin kết quả lọc */}
                <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
                    Đang hiển thị {filteredPromotions.length} / {promotions.length} khuyến mãi
                </div>
            </div>

            {showForm && (
                <div className="add-form">
                    <h3 style={{ color: '#f9fafb', marginTop: 0 }}>{editing ? "Cập nhật khuyến mãi" : "Thêm mới"}</h3>

                    <form onSubmit={handleSubmit}>
                        <label>Sản phẩm</label>
                        <select 
                            name="ProductId" 
                            value={form.ProductId} 
                            onChange={handleChange} 
                            required
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
                            <option value="">-- chọn sản phẩm --</option>
                            {products.map(p => (
                                <option key={p.Id} value={p.Id}>{p.Product_name}</option>
                            ))}
                        </select>

                        <label>Giảm giá (%)</label>
                        <input 
                            type="number" 
                            name="Discount_amount" 
                            value={form.Discount_amount} 
                            onChange={handleChange} 
                            required 
                            min="0"
                            max="100"
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

                        <label>Ngày bắt đầu</label>
                        <input 
                            type="date" 
                            name="Start_date" 
                            value={form.Start_date} 
                            onChange={handleChange} 
                            required
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

                        <label>Ngày kết thúc</label>
                        <input 
                            type="date" 
                            name="End_date" 
                            value={form.End_date} 
                            onChange={handleChange} 
                            required
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

                        <label>Trạng thái</label>
                        <select 
                            name="Is_active" 
                            value={form.Is_active} 
                            onChange={handleChange}
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
                            <option value="1">Hoạt động</option>
                            <option value="0">Tắt</option>
                        </select>

                        <div className="form-actions">
                            <button type="submit" className="btn-submit">Lưu</button>
                            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="card__body">
                    <Table
                        limit="10"
                        headData={promotionHead}
                        renderHead={renderHead}
                        bodyData={filteredPromotions}
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
                .filter-select,
                .date-input,
                .discount-input {
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
                .discount-input:focus {
                    border-color: #3b82f6;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .date-range,
                .discount-range {
                    display: flex;
                    align-items: center;
                }
                
                .date-input,
                .discount-input {
                    flex: 1;
                }
                
                .btn-reset {
                    background: #6b7280;
                    color: white;
                    padding: 10px 20px;
                    margin-left: 50px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                    height: 40px;
                    width: 75%;
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
                    padding: 12px
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

export default Promotions;