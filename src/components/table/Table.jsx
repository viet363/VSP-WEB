import React, { useState, useEffect } from 'react';
import './table.css';

const Table = ({ limit, headData, renderHead, bodyData = [], renderBody }) => {

    const safeData = Array.isArray(bodyData) ? bodyData : [];

    const [dataShow, setDataShow] = useState([]);
    const [currPage, setCurrPage] = useState(0);

    // Số phần tử mỗi trang
    const pageLimit = Number(limit) || safeData.length || 1;

    // Tổng trang
    const totalPages = Math.ceil(safeData.length / pageLimit);
    const pages = [...Array(totalPages).keys()];

    // Reset khi dữ liệu thay đổi
    useEffect(() => {
        const start = 0;
        const end = pageLimit;

        setDataShow(safeData.slice(start, end));
        setCurrPage(0);
    }, [safeData, pageLimit]);

    // Chọn trang
    const selectPage = (page) => {
        const start = page * pageLimit;
        const end = start + pageLimit;

        setDataShow(safeData.slice(start, end));
        setCurrPage(page);
    };

    return (
        <div>
            <div className="table-wrapper">
                <table>
                    {headData && renderHead && (
                        <thead>
                            <tr>
                                {headData.map((item, index) => renderHead(item, index))}
                            </tr>
                        </thead>
                    )}

                    {renderBody && (
                        <tbody>
                            {dataShow.map((item, index) => renderBody(item, index))}
                        </tbody>
                    )}
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="table__pagination">
                    {pages.map((page, i) => (
                        <div
                            key={i}
                            className={`table__pagination-item ${currPage === i ? 'active' : ''}`}
                            onClick={() => selectPage(i)}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Table;
