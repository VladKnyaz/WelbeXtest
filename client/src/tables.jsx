import React, { useEffect, useState, useRef } from 'react';
import Axios from 'axios';

function Tables() {
    const [filterTable, setFilterTable] = useState([]);
    const [isFilter, setIsFilter] = useState(false);

    const [selectedOpt, setSelectedOpt] = useState('name');
    const [selectedOpt2, setSelectedOpt2] = useState('equal');

    const [fetching, setFetching] = useState(true);
    const [countPage, setCountPage] = useState(1);

    const totalCountEl = useRef(0);
    const tables = useRef([]);

    useEffect(() => {
        if (fetching) {
            Axios.get(`http://185.182.111.184:5000/api/table/${countPage}`)
                .then((res) => {
                    if (res.data.data) {
                        if (!isFilter) {
                            setFilterTable((prev) => {
                                return [...prev, ...res.data.data];
                            });
                        }
                        totalCountEl.current = res.data.totalCount;
                        tables.current = [...tables.current, ...res.data.data];
                    }
                })
                .catch((e) => {
                    console.log(e);
                })
                .finally(() => {
                    setFetching(false);
                });
        }
    }, [fetching, countPage, isFilter]);

    useEffect(() => {
        document.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        return function () {
            document.removeEventListener('scroll');
            document.removeEventListener('resize');
        };
    }, []);

    function handleResize() {
        // если скролл вдруг почему-то исчезнет будет работать resize
        // и данные будут появляеться по мере увелечения масштаба
        let elTableRect = document.querySelector('.table').getBoundingClientRect();
        let spaceBelow = window.innerHeight - elTableRect.bottom; // расстояние от нижней границы до таблицы

        if (spaceBelow > 150) return;
        if (window.innerWidth > document.body.clientWidth) return;
        if (tables.current.length >= totalCountEl.current) return;

        setCountPage((prev) => prev + 1);
        setFetching(true);
    }

    function handleScroll(e) {
        if (tables.current.length >= totalCountEl.current) return;
        if (
            e.target.documentElement.scrollHeight -
                (e.target.documentElement.scrollTop + window.innerHeight) <
            1200
        ) {
            if (tables.current.length >= totalCountEl.current) return;
            setCountPage((prev) => prev + 1);
            setFetching(true);
        }
    }

    function filter1Change(e) {
        setSelectedOpt(e.target.value);
    }

    function filter2Change(e) {
        setSelectedOpt2(e.target.value);
    }

    let timeDebounce;
    function handleChangeFilterText(e) {
        if (timeDebounce) clearTimeout(timeDebounce);
        timeDebounce = setTimeout(() => {
            if (!e.target.value || e.target.value.trim() === '') {
                setFilterTable(tables.current);
                return;
            }
            let searchText = e.target.value;
            setFilterTable(
                tables.current.filter((el) => {
                    switch (selectedOpt) {
                        case 'name': {
                            switch (selectedOpt2) {
                                case 'equal': {
                                    return el.name === searchText;
                                }
                                case 'contains': {
                                    return el.name.indexOf(searchText) !== -1;
                                }
                                default:
                                    return el;
                            }
                        }

                        case 'count': {
                            switch (selectedOpt2) {
                                case 'equal': {
                                    return el.count === parseInt(searchText);
                                }
                                case 'contains': {
                                    return String(el.count).indexOf(searchText) !== -1;
                                }

                                case 'more': {
                                    return el.count > parseInt(searchText);
                                }

                                case 'less': {
                                    return el.count < parseInt(searchText);
                                }
                                default:
                                    return el;
                            }
                        }

                        case 'distance': {
                            switch (selectedOpt2) {
                                case 'equal': {
                                    return el.distance === parseInt(searchText);
                                }
                                case 'contains': {
                                    return String(el.distance).indexOf(searchText) !== -1;
                                }

                                case 'more': {
                                    return el.distance > parseInt(searchText);
                                }

                                case 'less': {
                                    return el.distance < parseInt(searchText);
                                }
                                default:
                                    return el;
                            }
                        }

                        default:
                            break;
                    }
                    return false;
                }),
            );
        }, 300);
    }

    return (
        <div className="datatable">
            <table border={'1'} className="table">
                <tbody>
                    <tr>
                        <th>Дата</th>
                        <th>Название</th>
                        <th>Количество</th>
                        <th>Расстояние</th>
                    </tr>
                    {filterTable.map((row) => {
                        let date = new Date(row.date);
                        date = date.getDay() + '.' + date.getMonth() + '.' + date.getFullYear();
                        return (
                            <tr key={row.id}>
                                <td>{date}</td>
                                <td>{row.name}</td>
                                <td>{row.count}</td>
                                <td>{row.distance}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="filters">
                <div className="filter1">
                    <select value={selectedOpt} onChange={filter1Change}>
                        <option value="name">Название</option>
                        <option value="count">Количество</option>
                        <option value="distance">Расстояние</option>
                    </select>
                    <select value={selectedOpt2} onChange={filter2Change}>
                        <option value="equal">равно</option>
                        <option value="contains">содержит</option>
                        <option value="more">больше</option>
                        <option value="less">меньше</option>
                    </select>
                    <input type="text" onChange={handleChangeFilterText} />
                    <button type="submit">Поиск</button>
                </div>
            </div>
        </div>
    );
}

export default Tables;
