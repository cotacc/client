// App.js
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from './pages/login';
// import Signup from './pages/signup';

import PrivateRoute from './components/security/PrivateRoute';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './components/security/AuthProvider'; // Adjust the import path

import AdminMemoManager from './pages/admin/adminMemomanager';
import AdminMemoDetails from './pages/admin/adminMemodetails';
import Admincalendar from './pages/admin/admincalendar';
import AdminRecieveMemoDetails from './pages/admin/adminrecievememodetails';
import AdminReport from './pages/admin/adminReport';
import AdminsentReport from './pages/admin/AdminsentReport';
import Adminfacultymanager from './pages/admin/adminfacultymanager';
import InviteMember from './pages/admin/inviteMember';
import AdminCreateMemo from './pages/admin/adminCreateMemo';
import Admindashboard from '../src/pages/admin/admind';

import Secretarycreatememo from './pages/secretary/secretaryuploadmemo';
import Secretarymemomanager from './pages/secretary/secretarymemomanager';
import Secretarymemodetails from './pages/secretary/secretarymemodetails';
import Secretaryfacultymanager from './pages/secretary/secretaryfacultymanger';
import SecretaryRecieveMemoDetails from './pages/secretary/secretaryrecievememodetails';
import Secretarydashboard from './pages/secretary/secretaryDashboard';
import Secretarycalendar from './pages/secretary/secretarycalendar';
import SecretaryReport from './pages/secretary/secretaryreportlist';
import SecretarysentReport from './pages/secretary/secretarysentreport';

import Usercalendar from './pages/user/usercalendar';
import UserReport from './pages/user/userreportlist';
import Usermemo from './pages/user/Usermemo';
import MemoDetails from './pages/user/userrecievememo';
import Userdashboard from './pages/user/Userdashboard';

import Unregisterdashboard from './pages/unregistereduer/unregisteruser';

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <BrowserRouter>
        <Route exact path="/" component={Login} />
        <Route exact path="/login" component={Login} />
        {/* <Route exact path="/signup" component={Signup} /> */}

        <PrivateRoute
          exact
          path="/unregisteruser/dashboard"
          component={Unregisterdashboard}
          allowedRoles={[0]}
        />

        <PrivateRoute
          exact
          path="/user/memo"
          component={Usermemo}
          allowedRoles={[3]}
        />
        <PrivateRoute
          exact
          path="/user/dashboard"
          component={Userdashboard}
          allowedRoles={[3]}
        />
        <PrivateRoute
          exact
          path="/user/memo/:memoId"
          component={MemoDetails}
          allowedRoles={[3]}
        />
        <PrivateRoute
          exact
          path="/user/calendar"
          component={Usercalendar}
          allowedRoles={[3]}
        />
        <PrivateRoute
          exact
          path="/user/report_list"
          component={UserReport}
          allowedRoles={[3]}
        />

        <PrivateRoute
          exact
          path="/admin/dashboard"
          component={Admindashboard}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/inviteMember"
          component={InviteMember}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/faculty_Manager"
          component={Adminfacultymanager}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/memo_create"
          component={AdminCreateMemo}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/memo_manager"
          component={AdminMemoManager}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/memo_Icreate/:memoId"
          component={AdminMemoDetails}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/receive_memo/:memoId"
          component={AdminRecieveMemoDetails}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/calendar"
          component={Admincalendar}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/report_list"
          component={AdminReport}
          allowedRoles={[1]}
        />
        <PrivateRoute
          exact
          path="/admin/sent_report/:memoId"
          component={AdminsentReport}
          allowedRoles={[1]}
        />

        <PrivateRoute
          exact
          path="/secretary/dashboard"
          component={Secretarydashboard}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/faculty_manager"
          component={Secretaryfacultymanager}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/memo_create"
          component={Secretarycreatememo}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/memo_manager"
          component={Secretarymemomanager}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/memo_Icreate/:memoId"
          component={Secretarymemodetails}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/receive_memo/:memoId"
          component={SecretaryRecieveMemoDetails}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/calendar"
          component={Secretarycalendar}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/report_list"
          component={SecretaryReport}
          allowedRoles={[2]}
        />
        <PrivateRoute
          exact
          path="/secretary/sent_report/:memoId"
          component={SecretarysentReport}
          allowedRoles={[2]}
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
