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
import { SaveAlt as DownloadIcon, Edit, Delete } from '@mui/icons-material';
import DynamicTablePage from './DynamicTablePage';

const DynamicTablePotrait = () => {
  const { tableName, pageTitle } = useParams();
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
  const baseImagePath = 'https://vadhuu.com/api/backend/uploads';

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
          Download PDF
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

  const fieldLabel = (column) => {
    if (column.startsWith('image_')) return `${formatLabel(column)} (Upload Image)`;
    if (column.startsWith('video_')) return `${formatLabel(column)} (Upload Video)`;
    if (column.startsWith('pdf_')) return `${formatLabel(column)} (Upload PDF)`;
    return formatLabel(column);
  };

  return (

    <Container maxWidth="xl" disableGutters>
      <Box sx={{ p: 2 }}>
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
          <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={() => handleOpenModal()}>
            Add Record
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{formatLabel(column)}</TableCell>
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

        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            count={Math.ceil(totalRecords / limit)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box
            sx={{
              maxWidth: 800,
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
              {columns.map((column) => {
                if (column !== 'id') {
                  return column.startsWith('image_') || column.startsWith('video_') || column.startsWith('pdf_') ? (
                    <div key={column}>
                      <label>{fieldLabel(column)}</label>
                      <input type="file" name={column} onChange={handleInputChange} />
                    </div>
                  ) : (
                    <TextField
                      key={column}
                      label={fieldLabel(column)}
                      name={column}
                      value={formData[column] || ''}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                  );
                }
                return null;
              })}
              <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                {editMode ? 'Save Changes' : 'Add Record'}
              </Button>
            </form>
          </Box>
        </Modal>
      </Box>
    </Container>

  );
};

export default DynamicTablePotrait;
