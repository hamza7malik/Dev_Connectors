// import React, {Fragment} from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Navbar from './components/layout/Nav'
import Landing from './components/layout/Landing'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Alert from './components/layout/Alert'
//redux
import {Provider} from 'react-redux';
import store from './store';

const App = () => 
  <Provider store={store}>
    <Router>
      <Navbar/>
      <Routes>
        <Route exact path="/" element={<Landing/>} />
      </Routes>
      <section className='container'>
        <Routes>
        <Route exact path="/login" element={<Login/>} />
        <Route exact path="/register" element={<Register/>} />
      </Routes>
      <Alert />
      </section>
    </Router>
  </Provider>


export default App;
