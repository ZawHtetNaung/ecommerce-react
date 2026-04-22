import { useEffect, useMemo, useRef, useState } from 'react';
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
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import AppDataTable from '../components/AppDataTable';
import { createColor, deleteColor, fetchColors, updateColor } from '../api/client';

const initialForm = {
  name: '',
  image: null,
  is_active: true,
};

export default function ColorsPage() {
  const fileInputRef = useRef(null);
  const [colors, setColors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  async function loadColors() {
    try {
      const data = await fetchColors();
      setColors(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load colors.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadColors();
  }, []);

  function onInputChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function onDrop(event) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setForm((prev) => ({ ...prev, image: file }));
  }

  function onImageInputChange(event) {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, image: file }));
    event.target.value = '';
  }

  function startEdit(color) {
    setEditingId(color.id);
    setForm({
      name: color.name,
      image: null,
      is_active: color.is_active,
    });
    setCurrentImageUrl(color.image_url || '');
    setMessage('');
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setCurrentImageUrl('');
    setForm(initialForm);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const payload = new FormData();
    payload.append('name', form.name);
    payload.append('is_active', form.is_active ? '1' : '0');
    if (form.image) payload.append('image', form.image);

    try {
      if (editingId) {
        await updateColor(editingId, payload);
        setMessage('Color updated successfully.');
      } else {
        await createColor(payload);
        setMessage('Color created successfully.');
      }
      resetForm();
      await loadColors();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save color.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(colorId) {
    setError('');
    setMessage('');

    try {
      await deleteColor(colorId);
      if (editingId === colorId) resetForm();
      setMessage('Color deleted successfully.');
      await loadColors();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete color.');
    }
  }

  const columns = useMemo(
    () => [
      { name: 'ID', selector: (row) => row.id, sortable: true, width: '80px' },
      {
        name: 'Image',
        cell: (row) => (row.image_url ? <img src={row.image_url} alt={row.name} className="product-thumb" /> : '-'),
      },
      { name: 'Name', selector: (row) => row.name, sortable: true },
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

  return (
    <CRow>
      <CCol lg={4}>
        <CCard className="mb-4">
          <CCardHeader>{editingId ? 'Edit Color' : 'Create Color'}</CCardHeader>
          <CCardBody>
            <CForm onSubmit={onSubmit}>
              <div className="mb-3">
                <CFormInput label="Name" name="name" value={form.name} onChange={onInputChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Image (Single)</label>
                <div
                  className={`drop-zone ${isDragOver ? 'drop-zone-active' : ''} ${(form.image || currentImageUrl) ? 'drop-zone-has-image' : ''}`}
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
                  {form.image ? (
                    <img className="drop-zone-image" src={URL.createObjectURL(form.image)} alt="Color" />
                  ) : currentImageUrl ? (
                    <img className="drop-zone-image" src={currentImageUrl} alt="Color" />
                  ) : (
                    <>
                      <p className="mb-1">Drag and drop one image here</p>
                      <small className="text-body-secondary">or click to choose</small>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={onImageInputChange} />
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
          <CCardHeader>Colors</CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {message && <CAlert color="success">{message}</CAlert>}
            <AppDataTable columns={columns} data={colors} progressPending={loading} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}
