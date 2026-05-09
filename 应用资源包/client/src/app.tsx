import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/HomePage/HomePage';
import BusinessDetailPage from './pages/BusinessDetailPage/BusinessDetailPage';
import TaskPage from './pages/TaskPage/TaskPage';
import VersionPage from './pages/VersionPage/VersionPage';
import MaterialPage from './pages/MaterialPage/MaterialPage';
import ProductPage from './pages/ProductPage/ProductPage';
import SyncPage from './pages/SyncPage/SyncPage';
import BaseDataPage from './pages/BaseDataPage/BaseDataPage';
import DataMapPage from './pages/DataMapPage/DataMapPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="business" element={<BusinessDetailPage />} />
        <Route path="business/:id" element={<BusinessDetailPage />} />
        <Route path="tasks" element={<TaskPage />} />
        <Route path="versions" element={<VersionPage />} />
        <Route path="materials" element={<MaterialPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="sync" element={<SyncPage />} />
        <Route path="base-data" element={<BaseDataPage />} />
        <Route path="data-map" element={<DataMapPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
