// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRouter from './routes/AppRouter.jsx';
import Layout from './components/Layout.jsx';
import { ThemeProvider } from "./context/ThemeContext.jsx"

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Layout>
//              <ThemeProvider attribute="class"><AppRouter /></ThemeProvider>


//         </Layout>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider attribute="class">
          <Layout>
            <AppRouter />
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
