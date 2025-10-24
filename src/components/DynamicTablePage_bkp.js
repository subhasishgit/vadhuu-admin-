import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, Pagination, IconButton, Modal } from '@mui/material';
import { SaveAlt as DownloadIcon, Edit, Delete } from '@mui/icons-material';

const DynamicTablePage = () => {
  const { tableName, pageTitle } = useParams(); // Get table name and page title from URL parameters
  const [tableData, setTableData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false); // Modal for Add/Edit
  const [formData, setFormData] = useState({}); // Data for Add/Edit form
  const [editMode, setEditMode] = useState(false); // Track whether we're adding or editing
  const limit = 20; // Limit records per page

  // Base API and image path
  const baseApiUrl = 'https://vadhuu.com/backend/';
  const baseImagePath = 'https://vadhuu.com/api/backend/uploads';

  // Fetch table data and columns dynamically based on tableName
  useEffect(() => {
    fetchData();
  }, [tableName, currentPage, search]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseApiUrl}table-data/${tableName}`, {
        params: { page: currentPage, search },
      });
      const filteredData = response.data.data.filter(row => row.id !== 1);
      setTableData(filteredData);
      setTotalRecords(response.data.totalRecords - 1);

      if (response.data.data.length > 0) {
        setColumns(Object.keys(response.data.data[0])); // Set columns based on the first row of data
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  // Handle pagination change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Open Add/Edit Modal
  const handleOpenModal = (record = null) => {
    if (record) {
      setEditMode(true);
      setFormData(record); // Set form data for editing
    } else {
      setEditMode(false);
      setFormData({}); // Clear form data for adding
    }
    setModalOpen(true);
  };

  // Handle input changes in the modal form
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => formDataObj.append(key, formData[key]));

    try {
      if (editMode) {
        await axios.put(`${baseApiUrl}table-data/${tableName}/${formData.id}`, formDataObj);
      } else {
        await axios.post(`${baseApiUrl}table-data/${tableName}`, formDataObj);
      }
      setModalOpen(false);
      fetchData(); // Refresh table data
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Handle record deletion
  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${baseApiUrl}table-data/${tableName}/${id}`);
        fetchData(); // Refresh table data
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  // Download CSV file for the table
  const handleDownloadCSV = async () => {
    try {
      const response = await axios.get(`${baseApiUrl}table-data/${tableName}/export`, {
        responseType: 'blob', // Important for handling file downloads
      });

      // Create a URL for the blob file and simulate a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tableName}.csv`); // Set the download attribute with the file name
      document.body.appendChild(link);
      link.click();
      link.remove(); // Remove the link from the DOM
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  // Determine field type based on the prefix and render appropriate element
  const renderField = (column, value) => {
    if (column.startsWith('image_')) {
      return <img src={`${baseImagePath}/${value}`} alt="image" width="100" />;
    } else if (column.startsWith('video_')) {
      return (
        <video width="100" controls>
          <source src={`${baseImagePath}/${value}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else if (column.startsWith('pdf_')) {
      return (
        <a href={`${baseImagePath}/${value}`} target="_blank" rel="noopener noreferrer">
          Download PDF
        </a>
      );
    }
    return value; // For other field types, simply return the value
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Dynamic Page Title */}
      <Typography variant="h4" gutterBottom>
        {pageTitle} Data
      </Typography>

      {/* Search Field and Add Button */}
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Search across all fields"
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 2 }}
          onClick={() => handleOpenModal()}
        >
          Add Record
        </Button>
        {/* <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          sx={{ ml: 2 }}
          onClick={handleDownloadCSV}
        >
          Download CSV
        </Button> */}
      </Box>

      {/* Dynamic Table Creation */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={`${column}-${index}`}>{renderField(column, row[column])}</TableCell>
                ))}
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(row)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteRecord(row.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Control */}
      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(totalRecords / limit)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ width: 500, p: 4, bgcolor: 'background.paper', margin: 'auto', top: '20%', position: 'relative' }}>
          <Typography variant="h6">{editMode ? 'Edit Record' : 'Add Record'}</Typography>
          <form onSubmit={handleFormSubmit}>
            {columns.map((column) => {
              // Exclude the "id" field from the modal
              if (column !== 'id') {
                return column.startsWith('image_') || column.startsWith('video_') || column.startsWith('pdf_') ? (
                  // Handle file input
                  <div key={column}>
                    <label>{column}</label>
                    <input
                      type="file"
                      name={column}
                      onChange={handleInputChange} // Do not bind "value" for file inputs
                    />
                  </div>
                ) : (
                  // Handle other text inputs
                  <TextField
                    key={column}
                    label={column}
                    name={column}
                    value={formData[column] || ''}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                );
              }
              return null; // Do not render the "id" field
            })}
            <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
              {editMode ? 'Save Changes' : 'Add Record'}
            </Button>
          </form>
        </Box>
      </Modal>

    </Box>
  );
};

export default DynamicTablePage;
