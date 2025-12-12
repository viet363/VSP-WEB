import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import api from '../api';

const customerTableHead = [
    'STT',
    'Tên',
    'Email',
    'SĐT',
    'Tổng đơn hàng',
    'Tổng chi tiêu',
    'Địa chỉ'
];

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho bộ lọc
    const [filters, setFilters] = useState({
        searchTerm: '',
        minOrders: '',
        minSpend: '',
        maxSpend: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Áp dụng bộ lọc khi filters thay đổi
    useEffect(() => {
        applyFilters();
    }, [filters, customers]);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            console.log('Raw customers data:', response.data);
            
            // Đảm bảo dữ liệu không bị null/undefined
            const processedCustomers = response.data.map(item => ({
                ...item,
                Fullname: item.Fullname || 'Không có tên',
                Email: item.Email || 'Không có email',
                Phone: item.Phone || 'Không có SĐT',
                total_orders: parseInt(item.total_orders) || 0,
                total_spend: parseFloat(item.total_spend) || 0,
                address: item.address || 'Không có địa chỉ'
            }));
            
            console.log('Processed customers:', processedCustomers);
            
            setCustomers(processedCustomers);
            setFilteredCustomers(processedCustomers);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Hàm áp dụng bộ lọc
    const applyFilters = () => {
        let result = [...customers];
        
        // Lọc theo từ khóa tìm kiếm
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            result = result.filter(customer => 
                customer.Fullname.toLowerCase().includes(searchTerm) ||
                customer.Email.toLowerCase().includes(searchTerm) ||
                customer.Phone.toLowerCase().includes(searchTerm) ||
                (customer.address && customer.address.toLowerCase().includes(searchTerm))
            );
        }
        
        // Lọc theo số lượng đơn hàng tối thiểu
        if (filters.minOrders !== '') {
            const minOrders = parseInt(filters.minOrders);
            result = result.filter(customer => 
                customer.total_orders >= minOrders
            );
        }
        
        // Lọc theo tổng chi tiêu
        if (filters.minSpend !== '') {
            const minSpend = parseFloat(filters.minSpend);
            result = result.filter(customer => 
                customer.total_spend >= minSpend
            );
        }
        
        if (filters.maxSpend !== '') {
            const maxSpend = parseFloat(filters.maxSpend);
            result = result.filter(customer => 
                customer.total_spend <= maxSpend
            );
        }
        
        setFilteredCustomers(result);
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
            minOrders: '',
            minSpend: '',
            maxSpend: ''
        });
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;

    const renderBody = (item, index) => {
        const fullName = item.Fullname || 'Không có tên';
        const email = item.Email || 'Không có email';
        const phone = item.Phone || 'Không có SĐT';
        const totalOrders = item.total_orders || 0;
        const totalSpend = item.total_spend || 0;
        const address = item.address || 'Không có địa chỉ';

        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{fullName}</td>
                <td>{email}</td>
                <td>{phone}</td>
                <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: 
                            totalOrders >= 10 ? '#10b981' :
                            totalOrders >= 5 ? '#3b82f6' :
                            totalOrders >= 1 ? '#f59e0b' : '#6b7280',
                        color: 'white'
                    }}>
                        {totalOrders} đơn
                    </span>
                </td>
                <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: 
                            totalSpend >= 10000000 ? '#10b981' :
                            totalSpend >= 5000000 ? '#3b82f6' :
                            totalSpend >= 1000000 ? '#f59e0b' : '#6b7280',
                        color: 'white'
                    }}>
                        {totalSpend.toLocaleString('vi-VN')} VND
                    </span>
                </td>
                <td>{address}</td>
            </tr>
        );
    };

    if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Loading...</div>;
    if (error) return <div style={{ color: '#ef4444', padding: '20px' }}>Error: {error}</div>;

    return (
        <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
            <div className="page-header">
                <h2 style={{ color: '#f9fafb', margin: 0 }}>Khách hàng</h2>
            </div>

            {/* Bộ lọc khách hàng */}
            <div className="filter-section">
                <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc khách hàng</h3>
                <div className="filter-grid">
                    {/* Tìm kiếm theo tên, email, SĐT */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Tìm kiếm:
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên, email, SĐT hoặc địa chỉ..."
                            value={filters.searchTerm}
                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    {/* Lọc theo số lượng đơn hàng */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Số đơn hàng tối thiểu:
                        </label>
                        <input
                            type="number"
                            placeholder="Ví dụ: 5"
                            value={filters.minOrders}
                            onChange={(e) => handleFilterChange('minOrders', e.target.value)}
                            className="filter-input"
                            min="0"
                        />
                    </div>

                    {/* Lọc theo tổng chi tiêu */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Tổng chi tiêu:
                        </label>
                        <div className="price-range">
                            <input
                                type="number"
                                placeholder="Từ (VND)"
                                value={filters.minSpend}
                                onChange={(e) => handleFilterChange('minSpend', e.target.value)}
                                className="price-input"
                                min="0"
                            />
                            <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
                            <input
                                type="number"
                                placeholder="Đến (VND)"
                                value={filters.maxSpend}
                                onChange={(e) => handleFilterChange('maxSpend', e.target.value)}
                                className="price-input"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Nút reset filter */}
                    <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                        <button
                            onClick={resetFilters}
                            className="btn-reset"
                            disabled={!filters.searchTerm && !filters.minOrders && !filters.minSpend && !filters.maxSpend}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
                
                {/* Thông tin kết quả lọc */}
                <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
                    Đang hiển thị {filteredCustomers.length} / {customers.length} khách hàng
                </div>
            </div>

            <div className="card">
                <div className="card__body">
                    <Table
                        limit="10"
                        headData={customerTableHead}
                        renderHead={renderHead}
                        bodyData={filteredCustomers}
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
                .price-input {
                    padding: 10px;
                    border: 1px solid #4b5563;
                    border-radius: 6px;
                    background: #374151;
                    color: #e5e7eb;
                    font-size: 14px;
                    width: 100%;
                    box-sizing: border-box;
                }
                
                .filter-input::placeholder,
                .price-input::placeholder {
                    color: #9ca3af;
                    font-size: 12px;
                }
                
                .filter-input:focus,
                .price-input:focus {
                    border-color: #3b82f6;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .price-range {
                    display: flex;
                    align-items: center;
                }
                
                .price-input {
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

export default Customers;