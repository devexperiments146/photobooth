import React from 'react';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Camera from './Camera';

const App: React.FC = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Login />} />
			<Route path="camera" element={<Camera />} />
		</Routes>
	</BrowserRouter>
);


export default App;