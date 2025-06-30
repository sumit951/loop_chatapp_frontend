import React, { useState, useEffect, useRef, useMemo } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import axiosConfig, { BASE_URL } from './axiosConfig';
import socketIO from 'socket.io-client';
import Index from './chatconsole/Index'

const socket = socketIO.connect(`${BASE_URL}`);

function App() {


  return (
    <BrowserRouter basename="/loop_chatapp">
      <Routes>
        <Route path="/" element={<Index socket={socket} />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
