import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import api from '../api';
import StatusCard from '../components/status-card/StatusCard';
import Table from '../components/table/Table';
import Badge from '../components/badge/Badge';

const Dashboard = () => {
    const themeReducer = useSelector(state => state.ThemeReducer.mode);

    const [dashboardData, setDashboardData] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        topCustomers: [],
        latestOrders: [],
        monthlyRevenue: [] // Khởi tạo là mảng rỗng
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard');
            console.log('Dashboard data:', response.data);
            
            // Đảm bảo monthlyRevenue luôn là mảng
            const data = response.data || {};
            setDashboardData({
                totalCustomers: data.totalCustomers || 0,
                totalProducts: data.totalProducts || 0,
                totalOrders: data.totalOrders || 0,
                totalRevenue: data.totalRevenue || 0,
                topCustomers: data.topCustomers || [],
                latestOrders: data.latestOrders || [],
                monthlyRevenue: data.monthlyRevenue || Array(12).fill(0)
            });
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const chartOptions = useMemo(() => ({
        chart: { 
            background: 'transparent', 
            toolbar: { show: false } 
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth' },
        colors: ['#6ab04c'],
        xaxis: {
            categories: [
                'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
            ]
        },
        yaxis: {
            labels: {
                formatter: (value) => `${value.toLocaleString()} VND`
            },
            title: { text: 'Doanh thu (VND)' }
        },
        grid: {
            borderColor: themeReducer === 'theme-mode-dark' ? '#424242' : '#e0e0e0',
        },
        theme: { mode: themeReducer === 'theme-mode-dark' ? 'dark' : 'light' }
    }), [themeReducer]);

    // Sửa lỗi: Đảm bảo monthlyRevenue luôn là mảng hợp lệ
    const chartSeries = useMemo(() => {
        const monthlyData = dashboardData.monthlyRevenue || [];
        // Đảm bảo có đủ 12 tháng
        const fullYearData = Array(12).fill(0).map((_, index) => 
            parseFloat(monthlyData[index]) || 0
        );
        
        return [
            { 
                name: 'Doanh thu', 
                data: fullYearData
            }
        ];
    }, [dashboardData.monthlyRevenue]);

    const orderStatus = {
        'Delivered': 'success',
        'Processing': 'warning',
        'Shipped': 'primary',
        'Pending': 'secondary',
        'Cancelled': 'danger'
    };

    const renderCustomerHead = (item, index) => <th key={index}>{item}</th>;
    const renderCustomerBody = (item, index) => (
        <tr key={index}>
            <td>{item.Fullname || 'Không có tên'}</td>
            <td>{item.total_orders || 0}</td>
            <td>{parseFloat(item.total_spend || 0).toLocaleString()} VND</td>
        </tr>
    );

    const renderOrderHead = (item, index) => <th key={index}>{item}</th>;
    const renderOrderBody = (item, index) => (
        <tr key={index}>
            <td>#{item.Id}</td>
            <td>{item.customer_name || 'Không có tên'}</td>
            <td>{parseFloat(item.total_amount || 0).toLocaleString()} VND</td>
            <td>{item.Order_date ? new Date(item.Order_date).toLocaleDateString('vi-VN') : 'N/A'}</td>
            <td>
                <Badge 
                    type={orderStatus[item.Order_status] || 'warning'} 
                    content={item.Order_status || 'Pending'} 
                />
            </td>
        </tr>
    );

    const statusCards = [
        { 
            icon: "bx bx-user", 
            count: dashboardData.totalCustomers || 0, 
            title: "Khách hàng" 
        },
        { 
            icon: "bx bx-cart", 
            count: dashboardData.totalOrders || 0, 
            title: "Đơn hàng" 
        },
        { 
            icon: "bx bx-box", 
            count: dashboardData.totalProducts || 0, 
            title: "Sản phẩm" 
        },
        { 
            icon: "bx bx-dollar", 
            count: `${parseFloat(dashboardData.totalRevenue || 0).toLocaleString()} VND`, 
            title: "Tổng doanh thu" 
        }
    ];

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2 className="page-header">Dashboard</h2>
            <p style={{ marginBottom: "20px", fontWeight: "500", fontSize: "16px" }}>
                Chào mừng bạn đến với trang quản trị của shop!
            </p>

            <div className="row">
                <div className="col-12">
                    <div className="row">
                        <div className="col-6">
                            <div className="row">
                                {statusCards.map((item, index) => (
                                    <div className="col-6" key={index}>
                                        <StatusCard 
                                            icon={item.icon} 
                                            count={item.count} 
                                            title={item.title} 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-6">
                            <div className="card full-height">
                                {/* Luôn render Chart với dữ liệu mặc định */}
                                <Chart
                                    options={chartOptions}
                                    series={chartSeries}
                                    type='line'
                                    height='100%'
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="row">
                        <div className="col-6">
                            <div className="card">
                                <div className="card__header"><h3>Khách hàng top</h3></div>
                                <div className="card__body">
                                    {dashboardData.topCustomers && dashboardData.topCustomers.length > 0 ? (
                                        <Table
                                            limit="5"
                                            headData={['Người dùng', 'Tổng đơn hàng', 'Tổng chi tiêu']}
                                            renderHead={renderCustomerHead}
                                            bodyData={dashboardData.topCustomers}
                                            renderBody={renderCustomerBody}
                                        />
                                    ) : (
                                        <p style={{ textAlign: 'center', padding: '20px' }}>
                                            Không có dữ liệu khách hàng.
                                        </p>
                                    )}
                                </div>
                                <div className="card__footer">
                                    <Link to='/customers'>Xem tất cả</Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-6">
                            <div className="card">
                                <div className="card__header"><h3>Đơn hàng mới nhất</h3></div>
                                <div className="card__body">
                                    {dashboardData.latestOrders && dashboardData.latestOrders.length > 0 ? (
                                        <Table
                                            limit="5"
                                            headData={['Mã ĐH', 'Khách hàng', 'Tổng tiền', 'Ngày', 'Trạng thái']}
                                            renderHead={renderOrderHead}
                                            bodyData={dashboardData.latestOrders}
                                            renderBody={renderOrderBody}
                                        />
                                    ) : (
                                        <p style={{ textAlign: 'center', padding: '20px' }}>
                                            Không có đơn hàng mới.
                                        </p>
                                    )}
                                </div>
                                <div className="card__footer">
                                    <Link to='/orders'>Xem tất cả</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;