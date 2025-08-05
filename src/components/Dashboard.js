import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { io } from 'socket.io-client';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const Dashboard = () => {
  const [aggregatedData, setAggregatedData] = useState([]);
  const [recentData, setRecentData] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ page_url: '', ip_address: '', country: '' });
  const [isTableCollapsed, setIsTableCollapsed] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const socket = io('https://vadhuu.com'); // Replace with your backend URL

    socket.on('connect', () => {
      // console.log('Connected to Socket.IO server');
    });

    socket.on('visit-update', (data) => {
      // console.log('Real-time update received:', data);
      fetchAggregatedData();
      fetchRecentData(page);
    });

    fetchAggregatedData();
    fetchRecentData(page);

    return () => {
      socket.disconnect();
    };
  }, [page]);

  const fetchAggregatedData = () => {
    axios.get('https://vadhuu.com/stats/aggregated').then((res) => {
      setAggregatedData(res.data);
    });
  };

  const fetchRecentData = (page) => {
    axios.get(`https://vadhuu.com/stats/recent?page=${page}&limit=20`).then((res) => {
      setRecentData(res.data);
      setFilteredData(res.data); // Initialize filtered data
      setTotalVisits(res.data.reduce((sum, item) => sum + item.visits, 0));
    });
  };

  const applyFilters = () => {
    let filtered = recentData;

    if (filters.page_url) {
      filtered = filtered.filter((item) => item.page_url.includes(filters.page_url));
    }

    if (filters.ip_address) {
      filtered = filtered.filter((item) => item.ip_address.includes(filters.ip_address));
    }

    if (filters.country) {
      filtered = filtered.filter((item) => item.country.includes(filters.country));
    }

    setFilteredData(filtered);
    setTotalVisits(filtered.reduce((sum, item) => sum + item.visits, 0));
  };
  const getChartData = (key) => {
    if (key === 'page_url') {
      const labels = aggregatedData.map((item) => {
        // Truncate to last 20 characters with ellipsis
        return item[key].length > 20 ? '...' + item[key].slice(-20) : item[key];
      });

      const data = aggregatedData.map((item) => item.visits);
      const fullUrls = aggregatedData.map((item) => item[key]); // Full URLs for tooltips

      return {
        labels,
        datasets: [
          {
            label: 'Page Visits',
            data,
            backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(153,102,255,0.6)', 'rgba(255,159,64,0.6)'],
            fullUrls, // Attach full URLs to the dataset for tooltips
          },
        ],
      };
    }

    // Explicit handling for `month` and `country`
    if (key === 'month' || key === 'country') {
      const groupedData = aggregatedData.reduce((acc, item) => {
        if (acc[item[key]]) {
          acc[item[key]] += item.visits; // Aggregate visits for each unique month/country
        } else {
          acc[item[key]] = item.visits;
        }
        return acc;
      }, {});

      const labels = Object.keys(groupedData); // Unique months or countries
      const data = Object.values(groupedData); // Corresponding aggregated visits

      return {
        labels,
        datasets: [
          {
            label: `${key.charAt(0).toUpperCase() + key.slice(1)} Visits`, // Capitalize the key for label
            data,
            backgroundColor: ['rgba(75,192,192,0.6)', 'rgba(153,102,255,0.6)', 'rgba(255,159,64,0.6)'],
          },
        ],
      };
    }

    // Default fallback (if key doesn't match page_url, month, or country)
    return {
      labels: [],
      datasets: [],
    };
  };

  return (
    <div style={styles.container}>
      <Typography variant='h3' component='h1' gutterBottom>Dashboard</Typography>

      {/* Charts Section */}
      <div style={styles.chartSection}>
        <div style={styles.chartBox}>
          <Typography variant='h4' component='h2' gutterBottom textAlign='center'>Page-wise Visits</Typography>
          <Bar
            data={getChartData('page_url')}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const fullUrls = context.dataset.fullUrls || []; // Access full URLs from dataset
                      const fullUrl = fullUrls[context.dataIndex] || 'Unknown URL'; // Fallback for undefined index
                      const count = context.raw || 0; // Access the visit count directly
                      return [`Full URL: ${fullUrl}`, `Visit Count: ${count}`]; // Return both lines
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    callback: function (value) {
                      const label = this.getLabelForValue(value);
                      return label || ''; // Fallback for undefined labels
                    },
                  },
                },
              },
            }}
          />
        </div>


        <div style={styles.chartBox}>
          <Typography variant='h4' component='h2' gutterBottom textAlign='center'>Month-wise Visits</Typography>
          <Line data={getChartData('month')} />
        </div>
        <div style={styles.chartBox}>
          <Typography variant='h4' component='h2' gutterBottom textAlign='center'>Country-wise Visits</Typography>
          <Pie data={getChartData('country')} />
        </div>
      </div>

      {/* Collapsible Table */}
      <div style={styles.tableContainer}>
        <Button color='primary' variant='contained' size='small' onClick={() => setIsTableCollapsed(!isTableCollapsed)}>
          {isTableCollapsed ? 'Show Recent Visits' : 'Hide Recent Visits'}
        </Button>

        {!isTableCollapsed && (
          <div style={styles.filterContainer}>
            <h3 style={styles.filterHeading}>Filter Visits</h3>
            <input
              type="text"
              placeholder="Filter by Page URL"
              style={styles.filterInput}
              value={filters.page_url}
              onChange={(e) => setFilters({ ...filters, page_url: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by IP Address"
              style={styles.filterInput}
              value={filters.ip_address}
              onChange={(e) => setFilters({ ...filters, ip_address: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by Country"
              style={styles.filterInput}
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
            <button style={styles.filterButton} onClick={applyFilters}>Apply Filters</button>
            {/* <p>Total Visits: {totalVisits}</p> */}
          </div>
        )}

        {!isTableCollapsed && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="insight table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Page URL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Referrer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Country</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>IP Address</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Visit Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow
                    key={item.index}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >

                    <TableCell component="th" scope="row" >{item.page_url}</TableCell>
                    <TableCell align="right">{item.referrer || 'Direct'}</TableCell>
                    <TableCell align="right">{item.country || 'Unknown'}</TableCell>
                    <TableCell align="right">{item.ip_address}</TableCell>
                    <TableCell align="right" >
                      {new Date(item.visit_time).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: '20px',
  },
  header: {
    marginBottom: '20px',
  },
  chartSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
  },
  chartBox: {
    width: '30%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
  },
  chartHeading: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  tableContainer: {
    marginTop: '20px',
  },
  toggleButton: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  filterContainer: {
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  filterHeading: {
    marginRight: '10px',
  },
  filterInput: {
    padding: '5px',
    fontSize: '14px',
  },
  filterButton: {
    padding: '5px 10px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  cell: {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'left',
  },
};

export default Dashboard;
