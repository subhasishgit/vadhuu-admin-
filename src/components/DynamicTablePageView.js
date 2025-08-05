import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Container,
  Button,
  Pagination,
  IconButton,
  Modal,
} from '@mui/material';

import { Edit, Delete } from '@mui/icons-material';

const DynamicTablePageView = () => {
  const { tableName, pageTitle, viewType } = useParams(); // viewType can be 'portrait' or 'landscape'
  const [tableData, setTableData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [columns, setColumns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const limit = 20;

  const baseApiUrl = 'https://vadhuu.com/backend/';
  const baseImagePath = 'https://vadhuu.com/api/cmsapi/uploads';

  useEffect(() => {
    fetchData();
  }, [tableName, currentPage, search]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${baseApiUrl}table-data/${tableName}`, {
        params: { page: currentPage, search },
      });
      const filteredData = response.data.data.filter((row) => row.id !== 1);
      setTableData(filteredData);
      setTotalRecords(response.data.totalRecords - 1);

      if (response.data.data.length > 0) {
        setColumns(Object.keys(response.data.data[0]));
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditMode(true);
      setFormData(record);
    } else {
      setEditMode(false);
      setFormData({});
    }
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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
      fetchData();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${baseApiUrl}table-data/${tableName}/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

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
          Download Document
        </a>
      );
    }
    return value;
  };

  const formatLabel = (column) => {
    return column
      .replace(/^image_|^video_|^pdf_/, '')
      .replace(/_/g, ' ')
      .toUpperCase();
  };

  // Render the landscape table (default table view)
  const renderLandscapeTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{formatLabel(column)}</TableCell>
            ))}
            <TableCell sx={{ fontWeight: 600, textTransform: 'capitalize' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={`${column}-${index}`}>{renderField(column, row[column])}</TableCell>
              ))}
              <TableCell>
                {/* <IconButton onClick={() => handleOpenModal(row)}>
                  <Edit />
                </IconButton> */}
                <IconButton onClick={() => handleDeleteRecord(row.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render the portrait table (one table per row)
  const renderPortraitTable = () => (
    <TableContainer component={Paper}>
      {tableData.map((row, index) => (
        <Table key={index} sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                <Typography variant="h6" component='p'>Record {index + 1}</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {columns.map((column) => (
              <TableRow key={`${column}-${index}`}>
                <TableCell>{formatLabel(column)}</TableCell>
                <TableCell>{renderField(column, row[column])}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2}>
                <Box display="flex" justifyContent="flex-end">
                  {/* <IconButton onClick={() => handleOpenModal(row)} sx={{ mr: 2 }}>
                    <Edit />
                  </IconButton> */}
                  <IconButton onClick={() => handleDeleteRecord(row.id)}>
                    <Delete />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ))}
    </TableContainer>
  );

  return (

    <Container maxWidth="xl" disableGutters>
     
        <Typography variant="h4" gutterBottom>
          {pageTitle} Data
        </Typography>

        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={search}
            onChange={handleSearchChange}
            placeholder="Search across all fields"
          />
          {/* <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => handleOpenModal()}>
          Add Record
        </Button> */}
        </Box>

        {/* Conditionally render the landscape or portrait table based on viewType */}
        {viewType === 'potrait' ? renderPortraitTable() : renderLandscapeTable()}

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
          <Box
            sx={{
              width: 500,
              p: 4,
              bgcolor: 'background.paper',
              margin: 'auto',
              top: '20%',
              position: 'relative',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <Typography variant="h6">{editMode ? 'Edit Record' : 'Add Record'}</Typography>
            <form onSubmit={handleFormSubmit}>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {columns.map((column) => {
                      if (column !== 'id') {
                        return (
                          <TableRow key={column}>
                            <TableCell>{formatLabel(column)}</TableCell>
                            <TableCell>
                              {column.startsWith('image_') && formData[column] && (
                                <img
                                  src={`${baseImagePath}/${formData[column]}`}
                                  alt="image preview"
                                  width="100"
                                />
                              )}
                              {column.startsWith('video_') && formData[column] && (
                                <video width="100" controls>
                                  <source
                                    src={`${baseImagePath}/${formData[column]}`}
                                    type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                              {column.startsWith('pdf_') && formData[column] && (
                                <a
                                  href={`${baseImagePath}/${formData[column]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View PDF
                                </a>
                              )}
                              {column.startsWith('image_') ||
                                column.startsWith('video_') ||
                                column.startsWith('pdf_') ? (
                                <input
                                  type="file"
                                  name={column}
                                  onChange={handleInputChange}
                                />
                              ) : (
                                <TextField
                                  name={column}
                                  value={formData[column] || ''}
                                  onChange={handleInputChange}
                                  fullWidth
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return null;
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                {editMode ? 'Save Changes' : 'Add Record'}
              </Button>
            </form>
          </Box>
        </Modal>
      
    </Container>

  );
};

export default DynamicTablePageView;
