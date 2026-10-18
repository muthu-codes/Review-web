import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import DashboardPage from './pages/DashboardPage';
import CategoryDirectoryPage from './pages/CategoryDirectoryPage';
import EstablishmentDetailPage from './pages/EstablishmentDetailPage';
import SuggestPlacePage from './pages/SuggestPlacePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminPortalPage from './pages/AdminPortalPage';
import GuidelinesPage from './pages/GuidelinesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="categories" element={<CategoryDirectoryPage />} />
        <Route path="categories/:slug" element={<CategoryDirectoryPage />} />
        <Route path="establishments/:id" element={<EstablishmentDetailPage />} />
        <Route path="suggest-place" element={<SuggestPlacePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin-portal" element={<AdminPortalPage />} />
        <Route path="guidelines" element={<GuidelinesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
