// ProductPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { CircularProgress, Snackbar, Alert, LinearProgress } from '@mui/material';

import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Modal,
  TextField,
  IconButton,
  Breadcrumbs,
  Switch,
  Container,
  Tabs,
  Tab,
  Chip,
  Stack,
  Divider,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Close, AddPhotoAlternate, DeleteForever } from '@mui/icons-material';
import axios from 'axios';

const baseImageUrl = 'https://vadhuu.com/api/cmsapi/uploads';

// ---------- helpers ----------
const parseJSONSafe = (v, fallback) => {
  if (v == null || v === '') return fallback;
  try {
    return typeof v === 'string' ? JSON.parse(v) : v;
  } catch {
    return fallback;
  }
};

const TabPanel = ({ value, index, children }) => {
  return (
    <div role="tabpanel" hidden={value !== index} style={{ height: '100%' }}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const ProductPage = () => {
  const { subCategoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  // modal + tabs
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [modalType, setModalType] = useState('add');
  const [currentProductId, setCurrentProductId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [snack, setSnack] = useState({ open: false, text: '', severity: 'info' });
  // general info
  const [productData, setProductData] = useState({
    product_name: '',
    product_description: '',
    image_alt: '',
    product_image: null, // File
    product_video: null, // File
  });
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [productVideoPreview, setProductVideoPreview] = useState(null);

  // multi images
  const [existingImages, setExistingImages] = useState([]); // string[]
  const [newImages, setNewImages] = useState([]); // File[]
  const [newImagePreviews, setNewImagePreviews] = useState([]); // blob urls

  // sizes
  const [selectedSizes, setSelectedSizes] = useState([]); // string[]

  // colors
  const [colors, setColors] = useState([]); // string[]
  const [colorInput, setColorInput] = useState('#000000'); // picker

  // fetch on load
  useEffect(() => {
    fetchSubCategory();
    fetchProducts();
  }, []);

  const fetchSubCategory = async () => {
    try {
      const { data } = await axios.get('https://vadhuu.com/backend/table-data/banka_sub_category');
      const filtered = (data?.data || []).filter((i) => String(i.id) === String(subCategoryId));
      setSubCategory(filtered);
    } catch (e) {
      console.error('Error fetching subcategory:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`https://vadhuu.com/cmsapi/products/${subCategoryId}`);
      setProducts(data || []);
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  };

  const handleOpenModal = (type = 'add', product = null) => {
    setModalType(type);
    setActiveTab(0);
    if (product) {
      setCurrentProductId(product.id);

      const parsedColors = parseJSONSafe(product.color, []);
      const parsedSizes = parseJSONSafe(product.size, []);
      const parsedMulti = parseJSONSafe(product.multiple_images, []);

      setProductData({
        product_name: product.product_name || '',
        product_description: product.product_description || '',
        image_alt: product.image_alt || '',
        product_image: null,
        product_video: null,
      });

      setProductImagePreview(product.product_image ? `${baseImageUrl}/${product.product_image}` : null);
      setProductVideoPreview(product.product_video ? `${baseImageUrl}/${product.product_video}` : null);

      setExistingImages(Array.isArray(parsedMulti) ? parsedMulti : []);
      setNewImages([]);
      setNewImagePreviews([]);

      setSelectedSizes(Array.isArray(parsedSizes) ? parsedSizes : []);
      setColors(Array.isArray(parsedColors) ? parsedColors : []);
      setColorInput('#000000');
    } else {
      setCurrentProductId(null);

      setProductData({
        product_name: '',
        product_description: '',
        image_alt: '',
        product_image: null,
        product_video: null,
      });
      setProductImagePreview(null);
      setProductVideoPreview(null);

      setExistingImages([]);
      setNewImages([]);
      setNewImagePreviews([]);

      setSelectedSizes([]);
      setColors([]);
      setColorInput('#000000');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    // cleanup blob urls
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    if (productImagePreview && productImagePreview.startsWith('blob:')) URL.revokeObjectURL(productImagePreview);
    if (productVideoPreview && productVideoPreview.startsWith('blob:')) URL.revokeObjectURL(productVideoPreview);

    setModalOpen(false);
  };

  // ---------- toggles on table ----------
  const handleAllToggleSwitch = (table, id, field, value) => {
    const apiUrl = `https://vadhuu.com/cmsapi/toggle/${id}`;
    const data = { table, field, value: value ? 1 : 0 };
    axios
      .put(apiUrl, data)
      .then(() => fetchProducts())
      .catch((err) => console.error(`Error updating ${field}:`, err));
  };

  const countActiveShowInCollection = (arr) => arr.filter((p) => p.show_in_collection === 1).length;
  const activeCount = useMemo(() => countActiveShowInCollection(products), [products]);

  // ---------- General Info handlers ----------
  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];
    setProductData((s) => ({ ...s, product_image: file || null }));
    if (file) setProductImagePreview(URL.createObjectURL(file));
  };

  const handleProductVideoChange = (e) => {
    const file = e.target.files?.[0];
    setProductData((s) => ({ ...s, product_video: file || null }));
    if (file) setProductVideoPreview(URL.createObjectURL(file));
  };

  // ---------- Multiple images handlers ----------
  const handleAddMultiImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const nextFiles = [...newImages, ...files];
    const nextPreviews = [...newImagePreviews, ...files.map((f) => URL.createObjectURL(f))];
    setNewImages(nextFiles);
    setNewImagePreviews(nextPreviews);
  };

  const removeExistingImage = (idx) => {
    setExistingImages((arr) => arr.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setNewImagePreviews((arr) => {
      const url = arr[idx];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      return arr.filter((_, i) => i !== idx);
    });
    setNewImages((arr) => arr.filter((_, i) => i !== idx));
  };

  // ---------- Size handlers ----------
  const toggleSize = (size) => {
    setSelectedSizes((arr) => (arr.includes(size) ? arr.filter((s) => s !== size) : [...arr, size]));
  };

  // ---------- Color handlers ----------
  const addColor = () => {
    const hex = (colorInput || '').toLowerCase();
    if (!hex) return;
    if (!colors.includes(hex)) setColors((arr) => [...arr, hex]);
  };

  const removeColor = (hex) => {
    setColors((arr) => arr.filter((c) => c !== hex));
  };

  // ---------- Submit ----------
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append('sub_category_id', subCategoryId);
    formDataObj.append('product_name', productData.product_name || '');
    formDataObj.append('product_description', productData.product_description || '');
    formDataObj.append('image_alt', productData.image_alt || '');
    formDataObj.append('color', JSON.stringify(colors || []));
    formDataObj.append('size', JSON.stringify(selectedSizes || []));
    formDataObj.append('multiple_images', JSON.stringify(existingImages || []));

    if (productData.product_image) formDataObj.append('product_image', productData.product_image);
    if (productData.product_video) formDataObj.append('product_video', productData.product_video);

    newImages.forEach((file) => formDataObj.append('multi_images[]', file));

    const apiUrl =
      modalType === 'add'
        ? 'https://vadhuu.com/cmsapi/products'
        : `https://vadhuu.com/cmsapi/products/${currentProductId}`;
    const method = modalType === 'add' ? 'post' : 'put';

    try {
      // Start upload
      setUploading(true);
      setUploadPercent(0);
      setSnack({ open: true, text: 'Uploading, please wait...', severity: 'info' });

      const response = await axios[method](apiUrl, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadPercent(percent);
          }
        },
      });

      // Success message from backend
      const msg =
        response?.data?.message ||
        (modalType === 'add' ? 'Product added successfully!' : 'Product updated successfully!');

      setSnack({ open: true, text: msg, severity: 'success' });

      await fetchProducts();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving product:', err);
      const errMsg = err.response?.data?.error || 'Upload failed. Please try again.';
      setSnack({ open: true, text: errMsg, severity: 'error' });
    } finally {
      setUploading(false);
      setUploadPercent(0);
    }
  };


  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`https://vadhuu.com/cmsapi/products/${productId}`);
      fetchProducts();
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };
  {
    uploading && (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <CircularProgress size={60} thickness={5} sx={{ mb: 2 }} />
        <Typography variant="h6">Uploading... {uploadPercent}%</Typography>
        <Box sx={{ width: '50%', mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={uploadPercent}
            sx={{
              height: 8,
              borderRadius: 5,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': { backgroundColor: '#00e676' },
            }}
          />
        </Box>
      </Box>
    )
  }

  return (

    <Container maxWidth="xl" disableGutters>
      <Box>
        {/* Breadcrumbs */}
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
        <Table sx={{ mt: 2 }}>
          <TableBody>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Image</strong></TableCell>
              <TableCell><strong>Video</strong></TableCell>
              <TableCell><strong>Alt Text</strong></TableCell>
              <TableCell><strong>Best Collection</strong></TableCell>
              <TableCell><strong>Show In Popular</strong></TableCell>
              <TableCell><strong>New Collection</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>

            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.product_name}</TableCell>
                <TableCell sx={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.product_description}
                </TableCell>
                <TableCell>
                  {product.product_image && (
                    <img
                      src={`${baseImageUrl}/${product.product_image}`}
                      alt={product.image_alt}
                      width="80"
                      style={{ borderRadius: 6 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {product.product_video && (
                    <video width="120" controls>
                      <source src={`${baseImageUrl}/${product.product_video}`} type="video/mp4" />
                    </video>
                  )}
                </TableCell>
                <TableCell>{product.image_alt}</TableCell>
                <TableCell>
                  <Switch
                    checked={Boolean(product.show_in_collection)}
                    onChange={(e) =>
                      handleAllToggleSwitch('banka_product', product.id, 'show_in_collection', e.target.checked)
                    }
                    color="primary"
                    disabled={!product.show_in_collection && activeCount >= 6}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={Boolean(product.show_in_popular)}
                    onChange={(e) =>
                      handleAllToggleSwitch('banka_product', product.id, 'show_in_popular', e.target.checked)
                    }
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={Boolean(product.show_in_spectrum)}
                    onChange={(e) =>
                      handleAllToggleSwitch('banka_product', product.id, 'show_in_spectrum', e.target.checked)
                    }
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal('edit', product)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteProduct(product.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Modal with Tabs */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '6%',
              transform: 'translateX(-50%)',
              width: 900,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              maxHeight: '88vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            component="form"
            onSubmit={handleFormSubmit}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                {modalType === 'add' ? 'Add Product' : `Edit Product #${currentProductId}`}
              </Typography>
              <IconButton onClick={handleCloseModal}>
                <Close />
              </IconButton>
            </Box>

            <Divider />

            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="General Info" />
              <Tab label="Multiple Images" />
              <Tab label="Sizes" />
              <Tab label="Colors" />
            </Tabs>

            <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
              {/* General Info */}
              <TabPanel value={activeTab} index={0}>
                <TextField
                  label="Product Name"
                  value={productData.product_name}
                  onChange={(e) => setProductData((s) => ({ ...s, product_name: e.target.value }))}
                  fullWidth
                  margin="normal"
                />

                <TextField
                  label="Product Description"
                  value={productData.product_description}
                  onChange={(e) => setProductData((s) => ({ ...s, product_description: e.target.value }))}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                />

                <TextField
                  label="Image Alt Text"
                  value={productData.image_alt}
                  onChange={(e) => setProductData((s) => ({ ...s, image_alt: e.target.value }))}
                  fullWidth
                  margin="normal"
                />

                <Stack direction="row" spacing={3} sx={{ mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="subtitle2">Main Image</Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      startIcon={<AddPhotoAlternate />}
                      sx={{ mt: 1 }}
                    >
                      Choose Image
                      <input hidden type="file" accept="image/*" onChange={handleProductImageChange} />
                    </Button>
                    {productImagePreview && (
                      <Box sx={{ mt: 1 }}>
                        <img
                          src={productImagePreview}
                          alt="Product"
                          width={140}
                          style={{ borderRadius: 8, display: 'block' }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle2">Product Video</Typography>
                    <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }}>
                      Choose Video
                      <input hidden type="file" accept="video/mp4,video/webm" onChange={handleProductVideoChange} />
                    </Button>
                    {productVideoPreview && (
                      <Box sx={{ mt: 1 }}>
                        <video width="220" controls>
                          <source src={productVideoPreview} />
                        </video>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </TabPanel>

              {/* Multiple Images */}
              <TabPanel value={activeTab} index={1}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Existing Images
                </Typography>
                {existingImages.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No extra images saved.
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  {existingImages.map((img, idx) => (
                    <Box
                      key={`${img}-${idx}`}
                      sx={{
                        position: 'relative',
                        width: 110,
                        height: 110,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <img
                        src={`${baseImageUrl}/${img}`}
                        alt={img}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Tooltip title="Remove from product">
                        <IconButton
                          size="small"
                          onClick={() => removeExistingImage(idx)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                          }}
                        >
                          <DeleteForever fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Add New Images
                </Typography>
                <Button component="label" variant="contained" size="small" startIcon={<AddPhotoAlternate />}>
                  Select Images
                  <input hidden multiple type="file" accept="image/*" onChange={handleAddMultiImages} />
                </Button>

                {newImagePreviews.length > 0 && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
                      {newImages.length} image(s) selected
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                      {newImagePreviews.map((url, idx) => (
                        <Box
                          key={url}
                          sx={{
                            position: 'relative',
                            width: 110,
                            height: 110,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <img src={url} alt={`new-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              onClick={() => removeNewImage(idx)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(0,0,0,0.5)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                              }}
                            >
                              <DeleteForever fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ))}
                    </Stack>
                  </>
                )}
              </TabPanel>

              {/* Sizes */}
              <TabPanel value={activeTab} index={2}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Select Available Sizes
                </Typography>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                  {AVAILABLE_SIZES.map((sz) => (
                    <FormControlLabel
                      key={sz}
                      control={<Checkbox checked={selectedSizes.includes(sz)} onChange={() => toggleSize(sz)} />}
                      label={sz}
                    />
                  ))}
                </Stack>
              </TabPanel>

              {/* Colors */}
              <TabPanel value={activeTab} index={3}>
                <Typography variant="subtitle2">Pick Colors</Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    style={{ width: 48, height: 40, border: 'none', background: 'transparent', padding: 0 }}
                  />
                  <Button variant="outlined" onClick={addColor}>
                    Add Color
                  </Button>
                </Stack>

                {colors.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Selected Colors
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {colors.map((hex) => (
                        <Chip
                          key={hex}
                          label={hex.toUpperCase()}
                          onDelete={() => removeColor(hex)}
                          sx={{
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: 'divider',
                            background: hex,
                            color: '#fff',
                            textShadow: '0 0 2px rgba(0,0,0,0.6)',
                          }}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </TabPanel>
            </Box>

            <Divider sx={{ mt: 2, mb: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {modalType === 'add' ? 'Add Product' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: '100%' }}
        >
          {snack.text}
        </Alert>
      </Snackbar>

    </Container>
  );
};

export default ProductPage;
