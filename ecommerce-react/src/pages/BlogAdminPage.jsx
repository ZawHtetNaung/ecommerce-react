import { useEffect, useMemo, useState } from 'react';
import {
  CAlert, CButton, CCard, CCardBody, CCardHeader, CForm, CFormCheck,
  CFormInput, CFormSelect, CFormTextarea,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPen, cilTrash } from '@coreui/icons';
import AppDataTable from '../components/AppDataTable';
import RichTextEditor from '../components/RichTextEditor';
import {
  createBlogCategory, createBlogPost, deleteBlogCategory, deleteBlogPost,
  fetchBlogCategories, fetchBlogPost, fetchBlogPosts, updateBlogCategory, updateBlogPost,
} from '../api/client';

const initialPost = {
  blog_category_id: '', title: '', slug: '', excerpt: '', content: '', cover_image_alt: '',
  author_name: '', status: 'draft', is_featured: false, published_at: '',
  meta_title: '', meta_description: '', cover_image_url: '',
};
const initialCategory = { name: '', slug: '', description: '', is_active: true };

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [postForm, setPostForm] = useState(initialPost);
  const [categoryForm, setCategoryForm] = useState(initialCategory);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadData() {
    try {
      const [postData, categoryData] = await Promise.all([fetchBlogPosts(), fetchBlogCategories()]);
      setPosts(Array.isArray(postData) ? postData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load blog content.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function onPostChange(event) {
    const { name, value, type, checked } = event.target;
    setPostForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function onCategoryChange(event) {
    const { name, value, type, checked } = event.target;
    setCategoryForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function resetPost() { setPostForm(initialPost); setEditingPostId(null); setCoverFile(null); }
  function resetCategory() { setCategoryForm(initialCategory); setEditingCategoryId(null); }

  async function startEditPost(row) {
    try {
      const post = await fetchBlogPost(row.id);
      setEditingPostId(post.id);
      setCoverFile(null);
      setPostForm({
        blog_category_id: post.blog_category_id ? String(post.blog_category_id) : '', title: post.title || '',
        slug: post.slug || '', excerpt: post.excerpt || '', content: post.content || '', cover_image_alt: post.cover_image_alt || '',
        author_name: post.author_name || '', status: post.status || 'draft', is_featured: Boolean(post.is_featured),
        published_at: toLocalDateTime(post.published_at), meta_title: post.meta_title || '',
        meta_description: post.meta_description || '', cover_image_url: post.cover_image_url || '',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load article.');
    }
  }

  function buildPostPayload() {
    const payload = new FormData();
    Object.entries(postForm).forEach(([key, value]) => {
      if (key === 'cover_image_url' || key === 'is_featured') return;
      payload.append(key, value ?? '');
    });
    payload.append('is_featured', postForm.is_featured ? '1' : '0');
    if (coverFile) payload.append('cover_image', coverFile);
    return payload;
  }

  async function savePost(event) {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      if (editingPostId) {
        await updateBlogPost(editingPostId, buildPostPayload());
        setMessage(`Article “${postForm.title}” updated successfully.`);
      } else {
        await createBlogPost(buildPostPayload());
        setMessage(`Article “${postForm.title}” created successfully.`);
      }
      resetPost();
      await loadData();
    } catch (requestError) {
      const validation = requestError.response?.data?.errors;
      setError(validation ? Object.values(validation).flat().join(' ') : requestError.response?.data?.message || 'Unable to save article.');
    } finally {
      setSaving(false);
    }
  }

  async function removePost(post) {
    if (!window.confirm(`Delete “${post.title}”?`)) return;
    try {
      await deleteBlogPost(post.id);
      if (editingPostId === post.id) resetPost();
      setMessage(`Article “${post.title}” deleted.`);
      await loadData();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete article.'); }
  }

  async function saveCategory(event) {
    event.preventDefault();
    setError(''); setMessage('');
    try {
      if (editingCategoryId) {
        await updateBlogCategory(editingCategoryId, categoryForm);
        setMessage(`Category “${categoryForm.name}” updated.`);
      } else {
        await createBlogCategory(categoryForm);
        setMessage(`Category “${categoryForm.name}” created.`);
      }
      resetCategory();
      await loadData();
    } catch (requestError) {
      const validation = requestError.response?.data?.errors;
      setError(validation ? Object.values(validation).flat().join(' ') : requestError.response?.data?.message || 'Unable to save category.');
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Delete category “${category.name}”? Existing posts will become uncategorized.`)) return;
    try {
      await deleteBlogCategory(category.id);
      if (editingCategoryId === category.id) resetCategory();
      setMessage(`Category “${category.name}” deleted.`);
      await loadData();
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to delete category.'); }
  }

  const postColumns = useMemo(() => [
    { name: 'ID', selector: (row) => row.id, sortable: true, width: '74px' },
    { name: 'Article', selector: (row) => row.title, sortable: true },
    { name: 'Category', selector: (row) => row.category?.name || 'Uncategorized', sortable: true },
    { name: 'Status', selector: (row) => row.status, sortable: true },
    { name: 'Featured', selector: (row) => row.is_featured ? 'Yes' : 'No', sortable: true },
    { name: 'Published', selector: (row) => row.published_at ? String(row.published_at).slice(0, 10) : '—', sortable: true },
    { name: 'Actions', cell: (row) => <div className="d-flex gap-2"><CButton size="sm" color="info" variant="outline" title="Edit" onClick={() => startEditPost(row)}><CIcon icon={cilPen} /></CButton><CButton size="sm" color="danger" variant="outline" title="Delete" onClick={() => removePost(row)}><CIcon icon={cilTrash} /></CButton></div> },
  ], [editingPostId]);

  const categoryColumns = useMemo(() => [
    { name: 'Category', selector: (row) => row.name, sortable: true },
    { name: 'Posts', selector: (row) => row.posts_count || 0, sortable: true },
    { name: 'Status', selector: (row) => row.is_active ? 'Active' : 'Inactive', sortable: true },
    { name: 'Actions', cell: (row) => <div className="d-flex gap-2"><CButton size="sm" color="info" variant="outline" title="Edit" onClick={() => { setEditingCategoryId(row.id); setCategoryForm({ name: row.name || '', slug: row.slug || '', description: row.description || '', is_active: Boolean(row.is_active) }); }}><CIcon icon={cilPen} /></CButton><CButton size="sm" color="danger" variant="outline" title="Delete" onClick={() => removeCategory(row)}><CIcon icon={cilTrash} /></CButton></div> },
  ], [editingCategoryId]);

  return (
    <div className="content-admin-page">
      {error && <CAlert color="danger">{error}</CAlert>}
      {message && <CAlert color="success">{message}</CAlert>}
      <div className="blog-admin-top-grid">
        <CCard className="content-admin-editor-card">
          <CCardHeader>{editingPostId ? 'Edit article' : 'Create article'}</CCardHeader>
          <CCardBody>
            <CForm onSubmit={savePost}>
              <div className="content-admin-form-grid">
                <CFormInput label="Article title" name="title" value={postForm.title} onChange={onPostChange} required />
                <CFormInput label="URL slug" name="slug" value={postForm.slug} onChange={onPostChange} placeholder="Generated from title when empty" />
                <CFormSelect label="Category" name="blog_category_id" value={postForm.blog_category_id} onChange={onPostChange}><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</CFormSelect>
                <CFormInput label="Author" name="author_name" value={postForm.author_name} onChange={onPostChange} placeholder="Defaults to administrator name" />
                <div className="content-admin-span-2"><CFormTextarea label="Excerpt" rows={3} name="excerpt" value={postForm.excerpt} onChange={onPostChange} /></div>
                <div className="content-admin-span-2"><RichTextEditor label="Article content" value={postForm.content} onChange={(content) => setPostForm((current) => ({ ...current, content }))} minHeight={280} /></div>
                <CFormInput label="Cover image" type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
                <CFormInput label="Cover image alt text" name="cover_image_alt" value={postForm.cover_image_alt} onChange={onPostChange} />
                {postForm.cover_image_url && <div className="content-admin-existing-media content-admin-span-2"><figure><img src={postForm.cover_image_url} alt="Current cover" /><figcaption>Current cover</figcaption></figure></div>}
                <CFormSelect label="Publishing status" name="status" value={postForm.status} onChange={onPostChange}><option value="draft">Draft</option><option value="published">Published</option></CFormSelect>
                <CFormInput label="Publish date" type="datetime-local" name="published_at" value={postForm.published_at} onChange={onPostChange} />
                <div><CFormCheck label="Featured article" name="is_featured" checked={postForm.is_featured} onChange={onPostChange} /></div><div />
                <CFormInput label="Meta title" name="meta_title" value={postForm.meta_title} onChange={onPostChange} maxLength={255} />
                <CFormTextarea label="Meta description" rows={3} name="meta_description" value={postForm.meta_description} onChange={onPostChange} maxLength={1000} />
              </div>
              <div className="d-flex gap-2 mt-4"><CButton type="submit" color="primary" disabled={saving}>{saving ? 'Saving…' : editingPostId ? 'Update article' : 'Create article'}</CButton>{editingPostId && <CButton type="button" color="secondary" variant="outline" onClick={resetPost}>Cancel</CButton>}</div>
            </CForm>
          </CCardBody>
        </CCard>

        <CCard className="blog-category-admin-card">
          <CCardHeader>{editingCategoryId ? 'Edit category' : 'Blog categories'}</CCardHeader>
          <CCardBody>
            <CForm onSubmit={saveCategory} className="mb-4">
              <div className="d-grid gap-3"><CFormInput label="Name" name="name" value={categoryForm.name} onChange={onCategoryChange} required /><CFormInput label="Slug" name="slug" value={categoryForm.slug} onChange={onCategoryChange} placeholder="Generated when empty" /><CFormTextarea label="Description" rows={3} name="description" value={categoryForm.description} onChange={onCategoryChange} /><CFormCheck label="Active" name="is_active" checked={categoryForm.is_active} onChange={onCategoryChange} /></div>
              <div className="d-flex gap-2 mt-3"><CButton type="submit" size="sm">{editingCategoryId ? 'Update' : 'Add category'}</CButton>{editingCategoryId && <CButton type="button" size="sm" color="secondary" variant="outline" onClick={resetCategory}>Cancel</CButton>}</div>
            </CForm>
            <AppDataTable columns={categoryColumns} data={categories} progressPending={loading} searchPlaceholder="Search categories…" />
          </CCardBody>
        </CCard>
      </div>
      <CCard className="mt-4"><CCardHeader>Blog articles</CCardHeader><CCardBody><AppDataTable columns={postColumns} data={posts} progressPending={loading} searchPlaceholder="Search articles…" /></CCardBody></CCard>
    </div>
  );
}
