import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
} from '@coreui/react';
import {
  createProduct,
  fetchCategories,
  fetchBrands,
  fetchColors,
  fetchMeasurements,
  fetchProduct,
  fetchSubCategories,
  fetchEvents,
  updateProduct,
} from '../api/client';

const initialForm = {
  category_id: '',
  sub_category_id: '',
  brand_id: '',
  event_id: '',
  name: '',
  price: '',
  discount_price: '',
  stock: '',
  description: '',
  images: [],
  color_ids: [],
  measurement_ids: [],
  is_active: true,
};

function formatPrice(value) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00';
}

function calculateEventDiscount(price, event) {
  if (!event) return null;
  const discount = Number(event.discount_value || 0);
  if (!discount) return null;
  if (event.discount_type === 'percent') {
    return Math.max(0, price - price * (discount / 100));
  }
  if (event.discount_type === 'fixed') {
    return Math.max(0, price - discount);
  }
  return null;
}

export default function ProductForm({ productId = null }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [events, setEvents] = useState([]);
  const [colors, setColors] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);

  const isEdit = Boolean(productId);
  const selectedEvent = events.find((eventItem) => String(eventItem.id) === String(form.event_id));
  const eventHasDiscount = selectedEvent && Number(selectedEvent.discount_value || 0) > 0;

  const newImagePreviews = useMemo(
    () => form.images.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [form.images]
  );

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [newImagePreviews]);

  useEffect(() => {
    async function loadFormData() {
      try {
        const [categoriesData, subCategoriesData, brandsData, colorsData, measurementsData, eventsData] = await Promise.all([
          fetchCategories(),
          fetchSubCategories(),
          fetchBrands(),
          fetchColors(),
          fetchMeasurements(),
          fetchEvents(),
        ]);

        const categoryList = Array.isArray(categoriesData) ? categoriesData : [];
        const subCategoryList = Array.isArray(subCategoriesData) ? subCategoriesData : [];
        setCategories(categoryList);
        setSubCategories(subCategoryList);
        setBrands(Array.isArray(brandsData) ? brandsData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
        setMeasurements(Array.isArray(measurementsData) ? measurementsData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);

        if (isEdit) {
          const product = await fetchProduct(productId);
          setForm({
            category_id: String(product.category_id),
            sub_category_id: String(product.sub_category_id || ''),
            brand_id: product.brand_id ? String(product.brand_id) : '',
            event_id: product.event_id ? String(product.event_id) : '',
            name: product.name,
            price: String(product.price),
            discount_price: product.discount_price ? String(product.discount_price) : '',
            stock: String(product.stock),
            description: product.description || '',
            images: [],
            color_ids: Array.isArray(product.colors) ? product.colors.map((color) => String(color.id)) : [],
            measurement_ids: Array.isArray(product.measurements)
              ? product.measurements.map((measurement) => String(measurement.id))
              : [],
            is_active: product.is_active,
          });
          setExistingImages(Array.isArray(product.images) ? product.images : []);
        } else if (categoryList.length > 0) {
          const defaultCategoryId = String(categoryList[0].id);
          const defaultSubCategory = subCategoryList.find(
            (subCategory) => String(subCategory.category_id) === defaultCategoryId
          );
          setForm((prev) => ({
            ...prev,
            category_id: defaultCategoryId,
            sub_category_id: defaultSubCategory ? String(defaultSubCategory.id) : '',
          }));
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load product form data.');
      } finally {
        setLoading(false);
      }
    }

    loadFormData();
  }, [isEdit, productId]);

  function onInputChange(event) {
    const { name, value, type, checked, options } = event.target;

    setForm((prev) => {
      if (name === 'color_ids' || name === 'measurement_ids') {
        const selectedValues = Array.from(options)
          .filter((option) => option.selected)
          .map((option) => option.value);

        return {
          ...prev,
          [name]: selectedValues,
        };
      }

      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'event_id') {
        next.discount_price = '';
      }

      if (name === 'category_id') {
        const firstSubCategory = subCategories.find((subCategory) => String(subCategory.category_id) === value);
        next.sub_category_id = firstSubCategory ? String(firstSubCategory.id) : '';
      }

      return next;
    });
  }

  function addImages(files) {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      return;
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...imageFiles].slice(0, 8) }));
  }

  function onImageInputChange(event) {
    addImages(Array.from(event.target.files || []));
    event.target.value = '';
  }

  function onDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    addImages(Array.from(event.dataTransfer.files || []));
  }

  function removeNewImage(indexToRemove) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  }

  function toggleExistingImage(imageId) {
    setRemoveImageIds((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const payload = new FormData();
    payload.append('category_id', String(Number(form.category_id)));
    payload.append('sub_category_id', String(Number(form.sub_category_id)));
    payload.append('brand_id', form.brand_id ? String(Number(form.brand_id)) : '');
    payload.append('name', form.name);
    payload.append('price', String(Number(form.price)));
    if (form.event_id) {
      payload.append('event_id', String(Number(form.event_id)));
    }
    if (form.discount_price && !form.event_id) {
      payload.append('discount_price', String(Number(form.discount_price)));
    }
    payload.append('stock', String(Number(form.stock)));
    payload.append('description', form.description || '');
    payload.append('is_active', form.is_active ? '1' : '0');
    form.images.forEach((file) => payload.append('images[]', file));
    form.color_ids.forEach((id) => payload.append('color_ids[]', id));
    form.measurement_ids.forEach((id) => payload.append('measurement_ids[]', id));
    removeImageIds.forEach((id) => payload.append('remove_image_ids[]', String(id)));

    try {
      if (isEdit) {
        await updateProduct(productId, payload);
        setMessage('Product updated successfully.');
      } else {
        await createProduct(payload);
        setMessage('Product created successfully.');
      }

      navigate('/dashboard/products/list');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <CCard>
      <CCardHeader>{isEdit ? 'Edit Product' : 'Create Product'}</CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {message && <CAlert color="success">{message}</CAlert>}
        <CForm onSubmit={onSubmit}>
          <CRow>
            <CCol md={6} className="mb-3">
              <CFormSelect label="Category" name="category_id" value={form.category_id} onChange={onInputChange} required>
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormSelect
                label="Sub Category"
                name="sub_category_id"
                value={form.sub_category_id}
                onChange={onInputChange}
                required
              >
                <option value="">Select sub category</option>
                {subCategories
                  .filter((subCategory) => String(subCategory.category_id) === String(form.category_id))
                  .map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                  ))}
              </CFormSelect>
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormSelect
                label="Brand"
                name="brand_id"
                value={form.brand_id}
                onChange={onInputChange}
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormSelect
                label="Event (optional)"
                name="event_id"
                value={form.event_id}
                onChange={onInputChange}
              >
                <option value="">No event</option>
                {events.map((eventItem) => (
                  <option key={eventItem.id} value={eventItem.id}>
                    {eventItem.name} {eventItem.is_active ? '(Active)' : '(Inactive)'}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput label="Name" name="name" value={form.name} onChange={onInputChange} required />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput label="Price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={onInputChange} required />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput
                label="Discount Price (manual)"
                name="discount_price"
                type="number"
                min="0"
                step="0.01"
                value={form.discount_price}
                onChange={onInputChange}
                disabled={Boolean(form.event_id)}
                placeholder={form.event_id ? 'Disabled when event is selected' : ''}
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <CFormInput label="Stock" name="stock" type="number" min="0" value={form.stock} onChange={onInputChange} required />
            </CCol>
            <CCol md={6} className="mb-3">
              <label className="form-label">Colors (multiple)</label>
              <Select
                isMulti
                options={colors.map((color) => ({ value: String(color.id), label: color.name }))}
                value={form.color_ids.map((id) => {
                  const color = colors.find((item) => String(item.id) === String(id));
                  return color ? { value: String(color.id), label: color.name } : null;
                }).filter(Boolean)}
                onChange={(selected) => {
                  setForm((prev) => ({
                    ...prev,
                    color_ids: selected ? selected.map((item) => item.value) : [],
                  }));
                }}
                classNamePrefix="select"
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <label className="form-label">Measurements (multiple)</label>
              <Select
                isMulti
                options={measurements.map((measurement) => ({
                  value: String(measurement.id),
                  label: `${measurement.name} ${measurement.value ? `(${measurement.value}${measurement.unit})` : `(${measurement.unit})`}`,
                }))}
                value={form.measurement_ids.map((id) => {
                  const measurement = measurements.find((item) => String(item.id) === String(id));
                  return measurement
                    ? {
                        value: String(measurement.id),
                        label: `${measurement.name} ${measurement.value ? `(${measurement.value}${measurement.unit})` : `(${measurement.unit})`}`,
                      }
                    : null;
                }).filter(Boolean)}
                onChange={(selected) => {
                  setForm((prev) => ({
                    ...prev,
                    measurement_ids: selected ? selected.map((item) => item.value) : [],
                  }));
                }}
                classNamePrefix="select"
              />
            </CCol>
            <CCol md={6} className="mb-3">
              <label className="form-label">Product Images (Multiple)</label>
              <div
                className={`drop-zone ${isDragOver ? 'drop-zone-active' : ''}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <p className="mb-1">Drag and drop images here</p>
                <small className="text-body-secondary">or click to choose files (max 8)</small>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="d-none" onChange={onImageInputChange} />
            </CCol>
            <CCol md={6} className="mb-3 d-flex align-items-end">
              <CFormCheck label="Active" name="is_active" checked={form.is_active} onChange={onInputChange} />
            </CCol>
            <CCol xs={12} className="mb-3">
              <CFormTextarea label="Description" name="description" rows={3} value={form.description} onChange={onInputChange} />
            </CCol>
          </CRow>

          {selectedEvent && (
            <div className="mb-3">
              <CAlert color={selectedEvent.is_active ? 'info' : 'warning'}>
                Event: <strong>{selectedEvent.name}</strong>{' '}
                {eventHasDiscount && (
                  <>
                    — Discount {selectedEvent.discount_type === 'percent' ? `${selectedEvent.discount_value}%` : `AED ${formatPrice(selectedEvent.discount_value)}`}
                  </>
                )}
                {form.price && eventHasDiscount && (
                  <>
                    {' '}| Price: <span className="price-old">AED {formatPrice(form.price)}</span>{' '}
                    <span className="price-discount">
                      AED {formatPrice(calculateEventDiscount(Number(form.price), selectedEvent))}
                    </span>
                  </>
                )}
              </CAlert>
            </div>
          )}

          {isEdit && existingImages.length > 0 && (
            <div className="mb-3">
              <p className="mb-2">Existing Images</p>
              <div className="thumb-grid">
                {existingImages.map((image) => (
                  <div key={image.id} className="thumb-item">
                    <img src={image.url} alt="Product" className="product-thumb" />
                    <button
                      type="button"
                      className={`thumb-remove ${removeImageIds.includes(image.id) ? 'thumb-remove-active' : ''}`}
                      onClick={() => toggleExistingImage(image.id)}
                    >
                      {removeImageIds.includes(image.id) ? 'Undo remove' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newImagePreviews.length > 0 && (
            <div className="mb-3">
              <p className="mb-2">New Images</p>
              <div className="thumb-grid">
                {newImagePreviews.map((item, index) => (
                  <div key={`${item.file.name}-${index}`} className="thumb-item">
                    <img src={item.url} alt={item.file.name} className="product-thumb" />
                    <button type="button" className="thumb-remove" onClick={() => removeNewImage(index)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <CFormCheck label="Active" name="is_active" checked={form.is_active} onChange={onInputChange} />
          </div>

          <div className="d-flex gap-2">
            <CButton type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}</CButton>
            <CButton type="button" color="secondary" variant="outline" onClick={() => navigate('/dashboard/products/list')}>
              Cancel
            </CButton>
          </div>
        </CForm>
      </CCardBody>
    </CCard>
  );
}
