import { useEffect, useMemo, useState } from 'react';
import {
  CAlert, CButton, CCard, CCardBody, CCardHeader, CCol, CForm, CFormCheck,
  CFormInput, CFormSelect, CFormTextarea, CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import AppDataTable from '../components/AppDataTable';
import RichTextEditor from '../components/RichTextEditor';
import {
  createProject, deleteProject, deleteProjectImage, fetchProject, fetchProjects, updateProject,
} from '../api/client';

const initialForm = {
  title: '', slug: '', project_type: 'residential', location: '', client_name: '', area: '',
  completed_at: '', summary: '', content: '', services: '', materials: '', cover_image_alt: '',
  status: 'draft', is_featured: false, published_at: '', sort_order: 0,
  meta_title: '', meta_description: '', cover_image_url: '', images: [],
};

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function lineValues(value) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export default function ProjectsAdminPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load projects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setCoverFile(null);
    setGalleryFiles([]);
  }

  async function startEdit(row) {
    setError(''); setMessage('');
    try {
      const project = await fetchProject(row.id);
      setEditingId(project.id);
      setCoverFile(null);
      setGalleryFiles([]);
      setForm({
        title: project.title || '', slug: project.slug || '', project_type: project.project_type || 'residential',
        location: project.location || '', client_name: project.client_name || '', area: project.area || '',
        completed_at: project.completed_at ? String(project.completed_at).slice(0, 10) : '', summary: project.summary || '',
        content: project.content || '', services: (project.services || []).join('\n'), materials: (project.materials || []).join('\n'),
        cover_image_alt: project.cover_image_alt || '', status: project.status || 'draft', is_featured: Boolean(project.is_featured),
        published_at: toLocalDateTime(project.published_at), sort_order: Number(project.sort_order || 0),
        meta_title: project.meta_title || '', meta_description: project.meta_description || '',
        cover_image_url: project.cover_image_url || '', images: Array.isArray(project.images) ? project.images : [],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load project details.');
    }
  }

  function buildPayload() {
    const payload = new FormData();
    ['title', 'slug', 'project_type', 'location', 'client_name', 'area', 'completed_at', 'summary', 'content', 'cover_image_alt', 'status', 'published_at', 'sort_order', 'meta_title', 'meta_description']
      .forEach((key) => payload.append(key, form[key] ?? ''));
    payload.append('is_featured', form.is_featured ? '1' : '0');
    payload.append('services_json', JSON.stringify(lineValues(form.services)));
    payload.append('materials_json', JSON.stringify(lineValues(form.materials)));
    if (coverFile) payload.append('cover_image', coverFile);
    galleryFiles.forEach((file) => {
      payload.append('gallery_images[]', file);
      payload.append('gallery_alt_texts[]', form.title);
    });
    return payload;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      if (editingId) {
        await updateProject(editingId, buildPayload());
        setMessage(`Project “${form.title}” updated successfully.`);
      } else {
        await createProject(buildPayload());
        setMessage(`Project “${form.title}” created successfully.`);
      }
      resetForm();
      await loadProjects();
    } catch (requestError) {
      const validation = requestError.response?.data?.errors;
      setError(validation ? Object.values(validation).flat().join(' ') : requestError.response?.data?.message || 'Unable to save project.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(project) {
    if (!window.confirm(`Delete “${project.title}” and its gallery?`)) return;
    try {
      await deleteProject(project.id);
      if (editingId === project.id) resetForm();
      setMessage(`Project “${project.title}” deleted.`);
      await loadProjects();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete project.');
    }
  }

  async function removeExistingImage(image) {
    if (!editingId || !window.confirm('Delete this gallery image?')) return;
    try {
      await deleteProjectImage(editingId, image.id);
      setForm((current) => ({ ...current, images: current.images.filter((item) => item.id !== image.id) }));
      setMessage('Gallery image deleted.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete image.');
    }
  }

  const columns = useMemo(() => [
    { name: 'ID', selector: (row) => row.id, sortable: true, width: '74px' },
    { name: 'Project', selector: (row) => row.title, sortable: true },
    { name: 'Type', selector: (row) => row.project_type, sortable: true },
    { name: 'Location', selector: (row) => row.location || '—', sortable: true },
    { name: 'Status', selector: (row) => row.status, sortable: true },
    { name: 'Featured', selector: (row) => row.is_featured ? 'Yes' : 'No', sortable: true },
    { name: 'Gallery', selector: (row) => Array.isArray(row.images) ? row.images.length : 0, sortable: true },
    { name: 'Actions', cell: (row) => <div className="d-flex gap-2"><CButton size="sm" color="info" variant="outline" title="Edit" onClick={() => startEdit(row)}><CIcon icon={cilPen} /></CButton><CButton size="sm" color="danger" variant="outline" title="Delete" onClick={() => onDelete(row)}><CIcon icon={cilTrash} /></CButton></div> },
  ], [editingId]);

  return (
    <div className="content-admin-page">
      {error && <CAlert color="danger">{error}</CAlert>}
      {message && <CAlert color="success">{message}</CAlert>}
      <CCard className="mb-4 content-admin-editor-card">
        <CCardHeader>{editingId ? 'Edit project' : 'Create project'}</CCardHeader>
        <CCardBody>
          <CForm onSubmit={onSubmit}>
            <div className="content-admin-form-grid">
              <CFormInput label="Project title" name="title" value={form.title} onChange={onChange} required />
              <CFormInput label="URL slug" name="slug" value={form.slug} onChange={onChange} placeholder="Generated from title when empty" />
              <CFormSelect label="Project type" name="project_type" value={form.project_type} onChange={onChange}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="hospitality">Hospitality</option><option value="office">Office</option></CFormSelect>
              <CFormInput label="Location" name="location" value={form.location} onChange={onChange} placeholder="Dubai, UAE" />
              <CFormInput label="Client name (optional)" name="client_name" value={form.client_name} onChange={onChange} />
              <CFormInput label="Area / size" name="area" value={form.area} onChange={onChange} placeholder="350 m²" />
              <CFormInput label="Completion date" type="date" name="completed_at" value={form.completed_at} onChange={onChange} />
              <CFormInput label="Display order" type="number" min="0" name="sort_order" value={form.sort_order} onChange={onChange} />
              <div className="content-admin-span-2"><CFormTextarea label="Short summary" rows={3} name="summary" value={form.summary} onChange={onChange} /></div>
              <div className="content-admin-span-2"><RichTextEditor label="Full project story" value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} minHeight={240} /></div>
              <CFormTextarea label="Services (one per line)" rows={5} name="services" value={form.services} onChange={onChange} />
              <CFormTextarea label="Materials and products (one per line)" rows={5} name="materials" value={form.materials} onChange={onChange} />
              <CFormInput label="Cover image" type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
              <CFormInput label="Cover image alt text" name="cover_image_alt" value={form.cover_image_alt} onChange={onChange} />
              <CFormInput label="Add gallery images" type="file" accept="image/*" multiple onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))} />
              <div className="content-admin-file-note">{galleryFiles.length ? `${galleryFiles.length} new gallery images selected` : 'Up to 20 images, maximum 5 MB each.'}</div>
              {(form.cover_image_url || form.images.length > 0) && <div className="content-admin-existing-media content-admin-span-2">{form.cover_image_url && <figure><img src={form.cover_image_url} alt="Current cover" /><figcaption>Current cover</figcaption></figure>}{form.images.map((image) => <figure key={image.id}><img src={image.url} alt={image.alt_text || ''} /><button type="button" onClick={() => removeExistingImage(image)}>Remove</button></figure>)}</div>}
              <CFormSelect label="Publishing status" name="status" value={form.status} onChange={onChange}><option value="draft">Draft</option><option value="published">Published</option></CFormSelect>
              <CFormInput label="Publish date" type="datetime-local" name="published_at" value={form.published_at} onChange={onChange} />
              <div><CFormCheck label="Featured project" name="is_featured" checked={form.is_featured} onChange={onChange} /></div>
              <div />
              <CFormInput label="Meta title" name="meta_title" value={form.meta_title} onChange={onChange} maxLength={255} />
              <CFormTextarea label="Meta description" rows={3} name="meta_description" value={form.meta_description} onChange={onChange} maxLength={1000} />
            </div>
            <div className="d-flex gap-2 mt-4"><CButton type="submit" color="primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update project' : 'Create project'}</CButton>{editingId && <CButton type="button" color="secondary" variant="outline" onClick={resetForm}>Cancel</CButton>}</div>
          </CForm>
        </CCardBody>
      </CCard>
      <CCard><CCardHeader>Projects</CCardHeader><CCardBody><AppDataTable columns={columns} data={projects} progressPending={loading} searchPlaceholder="Search projects…" /></CCardBody></CCard>
    </div>
  );
}
