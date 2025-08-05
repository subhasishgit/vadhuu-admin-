import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Table, TableBody, TableCell, TableRow, Modal, TextField, IconButton, Breadcrumbs, Switch, Container, } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const ProductPage = () => {
  const { subCategoryId } = useParams(); // Get the subcategory ID from URL params
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [subCategory, setSubCategory] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // Modal type: 'add' or 'edit'
  const [productData, setProductData] = useState({
    product_name: '',
    product_description: '',
    image_alt: '',
    product_image: null,
    product_video: null,
  });
  const [productImagePreview, setProductImagePreview] = useState(null); // For image preview
  const [productVideoPreview, setProductVideoPreview] = useState(null); // For video preview
  const [currentProductId, setCurrentProductId] = useState(null);

  // Base URL for images and videos
  const baseImageUrl = 'https://vadhuu.com/api/cmsapi/uploads';

  useEffect(() => {
    fetchSubCategory();
    fetchProducts();
  }, []);

  const fetchSubCategory = () => {


    // Filter the data where id == subcategory_id

    axios.get(`https://vadhuu.com/backend/table-data/banka_sub_category`)
      .then((response) => {
        const filteredData = response.data.data.filter(item => item.id == subCategoryId);
        setSubCategory(filteredData); // Assuming API returns an array
      })
      .catch((error) => console.error('Error fetching subcategory:', error));
  };

  const fetchProducts = () => {
    axios.get(`https://vadhuu.com/cmsapi/products/${subCategoryId}`)
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  };

  const handleOpenModal = (type = 'add', product = null) => {
    setModalType(type);
    if (product) {
      setCurrentProductId(product.id);
      setProductData({
        product_name: product.product_name,
        product_description: product.product_description,
        image_alt: product.image_alt,
        product_image: null,
        product_video: null,
      });
      setProductImagePreview(product.product_image ? `${baseImageUrl}/${product.product_image}` : null);
      setProductVideoPreview(product.product_video ? `${baseImageUrl}/${product.product_video}` : null);
    } else {
      setProductData({
        product_name: '',
        product_description: '',
        image_alt: '',
        product_image: null,
        product_video: null,
      });
      setProductImagePreview(null);
      setProductVideoPreview(null);
      setCurrentProductId(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append('sub_category_id', subCategoryId);
    formDataObj.append('product_name', productData.product_name);
    formDataObj.append('product_description', productData.product_description);
    formDataObj.append('image_alt', productData.image_alt);

    if (productData.product_image) {
      formDataObj.append('product_image', productData.product_image);
    }
    if (productData.product_video) {
      formDataObj.append('product_video', productData.product_video);
    }

    const apiUrl = modalType === 'add'
      ? 'https://vadhuu.com/cmsapi/products'
      : `https://vadhuu.com/cmsapi/products/${currentProductId}`;

    const method = modalType === 'add' ? 'post' : 'put';

    axios[method](apiUrl, formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
      .then(() => {
        fetchProducts();
        handleCloseModal();
      })
      .catch((error) => console.error('Error saving product:', error));
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios.delete(`https://vadhuu.com/cmsapi/products/${productId}`)
        .then(() => fetchProducts())
        .catch((error) => console.error('Error deleting product:', error));
    }
  };

  // Handle image preview for product image
  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    setProductData({ ...productData, product_image: file });
    setProductImagePreview(URL.createObjectURL(file)); // Set image preview
  };

  // Handle video preview for product video
  const handleProductVideoChange = (e) => {
    const file = e.target.files[0];
    setProductData({ ...productData, product_video: file });
    setProductVideoPreview(URL.createObjectURL(file)); // Set video preview
  };
  const handleAllToggleSwitch = (table, id, field, value) => {
    const apiUrl = `https://vadhuu.com/cmsapi/toggle/${id}`;

    // Sending both field name and value in the body
    const data = {
      table,
      field,
      value: value ? 1 : 0, // Convert boolean to 1 or 0 bool
    };

    axios.put(apiUrl, data)
      .then((response) => {
        // console.log('API Response:', response); // Print the entire axios response object
        fetchProducts(); // Refresh categories after toggle
      })
      .catch(error => console.error(`Error updating ${field}:`, error));
  };
  const countActiveShowInCollection = (products) => {
    return products.filter(products => products.show_in_collection === 1).length;
  };
  const activeCount = countActiveShowInCollection(products);
  return (
    
      <Container maxWidth="xl" disableGutters>
        <Box>
          {/* Breadcrumbs for navigation */}
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link to="/">Categories</Link>
            <Typography color="textPrimary">{subCategory[0]?.sub_category}</Typography>
          </Breadcrumbs>

          <Typography variant="h5" gutterBottom>
            Manage Products for {subCategory[0]?.sub_category}
          </Typography>

          <Button variant="contained" color="primary" onClick={() => handleOpenModal('add')}>
            Add Product
          </Button>

          {/* Product Table */}
          <Table>
            <TableBody>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Video</strong></TableCell>
                <TableCell><strong>Alt Text</strong></TableCell>
                <TableCell><strong>Show In Collection</strong></TableCell>
                <TableCell><strong>Show In Popular</strong></TableCell>
                <TableCell><strong>Show In Spectrum</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>

              {products.map((product) => {
                // Count active switches
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.product_description}</TableCell>
                    <TableCell>
                      {product.product_image && (
                        <img
                          src={`${baseImageUrl}/${product.product_image}`}
                          alt={product.image_alt}
                          width="100"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {product.product_video && (
                        <video width="100" controls>
                          <source
                            src={`${baseImageUrl}/${product.product_video}`}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </TableCell>
                    <TableCell>{product.image_alt}</TableCell>
                    <TableCell>
                      <Switch
                        checked={Boolean(product.show_in_collection)}
                        onChange={(e) => handleAllToggleSwitch('banka_product', product.id, 'show_in_collection', e.target.checked)}
                        color="primary"
                        disabled={!product.show_in_collection && activeCount >= 6} // Disable if two switches are on
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={Boolean(product.show_in_popular)}
                        onChange={(e) => handleAllToggleSwitch('banka_product', product.id, 'show_in_popular', e.target.checked)}
                        color="primary"
                      // disabled={!product.show_in_popular && activeCount >= 10000} // Disable if two switches are on
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={Boolean(product.show_in_spectrum)}
                        onChange={(e) => handleAllToggleSwitch('banka_product', product.id, 'show_in_spectrum', e.target.checked)}
                        color="primary"
                      // disabled={!product.show_in_popular && activeCount >= 10000} // Disable if two switches are on
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleOpenModal('edit', product)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteProduct(product.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Modal for Adding/Editing Products */}
          <Modal open={modalOpen} onClose={handleCloseModal}>
            <Box sx={{ width: 500, p: 4, bgcolor: 'background.paper', margin: 'auto', top: '20%', position: 'relative' }}>
              <Typography variant="h6">{modalType === 'add' ? 'Add Product' : 'Edit Product'}</Typography>
              <form onSubmit={handleFormSubmit}>
                <TextField
                  label="Product Name"
                  name="product_name"
                  value={productData.product_name}
                  onChange={(e) => setProductData({ ...productData, product_name: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Product Description"
                  name="product_description"
                  value={productData.product_description}
                  onChange={(e) => setProductData({ ...productData, product_description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
                <TextField
                  label="Image Alt Text"
                  name="image_alt"
                  value={productData.image_alt}
                  onChange={(e) => setProductData({ ...productData, image_alt: e.target.value })}
                  fullWidth
                  margin="normal"
                />

                {/* File Inputs */}
                <input type="file" name="product_image" onChange={handleProductImageChange} />
                {productImagePreview && <img src={productImagePreview} alt="Product Preview" width="100" />}

                <input type="file" name="product_video" onChange={handleProductVideoChange} />
                {productVideoPreview && (
                  <video width="100" controls>
                    <source src={productVideoPreview} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
                  {modalType === 'add' ? 'Add Product' : 'Save Changes'}
                </Button>
              </form>
            </Box>
          </Modal>
        </Box>
      </Container>

  );
};

export default ProductPage;
