<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import './table.css';

const Table = ({ limit, headData, renderHead, bodyData = [], renderBody }) => {

    // ❤️ Luôn đảm bảo bodyData là array
    const safeData = Array.isArray(bodyData) ? bodyData : [];

    const [dataShow, setDataShow] = useState([]);
    const [currPage, setCurrPage] = useState(0);

    // Tính số trang
    const pageLimit = Number(limit) || safeData.length || 1;
    const totalPages = Math.ceil(safeData.length / pageLimit);
    const pages = [...Array(totalPages).keys()];

    // Khi dữ liệu thay đổi → reset table
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
=======
import React, {useState} from 'react'

import './table.css'

const Table = props => {

    const initDataShow = props.limit && props.bodyData ? props.bodyData.slice(0, Number(props.limit)) : props.bodyData

    const [dataShow, setDataShow] = useState(initDataShow)

    let pages = 1

    let range = []

    if (props.limit !== undefined) {
        let page = Math.floor(props.bodyData.length / Number(props.limit))
        pages = props.bodyData.length % Number(props.limit) === 0 ? page : page + 1
        range = [...Array(pages).keys()]
    }

    const [currPage, setCurrPage] = useState(0)

    const selectPage = page => {
        const start = Number(props.limit) * page
        const end = start + Number(props.limit)

        setDataShow(props.bodyData.slice(start, end))

        setCurrPage(page)
    }
>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988

    return (
        <div>
            <div className="table-wrapper">
                <table>
<<<<<<< HEAD
                    {/* Render head */}
                    {headData && renderHead && (
                        <thead>
                            <tr>
                                {(headData || []).map((item, index) =>
                                    renderHead(item, index)
                                )}
                            </tr>
                        </thead>
                    )}

                    {/* Render body */}
                    {renderBody && (
                        <tbody>
                            {dataShow.map((item, index) =>
                                renderBody(item, index)
                            )}
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
=======
                    {
                        props.headData && props.renderHead ? (
                            <thead>
                                <tr>
                                    {
                                        props.headData.map((item, index) => props.renderHead(item, index))
                                    }
                                </tr>
                            </thead>
                        ) : null
                    }
                    {
                        props.bodyData && props.renderBody ? (
                            <tbody>
                                {
                                    dataShow.map((item, index) => props.renderBody(item, index))
                                }
                            </tbody>
                        ) : null
                    }
                </table>
            </div>
            {
                pages > 1 ? (
                    <div className="table__pagination">
                        {
                            range.map((item, index) => (
                                <div key={index} className={`table__pagination-item ${currPage === index ? 'active' : ''}`} onClick={() => selectPage(index)}>
                                    {item + 1}
                                </div>
                            ))
                        }
                    </div>
                ) : null
            }
        </div>
    )
}

export default Table
>>>>>>> a0aefc4483ec64fe1de8054464a781bae476a988
