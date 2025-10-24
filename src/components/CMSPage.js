import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Tooltip, Table, TableBody, InputLabel, TableCell, Stack, CircularProgress, Container, TableRow, Modal, TextField, TableHead, Switch } from '@mui/material';
import { Edit, Delete, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { GlobalTheme } from './../theme.js';

const CMSPage = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null); // To track expanded categories
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add-category' or 'edit-category'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    category: '', category_heading: '', category_description: '', category_seo_keywords: '', category_seo_description: '', category_banner: null, category_mobile_banner: null, category_thumbnail: null, category_mobile_thumbnail: null, category_popular_pick_banner: null, category_mobile_popular_pick_banner: null,
    is_popular: false,
    show_hide: false,
  });
  const [categoryBannerPreview, setCategoryBannerPreview] = useState(null);
  const [categoryMobileBannerPreview, setCategoryMobileBannerPreview] = useState(null);
  const [categoryThumbnailPreview, setCategoryThumbnailPreview] = useState(null);
  const [categoryMobileThumbnailPreview, setCategoryMobileThumbnailPreview] = useState(null);
  const [categoryPopularPickBannerPreview, setCategoryPopularPickBannerPreview] = useState(null);
  const [categoryMobilePopularPickBannerPreview, setCategoryMobilePopularPickBannerPreview] = useState(null);

  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [subcategoryEditMode, setSubcategoryEditMode] = useState(false);
  const [subcategoryData, setSubcategoryData] = useState({
    sub_category: '',
    sub_category_heading: '',
    sub_category_description: '',
    sub_category_seo_keywords: '', // New field
    sub_category_seo_description: '', // New field
    sub_category_banner: null,
    sub_category_thumbnail: null,
    plp_banner_mobile: null, // New field for mobile banner
    collection_banner_mobile: null // New field for mobile collection banner
  });
  const [subcategoryBannerPreview, setSubcategoryBannerPreview] = useState(null);
  const [subcategoryThumbnailPreview, setSubcategoryThumbnailPreview] = useState(null);
  const [plpBannerMobilePreview, setPlpBannerMobilePreview] = useState(null);
  const [collectionBannerMobilePreview, setCollectionBannerMobilePreview] = useState(null);
  const [currentCategoryForSub, setCurrentCategoryForSub] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [activeSwitchCount, setActiveSwitchCount] = useState(0); // Track number of active switches
  const maxActiveSwitches = 2; // Set the maximum number of switches that can be on
  const [loading, setLoading] = useState(false); // New state for loading
  const baseImageUrl = 'https://vadhuu.com/api/cmsapi/uploads';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios.get('https://vadhuu.com/cmsapi/categories')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId);
  };

  // Handle toggle switches for is_popular and show_hide
  const handleToggleSwitch = (categoryId, field, value) => {
    const apiUrl = `https://vadhuu.com/cmsapi/categories/toggle/${categoryId}`; // Corrected API path

    // Sending both field name and value in the body
    const data = {
      field, // field name like 'is_popular' or 'show_hide'
      value: value ? 1 : 0 // Convert boolean to 1 or 0
    };

    axios.put(apiUrl, data)
      .then(() => fetchCategories()) // Refresh categories after toggle
      .catch(error => console.error(`Error updating ${field}:`, error));
  };
  const handleAllToggleSwitch = (table, id, field, value) => {
    const apiUrl = `https://vadhuu.com/cmsapi/toggle/${id}`; // Corrected API path

    // Sending both field name and value in the body
    const data = {
      table,
      field, // field name like 'is_popular' or 'show_hide'
      value: value ? 1 : 0 // Convert boolean to 1 or 0
    };
    // console.log(data);
    axios.put(apiUrl, data)
      .then(() => fetchCategories()) // Refresh categories after toggle
      .catch(error => console.error(`Error updating ${field}:`, error));
  };
  const handleSubCatActiveToggleSwitch = (subcategory_id, table, id, field, value) => {
    const apiUrl = `https://vadhuu.com/cmsapi/activetoggle/${id}`; // Corrected API path

    // Sending both field name and value in the body
    const data = {
      subcategory_id,
      table,
      field, // field name like 'is_popular' or 'show_hide'
      value: value ? 1 : 0 // Convert boolean to 1 or 0
    };
    // console.log(data);
    axios.put(apiUrl, data)
      .then(() => fetchCategories()) // Refresh categories after toggle
      .catch(error => console.error(`Error updating ${field}:`, error));
  };
  // Open the modal for category add/edit
  const handleOpenCategoryModal = (type, category = null) => {
    setModalType(type);
    if (category) {
      setCurrentCategory(category);
      setFormData({
        category: category.category,
        category_heading: category.category_heading,
        category_description: category.category_description,
        category_seo_keywords: category.category_seo_keywords,
        category_seo_description: category.category_seo_description,
        category_banner: null,
        category_mobile_banner: null,
        category_thumbnail: null,
        category_mobile_thumbnail: null,
        category_popular_pick_banner: null,
        category_mobile_popular_pick_banner: null,
        is_popular: Boolean(category.is_popular),
        show_hide: Boolean(category.show_hide),
      });
      setCategoryBannerPreview(`${baseImageUrl}/${category.category_banner}`);
      setCategoryMobileBannerPreview(`${baseImageUrl}/${category.category_mobile_banner}`);
      setCategoryThumbnailPreview(`${baseImageUrl}/${category.category_thumbnail}`);
      setCategoryMobileThumbnailPreview(`${baseImageUrl}/${category.category_mobile_thumbnail}`);
      setCategoryPopularPickBannerPreview(`${baseImageUrl}/${category.category_popular_pick_banner}`);
      setCategoryMobilePopularPickBannerPreview(`${baseImageUrl}/${category.category_mobile_popular_pick_banner}`);
    } else {
      setFormData({
        category: '',
        category_heading: '',
        category_description: '',
        category_seo_keywords: '',
        category_seo_description: '',
        category_banner: null,
        category_thumbnail: null,
        category_popular_pick_banner: null,
        is_popular: false,
        show_hide: false,
      });
      setCategoryBannerPreview(null);
      setCategoryMobileBannerPreview(null);
      setCategoryThumbnailPreview(null);
      setCategoryMobileThumbnailPreview(null);
      setCategoryPopularPickBannerPreview(null);
      setCategoryMobilePopularPickBannerPreview(null);
    }
    setModalOpen(true);
  };

  // Handle category add/edit form submit
  const handleCategorySubmit = (e) => {
    setLoading(true); // Start loading
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append('category', formData.category);
    formDataObj.append('category_heading', formData.category_heading);
    formDataObj.append('category_description', formData.category_description);
    formDataObj.append('category_seo_keywords', formData.category_seo_keywords);
    formDataObj.append('category_seo_description', formData.category_seo_description);
    // formDataObj.append('is_popular', formData.is_popular);
    // formDataObj.append('show_hide', formData.show_hide);

    if (formData.category_banner) formDataObj.append('category_banner', formData.category_banner);

    if (formData.category_mobile_banner) formDataObj.append('category_mobile_banner', formData.category_mobile_banner);
    if (formData.category_thumbnail) formDataObj.append('category_thumbnail', formData.category_thumbnail);
    if (formData.category_mobile_thumbnail) formDataObj.append('category_mobile_thumbnail', formData.category_mobile_thumbnail);
    if (formData.category_popular_pick_banner) formDataObj.append('category_popular_pick_banner', formData.category_popular_pick_banner);
    if (formData.category_mobile_popular_pick_banner) formDataObj.append('category_mobile_popular_pick_banner', formData.category_mobile_popular_pick_banner);

    const apiUrl = modalType === 'add-category'
      ? 'https://vadhuu.com/cmsapi/categories'
      : `https://vadhuu.com/cmsapi/categories/${currentCategory.id}`;

    const method = modalType === 'add-category' ? 'post' : 'put';

    axios[method](apiUrl, formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        // alert("12");
        fetchCategories();
        setModalOpen(false);
      })
      .catch(error => console.error('Error saving category:', error))
      .finally(() => setLoading(false)); // Stop loading after request completes
  };

  // Close the modal
  const handleCloseCategoryModal = () => {
    setModalOpen(false);
    setCurrentCategory(null);
  };

  // Handle category banner and thumbnail preview
  const handleCategoryBannerChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, category_banner: file });
    setCategoryBannerPreview(URL.createObjectURL(file));
  };
  const handleCategoryMobileBannerChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, category_mobile_banner: file });
    setCategoryMobileBannerPreview(URL.createObjectURL(file));
  };
  const handleCategoryThumbnailChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, category_thumbnail: file });
    setCategoryThumbnailPreview(URL.createObjectURL(file));
  };
  const handleMobileCategoryThumbnailChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, category_mobile_thumbnail: file });
    setCategoryMobileThumbnailPreview(URL.createObjectURL(file));
  };
  const handleCategoryPopularPickBannerChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, category_popular_pick_banner: file });
    setCategoryPopularPickBannerPreview(URL.createObjectURL(file));
  };
  const handleCategoryMobilePopularPickBannerChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, category_mobile_popular_pick_banner: file });
    setCategoryMobilePopularPickBannerPreview(URL.createObjectURL(file));
  };
  // Open the modal for subcategory add/edit
  const handleOpenSubcategoryModal = (category, subCategory = null) => {
    setCurrentCategoryForSub(category);
    if (subCategory) {
      setSubcategoryEditMode(true);
      setCurrentSubcategory(subCategory);
      setSubcategoryData({
        sub_category: subCategory.sub_category,
        sub_category_heading: subCategory.sub_category_heading,
        sub_category_description: subCategory.sub_category_description,
        sub_category_seo_keywords: subCategory.sub_category_seo_keywords || '', // Added field
        sub_category_seo_description: subCategory.sub_category_seo_description || '', // Added field
        sub_category_banner: null,
        sub_category_thumbnail: null,
        plp_banner_mobile: null, // Added field
        collection_banner_mobile: null // Added field
      });
      setSubcategoryBannerPreview(`${baseImageUrl}/${subCategory.sub_category_banner}`);
      setSubcategoryThumbnailPreview(`${baseImageUrl}/${subCategory.sub_category_thumbnail}`);
      setPlpBannerMobilePreview(`${baseImageUrl}/${subCategory.plp_banner_mobile}`); // Added preview
      setCollectionBannerMobilePreview(`${baseImageUrl}/${subCategory.collection_banner_mobile}`); // Added preview
    } else {
      setSubcategoryEditMode(false);
      setSubcategoryData({
        sub_category: '',
        sub_category_heading: '',
        sub_category_description: '',
        sub_category_seo_keywords: '', // Added field
        sub_category_seo_description: '', // Added field
        sub_category_banner: null,
        sub_category_thumbnail: null,
        plp_banner_mobile: null, // Added field
        collection_banner_mobile: null // Added field
      });
      setSubcategoryBannerPreview(null);
      setSubcategoryThumbnailPreview(null);
      setPlpBannerMobilePreview(null); // Added preview reset
      setCollectionBannerMobilePreview(null); // Added preview reset
    }
    setSubcategoryModalOpen(true);
  };


  // Handle subcategory add/edit form submit
  const handleSubcategorySubmit = (e) => {
    setLoading(true); // Start loading
    e.preventDefault();
    const formDataObj = new FormData();
    formDataObj.append('category_id', currentCategoryForSub.id);
    formDataObj.append('sub_category', subcategoryData.sub_category);
    formDataObj.append('sub_category_heading', subcategoryData.sub_category_heading);
    formDataObj.append('sub_category_description', subcategoryData.sub_category_description);
    formDataObj.append('sub_category_seo_keywords', subcategoryData.sub_category_seo_keywords);
    formDataObj.append('sub_category_seo_description', subcategoryData.sub_category_seo_description);

    if (subcategoryData.sub_category_banner) formDataObj.append('sub_category_banner', subcategoryData.sub_category_banner);
    if (subcategoryData.sub_category_thumbnail) formDataObj.append('sub_category_thumbnail', subcategoryData.sub_category_thumbnail);
    if (subcategoryData.plp_banner_mobile) formDataObj.append('plp_banner_mobile', subcategoryData.plp_banner_mobile);
    if (subcategoryData.collection_banner_mobile) formDataObj.append('collection_banner_mobile', subcategoryData.collection_banner_mobile);

    const apiUrl = subcategoryEditMode
      ? `https://vadhuu.com/cmsapi/subcategories/${currentSubcategory.id}`
      : 'https://vadhuu.com/cmsapi/subcategories';

    const method = subcategoryEditMode ? 'put' : 'post';

    axios[method](apiUrl, formDataObj, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        fetchCategories();
        setSubcategoryModalOpen(false);
      })
      .catch(error => console.error('Error saving Sub category:', error))
      .finally(() => setLoading(false)); // Stop loading after request completes
  };


  // Close the subcategory modal
  const handleCloseSubcategoryModal = () => {
    setSubcategoryModalOpen(false);
    setCurrentCategoryForSub(null);
  };

  // Handle subcategory banner and thumbnail preview
  const handleSubcategoryBannerChange = (e) => {
    const file = e.target.files[0];
    setSubcategoryData({ ...subcategoryData, sub_category_banner: file });
    setSubcategoryBannerPreview(URL.createObjectURL(file));
  };

  const handleSubcategoryThumbnailChange = (e) => {
    const file = e.target.files[0];
    setSubcategoryData({ ...subcategoryData, sub_category_thumbnail: file });
    setSubcategoryThumbnailPreview(URL.createObjectURL(file));
  };
  // Logic to disable the show_in_collection switch if two are already active
  const countActiveShowInCollection = (subcategories) => {
    return subcategories.filter(subCategory => subCategory.show_in_collection === 1).length;
  };
  return (

    <Container maxWidth="xl" disableGutters>
      <Stack direction='row' alignItems='center' justifyContent='space-between' marginBottom={2}>
        <Typography variant="h4" component='h1'>Manage Categories & Sub-categories</Typography>

        <Button variant="contained" color="primary" sx={{ borderRadius: 8 }} onClick={() => handleOpenCategoryModal('add-category')}>
          Add Category
        </Button>
      </Stack>


      <Table sx={{ borderRadius: 1, backgroundColor: GlobalTheme.palette.general.grayLight }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Heading</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Banner</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Thumbnail</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Popular Pick Banner</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Is Popular</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Show/Hide</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map(category => {
            const activeCount = countActiveShowInCollection(category.subcategories); // Count active switches
            return (

              <React.Fragment key={category.id}>
                <TableRow>
                  <TableCell sx={{ verticalAlign: 'top' }}>{category.category}</TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>{category.category_heading}</TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>{category.category_description}</TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <Typography variant="caption">Desktop</Typography>
                      <img src={`${baseImageUrl}/${category.category_banner}`} alt="Desktop Category Banner" width="100" />
                      <Typography variant="caption">Mobile</Typography>
                      <img src={`${baseImageUrl}/${category.category_mobile_banner}`} alt="Mobile Category Banner" width="100" />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <Typography variant="caption">Desktop</Typography>
                      <img src={`${baseImageUrl}/${category.category_thumbnail}`} alt="Desktop Category Thumbnail" width="100" />
                      <Typography variant="caption">Mobile</Typography>
                      <img src={`${baseImageUrl}/${category.category_mobile_thumbnail}`} alt="Mobile Category Thumbnail" width="100" />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                      <Typography variant="caption">Desktop</Typography>
                      <img src={`${baseImageUrl}/${category.category_popular_pick_banner}`} alt="Desktop Popular Pick Banner" width="100" />
                      <Typography variant="caption">Mobile</Typography>
                      <img src={`${baseImageUrl}/${category.category_mobile_popular_pick_banner}`} alt="Mobile Popular Pick Banner" width="100" />
                    </Box>
                  </TableCell>

                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Switch
                      checked={Boolean(category.is_popular)}
                      onChange={(e) => handleToggleSwitch(category.id, 'is_popular', e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Switch
                      checked={Boolean(category.show_hide)}
                      onChange={(e) => handleToggleSwitch(category.id, 'show_hide', e.target.checked)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Tooltip title="Edit Category">
                      <IconButton onClick={() => handleOpenCategoryModal('edit-category', category)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Category">
                      <IconButton
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this?')) {
                            axios.delete(`https://vadhuu.com/cmsapi/categories/${category.id}`)
                              .then(fetchCategories)
                              .catch(error => console.error('Error deleting category:', error));
                          }
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                    <IconButton onClick={() => toggleCategory(category.id)}>
                      {expandedCategoryId === category.id ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </TableCell>
                </TableRow>

                {expandedCategoryId === category.id && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Box sx={{
                        width: '100%',
                        backgroundColor: GlobalTheme.palette.general.grayLight,
                        padding: 2,
                        borderRadius: 2,
                      }}>
                        <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                          <TableCell colSpan={6}>
                            <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
                              {/* <Typography component='p' variant="h6" sx={{ mb: 2 }}>Subcategories</Typography> */}
                              <Button variant="outlined" color="secondary" onClick={() => handleOpenSubcategoryModal(category)}>
                                Add Subcategory
                              </Button>
                            </Stack>


                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600 }}>Subcategory</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Heading</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>PLP Banner</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Collection Banner</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Show In Collection</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {category.subcategories && category.subcategories.map(subCategory => (
                                  <TableRow key={subCategory.id}>
                                    <TableCell>{subCategory.sub_category}</TableCell>
                                    <TableCell>{subCategory.sub_category_heading}</TableCell>
                                    <TableCell>{subCategory.sub_category_description}</TableCell>
                                    <TableCell>
                                      <img src={`${baseImageUrl}/${subCategory.sub_category_banner}`} alt="Subcategory Banner" width="100" />
                                    </TableCell>
                                    <TableCell>
                                      <img src={`${baseImageUrl}/${subCategory.sub_category_thumbnail}`} alt="Subcategory Thumbnail" width="100" />
                                    </TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={Boolean(subCategory.show_in_collection)}
                                        onChange={(e) => handleAllToggleSwitch('banka_sub_category', subCategory.id, 'show_in_collection', e.target.checked)}
                                        color="primary"
                                        disabled={!subCategory.show_in_collection && activeCount >= 2} // Disable if two switches are on
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Switch
                                        checked={Boolean(subCategory.is_active)}
                                        onChange={(e) => handleSubCatActiveToggleSwitch(subCategory.id, 'banka_sub_category', subCategory.id, 'is_active', e.target.checked)}
                                        color="primary"

                                      />
                                    </TableCell>
                                    <TableCell>

                                      <Tooltip title="Manage Products">
                                        <Button variant="outlined" color="primary" component={Link} to={`/manage-products/${subCategory.id}`}>
                                          Manage Products
                                        </Button>
                                      </Tooltip>
                                      <Tooltip title="Edit Subcategory">
                                        <IconButton onClick={() => handleOpenSubcategoryModal(category, subCategory)}>
                                          <Edit />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Subcategory">
                                        <IconButton
                                          onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this subcategory?')) {
                                              axios.delete(`https://vadhuu.com/cmsapi/subcategories/${subCategory.id}`)
                                                .then(fetchCategories)
                                                .catch(error => console.error('Error deleting subcategory:', error));
                                            }
                                          }}
                                        >
                                          <Delete />
                                        </IconButton>
                                      </Tooltip>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>

            );

          })}
        </TableBody>
      </Table>

      {/* Modal for Add/Edit Category */}
      <Modal open={modalOpen} onClose={handleCloseCategoryModal}>
        <Box
          sx={{
            maxWidth: '90%',
            maxHeight: '800px', // Set a max height
            p: 4,
            bgcolor: 'background.paper',
            margin: 'auto',
            top: '80px',
            position: 'relative',
            borderRadius: 2,
            overflowY: 'auto', // Enable vertical scroll
          }}
        >

          <Typography variant="h6">{modalType === 'add-category' ? 'Add Category' : 'Edit Category'}</Typography>
          <form onSubmit={handleCategorySubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Category (Saree, Kurti etc)"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Category Heading (This will be shown on category page)"
                  name="category_heading"
                  value={formData.category_heading}
                  onChange={(e) => setFormData({ ...formData, category_heading: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Category Description (This will be shown on category page)"
                  name="category_description"
                  value={formData.category_description}
                  onChange={(e) => setFormData({ ...formData, category_description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>SEO Details</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Category Seo Keywords"
                  name="category_seo_keywords"
                  value={formData.category_seo_keywords}
                  onChange={(e) => setFormData({ ...formData, category_seo_keywords: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Category Seo Description"
                  name="category_seo_description"
                  value={formData.category_seo_description}
                  onChange={(e) => setFormData({ ...formData, category_seo_description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}

                />
              </Grid>
            </Grid>

            <Grid container spacing={2} mt={2} >
              <Grid size={{ xs: 12, sm: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 300px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <InputLabel shrink>Category Banner:</InputLabel>
                  <input type="file" name="category_banner" onChange={handleCategoryBannerChange} />
                  {categoryBannerPreview && <img src={categoryBannerPreview} alt="Category Banner Preview" width="100" />}
                </div>
              </Grid>

              
            </Grid>


            <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 300px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <InputLabel shrink>Category Mobile Banner:</InputLabel>
              <input type="file" name="category_mobile_banner" onChange={handleCategoryMobileBannerChange} />
              {categoryMobileBannerPreview && <img src={categoryMobileBannerPreview} alt="Category Mobile Banner Preview" width="100" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 300px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <InputLabel shrink>Category Thumbnail:</InputLabel>
              <input type="file" name="category_thumbnail" onChange={handleCategoryThumbnailChange} />
              {categoryThumbnailPreview && <img src={categoryThumbnailPreview} alt="Category Thumbnail Preview" width="100" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 300px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <InputLabel shrink>Category Thumbnail Mobile:</InputLabel>
              <input type="file" name="category_thumbnail_mobile" onChange={handleMobileCategoryThumbnailChange} />
              {categoryMobileThumbnailPreview && <img src={categoryMobileThumbnailPreview} alt="Category Mobile Thumbnail Preview" width="100" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 300px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <InputLabel shrink>Category Popular Pick Banner:</InputLabel>
              <input type="file" name="category_popular_pick_banner" onChange={handleCategoryPopularPickBannerChange} />
              {categoryPopularPickBannerPreview && <img src={categoryPopularPickBannerPreview} alt="Popular Pick Banner Preview" width="100" />}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 200px 300px', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <InputLabel shrink>Category Mobile Popular Pick Banner:</InputLabel>
              <input type="file" name="category_mobile_popular_pick_banner" onChange={handleCategoryMobilePopularPickBannerChange} />
              {categoryMobilePopularPickBannerPreview && <img src={categoryMobilePopularPickBannerPreview} alt="Popular Pick Banner Preview" width="100" />}
            </div>


            {/* <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography>Is Popular</Typography>
              <Switch
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                color="primary"
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography>Show/Hide</Typography>
              <Switch
                checked={formData.show_hide}
                onChange={(e) => setFormData({ ...formData, show_hide: e.target.checked })}
                color="primary"
              />
            </Box> */}

            {/* Loading Spinner */}
            {loading ? (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            ) : (
              <Button variant="outline" color="primary" type="submit" sx={{ mt: 2 }}>
                {modalType === 'add-category' ? 'Add Category' : 'Save Changes'}
              </Button>
            )}
          </form>
        </Box>
      </Modal>

      {/* Modal for Add/Edit Subcategory */}
      <Modal open={subcategoryModalOpen} onClose={handleCloseSubcategoryModal}>
        <Box
          sx={{
            width: '90%',
            maxHeight: '800px',
            p: 4,
            bgcolor: 'background.paper',
            margin: 'auto',
            top: '80px',
            position: 'relative',
            overflowY: 'auto',
          }}
        >
          <Typography component='h2' variant="h3">
            {subcategoryEditMode ? 'Edit Subcategory' : 'Add Sub Category'}
          </Typography>
          <form onSubmit={handleSubcategorySubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Sub Category"
                  name="sub_category"
                  value={subcategoryData.sub_category}
                  onChange={(e) => setSubcategoryData({ ...subcategoryData, sub_category: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Subcategory Heading"
                  name="sub_category_heading"
                  value={subcategoryData.sub_category_heading}
                  onChange={(e) => setSubcategoryData({ ...subcategoryData, sub_category_heading: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="SEO Keywords"
                  name="sub_category_seo_keywords"
                  value={subcategoryData.sub_category_seo_keywords}
                  onChange={(e) => setSubcategoryData({ ...subcategoryData, sub_category_seo_keywords: e.target.value })}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="SEO Description"
                  name="sub_category_seo_description"
                  value={subcategoryData.sub_category_seo_description}
                  onChange={(e) => setSubcategoryData({ ...subcategoryData, sub_category_seo_description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Subcategory Description"
                  name="sub_category_description"
                  value={subcategoryData.sub_category_description}
                  onChange={(e) => setSubcategoryData({ ...subcategoryData, sub_category_description: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                />
              </Grid>
            </Grid>

            <Box display="grid" gridTemplateColumns="200px 200px 300px" gap={2} alignItems="center" mb={2}>
              <InputLabel shrink>PLP Banner:</InputLabel>
              <input type="file" name="sub_category_banner" onChange={handleSubcategoryBannerChange} />
              {subcategoryBannerPreview && <img src={subcategoryBannerPreview} alt="Subcategory Banner Preview" width="100" />}
            </Box>

            <Box display="grid" gridTemplateColumns="200px 200px 300px" gap={2} alignItems="center" mb={2}>
              <InputLabel shrink>Collection Banner:</InputLabel>
              <input type="file" name="sub_category_thumbnail" onChange={handleSubcategoryThumbnailChange} />
              {subcategoryThumbnailPreview && <img src={subcategoryThumbnailPreview} alt="Subcategory Thumbnail Preview" width="100" />}
            </Box>

            <Box display="grid" gridTemplateColumns="200px 200px 300px" gap={2} alignItems="center" mb={2}>
              <InputLabel shrink>PLP Banner Mobile:</InputLabel>
              <input
                type="file"
                name="plp_banner_mobile"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSubcategoryData({ ...subcategoryData, plp_banner_mobile: file });
                  setPlpBannerMobilePreview(URL.createObjectURL(file));
                }}
              />
              {plpBannerMobilePreview && <img src={plpBannerMobilePreview} alt="PLP Banner Mobile Preview" width="100" />}
            </Box>

            <Box display="grid" gridTemplateColumns="200px 200px 300px" gap={2} alignItems="center" mb={2}>
              <InputLabel shrink>Collection Banner Mobile:</InputLabel>
              <input
                type="file"
                name="collection_banner_mobile"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSubcategoryData({ ...subcategoryData, collection_banner_mobile: file });
                  setCollectionBannerMobilePreview(URL.createObjectURL(file));
                }}
              />
              {collectionBannerMobilePreview && <img src={collectionBannerMobilePreview} alt="Collection Banner Mobile Preview" width="100" />}
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            ) : (
              <Button variant="contained" color="secondary" type="submit" sx={{ mt: 2 }}>
                {subcategoryEditMode ? 'Save Changes' : 'Add Subcategory'}
              </Button>
            )}
          </form>
        </Box>
      </Modal>

    </Container >

  );
};

export default CMSPage;
