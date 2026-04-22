import { useEffect, useMemo, useState } from 'react';
import Select, { components } from 'react-select';
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
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import AppDataTable from '../components/AppDataTable';
import {
  createEvent,
  deleteEvent,
  fetchEvent,
  fetchEvents,
  fetchProducts,
  updateEvent,
} from '../api/client';

const initialForm = {
  name: '',
  discount_type: 'percent',
  discount_value: '',
  starts_at: '',
  ends_at: '',
  is_active: true,
  product_ids: [],
};

function formatPrice(value) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : '0.00';
}

function getDiscountedPrice(price, discountType, discountValue) {
  const base = Number(price || 0);
  const value = Number(discountValue || 0);
  if (!value) return base;
  if (discountType === 'percent') {
    return Math.max(0, base - base * (value / 100));
  }
  if (discountType === 'fixed') {
    return Math.max(0, base - value);
  }
  return base;
}

function toLocalInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    try {
      const [eventsData, productsData] = await Promise.all([fetchEvents(), fetchProducts()]);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load events.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function onInputChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function startEdit(eventRow) {
    setEditingId(eventRow.id);
    setError('');
    setMessage('');

    try {
      const eventData = await fetchEvent(eventRow.id);
      setForm({
        name: eventData.name,
        discount_type: eventData.discount_type || 'percent',
        discount_value: eventData.discount_value ?? '',
        starts_at: toLocalInput(eventData.starts_at),
        ends_at: toLocalInput(eventData.ends_at),
        is_active: eventData.is_active,
        product_ids: Array.isArray(eventData.products)
          ? eventData.products.map((product) => String(product.id))
          : [],
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load event details.');
    }
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const payload = {
      name: form.name,
      discount_type: form.discount_type,
      discount_value: form.discount_value === '' ? 0 : Number(form.discount_value),
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      is_active: form.is_active,
      products: form.product_ids.map((id) => Number(id)),
    };

    try {
      if (editingId) {
        await updateEvent(editingId, payload);
        setMessage('Event updated successfully.');
      } else {
        await createEvent(payload);
        setMessage('Event created successfully.');
      }
      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save event.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(eventId) {
    setError('');
    setMessage('');

    try {
      await deleteEvent(eventId);
      if (editingId === eventId) {
        resetForm();
      }
      setMessage('Event deleted successfully.');
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete event.');
    }
  }

  const columns = useMemo(
    () => [
      { name: 'ID', selector: (row) => row.id, sortable: true, width: '80px' },
      { name: 'Name', selector: (row) => row.name, sortable: true },
      {
        name: 'Discount',
        selector: (row) =>
          `${row.discount_type === 'fixed' ? 'AED ' : ''}${row.discount_value}${
            row.discount_type === 'percent' ? '%' : ''
          }`,
        sortable: true,
      },
      {
        name: 'Timeline',
        selector: (row) => {
          const start = row.starts_at ? String(row.starts_at).slice(0, 10) : '-';
          const end = row.ends_at ? String(row.ends_at).slice(0, 10) : '-';
          return `${start} → ${end}`;
        },
      },
      {
        name: 'Products',
        cell: (row) => {
          const list = Array.isArray(row.products) ? row.products : [];
          return (
            <details className="event-products">
              <summary>Products ({list.length})</summary>
              <div className="event-products-list">
                {list.length === 0 && <span className="text-body-secondary">No products</span>}
                {list.map((product) => {
                  const discounted = getDiscountedPrice(product.price, row.discount_type, row.discount_value);
                  const hasDiscount = Number(row.discount_value || 0) > 0;
                  return (
                    <div key={product.id} className="event-product-item">
                      <span className="event-product-name">{product.name}</span>
                      {hasDiscount ? (
                        <span className="event-product-price">
                          <span className="price-old">AED {formatPrice(product.price)}</span>
                          <span className="price-discount">AED {formatPrice(discounted)}</span>
                        </span>
                      ) : (
                        <span className="event-product-price">AED {formatPrice(product.price)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          );
        },
      },
      { name: 'Status', selector: (row) => (row.is_active ? 'Active' : 'Inactive'), sortable: true },
      {
        name: 'Actions',
        cell: (row) => (
          <div className="d-flex gap-2">
            <CButton color="info" variant="outline" size="sm" title="Edit" onClick={() => startEdit(row)}>
              <CIcon icon={cilPen} />
            </CButton>
            <CButton color="danger" variant="outline" size="sm" title="Delete" onClick={() => onDelete(row.id)}>
              <CIcon icon={cilTrash} />
            </CButton>
          </div>
        ),
      },
    ],
    [editingId]
  );

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: String(product.id),
        label: product.name,
        price: product.price,
        image: product.image_url,
      })),
    [products]
  );

  const ProductOption = (props) => {
    const { data } = props;
    const discounted = getDiscountedPrice(data.price, form.discount_type, form.discount_value);
    const hasDiscount = Number(form.discount_value || 0) > 0;

    return (
      <components.Option {...props}>
        <div className="product-option">
          {data.image ? (
            <img src={data.image} alt={data.label} className="product-option-thumb" />
          ) : (
            <div className="product-option-thumb placeholder" />
          )}
          <div className="product-option-meta">
            <div className="product-option-name">{data.label}</div>
            {hasDiscount ? (
              <div className="product-option-price">
                <span className="price-old">AED {formatPrice(data.price)}</span>
                <span className="price-discount">AED {formatPrice(discounted)}</span>
              </div>
            ) : (
              <div className="product-option-price">AED {formatPrice(data.price)}</div>
            )}
          </div>
        </div>
      </components.Option>
    );
  };

  const ProductMultiValue = (props) => (
    <components.MultiValueLabel {...props}>{props.data.label}</components.MultiValueLabel>
  );

  return (
    <CRow>
      <CCol lg={4}>
        <CCard className="mb-4">
          <CCardHeader>{editingId ? 'Edit Event' : 'Create Event'}</CCardHeader>
          <CCardBody>
            <CForm onSubmit={onSubmit}>
              <div className="mb-3">
                <CFormInput label="Event Name" name="name" value={form.name} onChange={onInputChange} required />
              </div>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormSelect
                    label="Discount Type"
                    name="discount_type"
                    value={form.discount_type}
                    onChange={onInputChange}
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </CFormSelect>
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="Discount Value"
                    name="discount_value"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount_value}
                    onChange={onInputChange}
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormInput
                    label="Start Date"
                    name="starts_at"
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={onInputChange}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormInput
                    label="End Date (Due)"
                    name="ends_at"
                    type="datetime-local"
                    value={form.ends_at}
                    onChange={onInputChange}
                  />
                </CCol>
              </CRow>
              <div className="mb-3">
                <label className="form-label">Products (Search & select)</label>
                <Select
                  isMulti
                  options={productOptions}
                  value={form.product_ids
                    .map((id) => {
                      const product = productOptions.find((item) => String(item.value) === String(id));
                      return product || null;
                    })
                    .filter(Boolean)}
                  onChange={(selected) => {
                    setForm((prev) => ({
                      ...prev,
                      product_ids: selected ? selected.map((item) => item.value) : [],
                    }));
                  }}
                  classNamePrefix="select"
                  components={{
                    Option: ProductOption,
                    MultiValueLabel: ProductMultiValue,
                  }}
                />
              </div>
              <div className="mb-3">
                <CFormCheck label="Active" name="is_active" checked={form.is_active} onChange={onInputChange} />
              </div>
              <div className="d-flex gap-2">
                <CButton type="submit" color="primary" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </CButton>
                {editingId && (
                  <CButton type="button" color="secondary" variant="outline" onClick={resetForm}>
                    Cancel
                  </CButton>
                )}
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={8}>
        <CCard className="mb-4">
          <CCardHeader>Events</CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {message && <CAlert color="success">{message}</CAlert>}
            <AppDataTable columns={columns} data={events} progressPending={loading} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}
