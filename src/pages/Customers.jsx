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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/customers');
            setCustomers(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const renderHead = (item, index) => <th key={index}>{item}</th>;

    const renderBody = (item, index) => (
        <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.Fullname || 'Không có tên'}</td>
            <td>{item.Email || 'Không có email'}</td>
            <td>{item.Phone || 'Không có SĐT'}</td>
            <td>{item.total_orders || 0}</td>
            <td>{item.total_spend ? `${item.total_spend.toLocaleString()} VND` : '0 VND'}</td>
            <td>{item.address || 'Không có địa chỉ'}</td>
        </tr>
    );

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2 className="page-header">Khách hàng</h2>
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card__body">
                            <Table
                                limit='10'
                                headData={customerTableHead}
                                renderHead={renderHead}
                                bodyData={customers}
                                renderBody={renderBody}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Customers;