import { useEffect, useState } from 'react';
import { CCard, CCardBody, CCardText, CCardTitle, CCol, CRow } from '@coreui/react';
import {
  fetchCategories,
  fetchBrands,
  fetchColors,
  fetchMeasurements,
  fetchProducts,
  fetchSubCategories,
  fetchUsers,
} from '../api/client';

export default function DashboardHomePage() {
  const [usersCount, setUsersCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [subCategoriesCount, setSubCategoriesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [brandsCount, setBrandsCount] = useState(0);
  const [colorsCount, setColorsCount] = useState(0);
  const [measurementsCount, setMeasurementsCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const [users, categories, subCategories, products, brands, colors, measurements] = await Promise.all([
        fetchUsers(),
        fetchCategories(),
        fetchSubCategories(),
        fetchProducts(),
        fetchBrands(),
        fetchColors(),
        fetchMeasurements(),
      ]);
      setUsersCount(Array.isArray(users) ? users.length : 0);
      setCategoriesCount(Array.isArray(categories) ? categories.length : 0);
      setSubCategoriesCount(Array.isArray(subCategories) ? subCategories.length : 0);
      setProductsCount(Array.isArray(products) ? products.length : 0);
      setBrandsCount(Array.isArray(brands) ? brands.length : 0);
      setColorsCount(Array.isArray(colors) ? colors.length : 0);
      setMeasurementsCount(Array.isArray(measurements) ? measurements.length : 0);
    }

    loadStats().catch(() => {
      setUsersCount(0);
      setCategoriesCount(0);
      setSubCategoriesCount(0);
      setProductsCount(0);
      setBrandsCount(0);
      setColorsCount(0);
      setMeasurementsCount(0);
    });
  }, []);

  return (
    <CRow>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Users</CCardTitle>
            <CCardText className="dashboard-value">{usersCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Categories</CCardTitle>
            <CCardText className="dashboard-value">{categoriesCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Products</CCardTitle>
            <CCardText className="dashboard-value">{productsCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Sub Categories</CCardTitle>
            <CCardText className="dashboard-value">{subCategoriesCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Brands</CCardTitle>
            <CCardText className="dashboard-value">{brandsCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Colors</CCardTitle>
            <CCardText className="dashboard-value">{colorsCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol sm={6}>
        <CCard className="mb-4">
          <CCardBody>
            <CCardTitle>Total Measurements</CCardTitle>
            <CCardText className="dashboard-value">{measurementsCount}</CCardText>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}
