import { useEffect, useMemo, useState } from 'react';
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
import {
  createMeasurement,
  deleteMeasurement,
  fetchMeasurements,
  updateMeasurement,
} from '../api/client';

const initialForm = {
  name: '',
  value: '',
  unit: 'cm',
  is_active: true,
};

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadMeasurements() {
    try {
      const data = await fetchMeasurements();
      setMeasurements(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load measurements.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeasurements();
  }, []);

  function onInputChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function startEdit(measurement) {
    setEditingId(measurement.id);
    setForm({
      name: measurement.name,
      value: measurement.value || '',
      unit: measurement.unit,
      is_active: measurement.is_active,
    });
    setMessage('');
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await updateMeasurement(editingId, form);
        setMessage('Measurement updated successfully.');
      } else {
        await createMeasurement(form);
        setMessage('Measurement created successfully.');
      }
      resetForm();
      await loadMeasurements();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save measurement.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(measurementId) {
    setError('');
    setMessage('');

    try {
      await deleteMeasurement(measurementId);
      if (editingId === measurementId) {
        resetForm();
      }
      setMessage('Measurement deleted successfully.');
      await loadMeasurements();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete measurement.');
    }
  }

  const columns = useMemo(
    () => [
      { name: 'ID', selector: (row) => row.id, sortable: true, width: '80px' },
      { name: 'Name', selector: (row) => row.name, sortable: true },
      { name: 'Value', selector: (row) => row.value || '-', sortable: true },
      { name: 'Unit', selector: (row) => row.unit, sortable: true },
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
          <CCardHeader>{editingId ? 'Edit Measurement' : 'Create Measurement'}</CCardHeader>
          <CCardBody>
            <CForm onSubmit={onSubmit}>
              <div className="mb-3">
                <CFormInput label="Name" name="name" value={form.name} onChange={onInputChange} required />
              </div>
              <div className="mb-3">
                <CFormInput label="Value" name="value" value={form.value} onChange={onInputChange} />
              </div>
              <div className="mb-3">
                <CFormInput label="Unit" name="unit" value={form.unit} onChange={onInputChange} required />
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
          <CCardHeader>Measurements</CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {message && <CAlert color="success">{message}</CAlert>}
            <AppDataTable columns={columns} data={measurements} progressPending={loading} />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}
