import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import api from '../api';
<<<<<<< HEAD
import { Modal, Table as AntTable, Tag } from "antd";
=======
>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988

const orderTableHead = [
    'STT',
    'Mã đơn',
    'Khách hàng',
    'Tổng tiền',
    'Ngày đặt',
    'Trạng thái',
    'Phương thức thanh toán',
    'Hành động'
];

const Orders = () => {
    const [orders, setOrders] = useState([]);
<<<<<<< HEAD
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho bộ lọc
    const [filters, setFilters] = useState({
        searchTerm: '',
        status: '',
        paymentType: '',
        dateRange: {
            start: '',
            end: ''
        },
        amountRange: {
            min: '',
            max: ''
        }
    });

    // MODAL DETAIL
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);

=======
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988
    useEffect(() => {
        fetchOrders();
    }, []);

<<<<<<< HEAD
    // Áp dụng bộ lọc khi filters thay đổi
    useEffect(() => {
        applyFilters();
    }, [filters, orders]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            console.log('Raw orders data:', response.data);
            
            // Đảm bảo dữ liệu không bị null/undefined
            const processedOrders = response.data.map(item => ({
                ...item,
                customer_name: item.customer_name || 'Không có tên',
                total: parseFloat(item.total || 0),
                Order_status: item.Order_status || 'Pending',
                Payment_type: item.Payment_type || 'COD',
                Order_date: item.Order_date || new Date().toISOString()
            }));
            
            setOrders(processedOrders);
            setFilteredOrders(processedOrders);
        } catch (err) {
            setError(err.message);
        } finally {
=======
    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988
            setLoading(false);
        }
    };

<<<<<<< HEAD
    // Hàm áp dụng bộ lọc
    const applyFilters = () => {
        let result = [...orders];
        
        // Lọc theo từ khóa tìm kiếm
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            result = result.filter(order => 
                order.customer_name.toLowerCase().includes(searchTerm) ||
                order.Id.toString().includes(searchTerm)
            );
        }
        
        // Lọc theo trạng thái
        if (filters.status) {
            result = result.filter(order => 
                order.Order_status === filters.status
            );
        }
        
        // Lọc theo phương thức thanh toán
        if (filters.paymentType) {
            result = result.filter(order => 
                order.Payment_type === filters.paymentType
            );
        }
        
        // Lọc theo ngày
        if (filters.dateRange.start) {
            const startDate = new Date(filters.dateRange.start);
            result = result.filter(order => 
                new Date(order.Order_date) >= startDate
            );
        }
        
        if (filters.dateRange.end) {
            const endDate = new Date(filters.dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            result = result.filter(order => 
                new Date(order.Order_date) <= endDate
            );
        }
        
        // Lọc theo tổng tiền
        if (filters.amountRange.min !== '') {
            const minAmount = parseFloat(filters.amountRange.min);
            result = result.filter(order => 
                order.total >= minAmount
            );
        }
        
        if (filters.amountRange.max !== '') {
            const maxAmount = parseFloat(filters.amountRange.max);
            result = result.filter(order => 
                order.total <= maxAmount
            );
        }
        
        setFilteredOrders(result);
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
            paymentType: '',
            dateRange: {
                start: '',
                end: ''
            },
            amountRange: {
                min: '',
                max: ''
            }
        });
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const res = await api.get(`/orders/${orderId}`);

            setSelectedOrder(res.data.order);
            setOrderItems(res.data.items);
            setShowModal(true);
        } catch (err) {
            alert("Lỗi lấy chi tiết đơn hàng!");
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { Order_status: newStatus });

            setOrders(orders.map(order =>
                order.Id === orderId ? { ...order, Order_status: newStatus } : order
            ));
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái: ' + (err.response?.data?.error || err.message));
=======
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { Order_status: newStatus });
            // Update local state
            setOrders(orders.map(order => 
                order.Id === orderId ? { ...order, Order_status: newStatus } : order
            ));
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái: ' + err.response?.data?.error || err.message);
>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988
        }
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;

<<<<<<< HEAD
    const renderBody = (item, index) => {
        const totalAmount = parseFloat(item.total || 0);
        
        return (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>#{item.Id}</td>
                <td>{item.customer_name || 'Không có tên'}</td>

                <td>
                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        backgroundColor: 
                            totalAmount >= 5000000 ? '#10b981' :
                            totalAmount >= 2000000 ? '#3b82f6' :
                            totalAmount >= 500000 ? '#f59e0b' : '#6b7280',
                        color: 'white',
                        display: 'inline-block'
                    }}>
                        {totalAmount.toLocaleString('vi-VN')} VND
                    </span>
                </td>

                <td>{new Date(item.Order_date).toLocaleDateString('vi-VN')}</td>

                <td>
                    <select
                        value={item.Order_status}
                        onChange={(e) => handleStatusChange(item.Id, e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #4b5563',
                            background: '#374151',
                            color: '#e5e7eb',
                            minWidth: '140px',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Processing">Đang xử lý</option>
                        <option value="Shipped">Đang giao</option>
                        <option value="Delivered">Đã giao</option>
                        <option value="Cancelled">Đã huỷ</option>
                        <option value="Returned">Trả hàng</option>
                    </select>
                </td>

                <td>
                    <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: item.Payment_type === 'COD' ? '#3b82f6' : '#10b981',
                        color: 'white'
                    }}>
                        {item.Payment_type}
                    </span>
                </td>

                <td>
                    <button
                        className="btn-view"
                        onClick={() => fetchOrderDetail(item.Id)}
                    >
                        Xem chi tiết
                    </button>
                </td>
            </tr>
        );
    };

    if (loading) return <div style={{ color: '#e5e7eb', padding: '20px' }}>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ color: '#ef4444', padding: '20px' }}>Lỗi: {error}</div>;

    return (
        <div style={{ backgroundColor: '#111827', minHeight: '100vh', color: '#e5e7eb', padding: '20px' }}>
            <div className="page-header">
                <h2 style={{ color: '#f9fafb', margin: 0 }}>Đơn hàng</h2>
                <button onClick={fetchOrders} className="btn btn-add">
                    Làm mới
                </button>
            </div>

            {/* Bộ lọc đơn hàng */}
            <div className="filter-section">
                <h3 style={{ color: '#f9fafb', marginBottom: '15px' }}>Bộ lọc đơn hàng</h3>
                <div className="filter-grid">
                    {/* Tìm kiếm */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Tìm kiếm:
                        </label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên KH hoặc mã đơn..."
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
                            <option value="Pending">Chờ xử lý</option>
                            <option value="Processing">Đang xử lý</option>
                            <option value="Shipped">Đang giao</option>
                            <option value="Delivered">Đã giao</option>
                            <option value="Cancelled">Đã huỷ</option>
                            <option value="Returned">Trả hàng</option>
                        </select>
                    </div>

                    {/* Lọc theo phương thức thanh toán */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Thanh toán:
                        </label>
                        <select
                            value={filters.paymentType}
                            onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Tất cả phương thức</option>
                            <option value="COD">COD</option>
                            <option value="BANKING">Chuyển khoản</option>
                            <option value="CARD">Thẻ</option>
                            <option value="MOMO">MOMO</option>
                        </select>
                    </div>

                    {/* Lọc theo ngày */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Ngày đặt:
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

                    {/* Lọc theo tổng tiền */}
                    <div className="filter-group">
                        <label style={{ display: 'block', marginBottom: '5px', color: '#e5e7eb' }}>
                            Tổng tiền:
                        </label>
                        <div className="amount-range">
                            <input
                                type="number"
                                placeholder="Từ (VND)"
                                value={filters.amountRange.min}
                                onChange={(e) => handleFilterChange('amountRange.min', e.target.value)}
                                className="amount-input"
                                min="0"
                            />
                            <span style={{ color: '#9ca3af', margin: '0 8px' }}>-</span>
                            <input
                                type="number"
                                placeholder="Đến (VND)"
                                value={filters.amountRange.max}
                                onChange={(e) => handleFilterChange('amountRange.max', e.target.value)}
                                className="amount-input"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Nút reset filter */}
                    <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
                        <button
                            onClick={resetFilters}
                            className="btn-reset"
                            disabled={!filters.searchTerm && !filters.status && !filters.paymentType && 
                                     !filters.dateRange.start && !filters.dateRange.end && 
                                     !filters.amountRange.min && !filters.amountRange.max}
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
                
                {/* Thông tin kết quả lọc */}
                <div style={{ marginTop: '10px', color: '#9ca3af', fontSize: '14px' }}>
                    Đang hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                    {filters.status && ` • Trạng thái: ${filters.status}`}
                    {filters.paymentType && ` • Thanh toán: ${filters.paymentType}`}
                </div>
            </div>

            <div className="card">
                <div className="card__body">
                    <Table
                        limit="10"
                        headData={orderTableHead}
                        renderHead={renderHead}
                        bodyData={filteredOrders}
                        renderBody={renderBody}
                    />
                </div>
            </div>

            {/* MODAL */}
            <Modal
                title={`Chi tiết đơn hàng #${selectedOrder?.Id}`}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                width={750}
                style={{ top: 20 }}
                bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
            >
                {selectedOrder && (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <p><b>Khách hàng:</b> {selectedOrder.customer_name}</p>
                            <p><b>Email:</b> {selectedOrder.customer_email || 'N/A'}</p>
                            <p><b>Điện thoại:</b> {selectedOrder.customer_phone || 'N/A'}</p>
                            <p><b>Địa chỉ:</b> {selectedOrder.shipping_address || 'N/A'}</p>
                            <p><b>Ngày đặt:</b> {new Date(selectedOrder.Order_date).toLocaleDateString("vi-VN")}</p>
                            <p>
                                <b>Trạng thái:</b>{" "}
                                <Tag
                                    color={
                                        selectedOrder.Order_status === "Pending" ? "blue" :
                                        selectedOrder.Order_status === "Processing" ? "orange" :
                                        selectedOrder.Order_status === "Shipped" ? "cyan" :
                                        selectedOrder.Order_status === "Delivered" ? "green" :
                                        selectedOrder.Order_status === "Cancelled" ? "red" :
                                        "default"
                                    }
                                >
                                    {selectedOrder.Order_status}
                                </Tag>
                            </p>
                            <p><b>Phương thức thanh toán:</b> {selectedOrder.Payment_type}</p>
                        </div>

                        <AntTable
                            columns={[
                                { title: "STT", dataIndex: "index", width: 60 },
                                { title: "Sản phẩm", dataIndex: "Product_name" },
                                { title: "Số lượng", dataIndex: "Quantity", width: 80 },
                                {
                                    title: "Đơn giá",
                                    dataIndex: "Unit_price",
                                    render: v => parseFloat(v).toLocaleString() + " VND"
                                },
                                {
                                    title: "Thành tiền",
                                    render: (_, row) =>
                                        (row.Quantity * row.Unit_price).toLocaleString() + " VND"
                                }
                            ]}
                            dataSource={orderItems.map((it, i) => ({
                                ...it,
                                index: i + 1,
                                key: i
                            }))}
                            pagination={false}
                            style={{ marginTop: 10 }}
                        />

                        <div style={{ 
                            marginTop: 24, 
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: '4px 0' }}><b>Tạm tính:</b></p>
                                    <p style={{ margin: '4px 0' }}><b>Phí vận chuyển:</b></p>
                                    <p style={{ margin: '4px 0' }}><b>Giảm giá:</b></p>
                                    <p style={{ margin: '4px 0', fontSize: '18px', color: '#10b981' }}><b>TỔNG TIỀN:</b></p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '4px 0' }}>
                                        {orderItems.reduce((sum, it) => sum + it.Unit_price * it.Quantity, 0).toLocaleString()} VND
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        {parseInt(selectedOrder.Shipping_fee || 0).toLocaleString()} VND
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                        -{parseInt(selectedOrder.Discount_amount || 0).toLocaleString()} VND
                                    </p>
                                    <p style={{ margin: '4px 0', fontSize: '18px', color: '#10b981' }}>
                                        <b>{parseFloat(selectedOrder.total || 0).toLocaleString()} VND</b>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

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
                .amount-input {
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
                .amount-input:focus {
                    border-color: #3b82f6;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .date-range,
                .amount-range {
                    display: flex;
                    align-items: center;
                }
                
                .date-input,
                .amount-input {
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
                
                .btn-view {
                    background: #3b82f6;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                
                .btn-view:hover { 
                    background: #2563eb;
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
=======
    const renderBody = (item, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>#{item.Id}</td>
            <td>{item.customer_name || 'Không có tên'}</td>
            <td>{parseFloat(item.total_amount || 0).toLocaleString()} VND</td>
            <td>{new Date(item.Order_date).toLocaleDateString('vi-VN')}</td>
            <td>
                <select
                    value={item.Order_status}
                    onChange={(e) => handleStatusChange(item.Id, e.target.value)}
                    style={{
                        padding: '5px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                >
                    <option value="Pending">Chờ xử lý</option>
                    <option value="Processing">Đang xử lý</option>
                    <option value="Shipped">Đang giao</option>
                    <option value="Delivered">Đã giao</option>
                    <option value="Cancelled">Đã huỷ</option>
                    <option value="Returned">Trả hàng</option>
                </select>
            </td>
            <td>{item.Payment_type}</td>
            <td>
                <button 
                    className="btn-view" 
                    onClick={() => alert(`Chi tiết đơn hàng #${item.Id}`)}
                >
                    Xem
                </button>
            </td>
        </tr>
    );

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div>
            <h2 className="page-header">Đơn hàng</h2>

            <div style={{ marginBottom: '16px' }}>
                <button onClick={fetchOrders} className="btn btn-refresh">
                    🔄 Làm mới
                </button>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card__body">
                            <Table
                                limit="10"
                                headData={orderTableHead}
                                renderHead={renderHead}
                                bodyData={orders}
                                renderBody={renderBody}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .btn-view {
                    background: #4caf50;
                    color: white;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .btn-view:hover { background: #45a049; }
                .btn-refresh {
                    background: #2196f3;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .btn-refresh:hover { background: #1976d2; }
>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988
            `}</style>
        </div>
    );
};

export default Orders;