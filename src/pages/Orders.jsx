import React, { useEffect, useState } from 'react';
import Table from '../components/table/Table';
import api from '../api';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { Order_status: newStatus });
            // Update local state
            setOrders(orders.map(order => 
                order.Id === orderId ? { ...order, Order_status: newStatus } : order
            ));
        } catch (err) {
            alert('Lỗi khi cập nhật trạng thái: ' + err.response?.data?.error || err.message);
        }
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;

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
            `}</style>
        </div>
    );
};

export default Orders;