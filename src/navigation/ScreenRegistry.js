import SplashScreen from '../screens/SplashScreen.jsx';
import Onboard1 from '../screens/Onboard1.jsx';
import Onboard2 from '../screens/Onboard2.jsx';
import Onboard3 from '../screens/Onboard3.jsx';
import WelcomeScreen from '../screens/WelcomeScreen.jsx';
import LoginScreen from '../screens/LoginScreen.jsx';
import OtpMethodScreen from '../screens/OtpMethodScreen.jsx';
import OtpScreen from '../screens/OtpScreen.jsx';
import PhoneVerifiedScreen from '../screens/PhoneVerifiedScreen.jsx';
import RegisterScreen from '../screens/RegisterScreen.jsx';
import ScanIdScreen from '../screens/ScanIdScreen.jsx';
import ScanCompleteScreen from '../screens/ScanCompleteScreen.jsx';
import StatusDashboardScreen from '../screens/StatusDashboardScreen.jsx';
import PendingApprovalScreen from '../screens/PendingApprovalScreen.jsx';
import NeedCorrectionScreen from '../screens/NeedCorrectionScreen.jsx';
import MapScreen from '../screens/MapScreen.jsx';
import ReserveScreen from '../screens/ReserveScreen.jsx';
import ReservedScreen from '../screens/ReservedScreen.jsx';
import BikeFoundScreen from '../screens/BikeFoundScreen.jsx';
import ScanQRScreen from '../screens/ScanQRScreen.jsx';
import RidingScreen from '../screens/RidingScreen.jsx';
import CallingScreen from '../screens/CallingScreen.jsx';

import HistoryScreen from '../screens/HistoryScreen.jsx';
import HowToRideScreen from '../screens/HowToRideScreen.jsx';
import NotificationsScreen from '../screens/NotificationsScreen.jsx';
import SettingsScreen from '../screens/SettingsScreen.jsx';
import LegalScreen from '../screens/LegalScreen.jsx';
import ProfileScreen from '../screens/ProfileScreen.jsx';
import EditProfileScreen from '../screens/EditProfileScreen.jsx';
import ChangePasswordScreen from '../screens/ChangePasswordScreen.jsx';
import ReportIssueScreen from '../screens/ReportIssueScreen.jsx';
import ReportBikeScreen from '../screens/ReportBikeScreen.jsx';
import AdminScreen from '../screens/AdminScreen.jsx';
import AdminApp from '../admin/AdminApp.jsx';

export const SCREENS = {
  splash: SplashScreen,
  onboard1: Onboard1,
  onboard2: Onboard2,
  onboard3: Onboard3,
  welcome: WelcomeScreen,
  login: LoginScreen,
  otpMethod: OtpMethodScreen,
  otp: OtpScreen,
  phoneVerified: PhoneVerifiedScreen,
  register: RegisterScreen,
  scanId: ScanIdScreen,
  scanComplete: ScanCompleteScreen,
  statusDashboard: StatusDashboardScreen,
  pendingApproval: PendingApprovalScreen,
  needCorrection: NeedCorrectionScreen,
  map: MapScreen,
  userHome: MapScreen,
  reserve: ReserveScreen,
  reserved: ReservedScreen,
  bikeFound: BikeFoundScreen,
  scanQR: ScanQRScreen,
  riding: RidingScreen,
  calling: CallingScreen,
  history: HistoryScreen,
  howToRide: HowToRideScreen,
  notifications: NotificationsScreen,
  settings: SettingsScreen,
  legal: LegalScreen,
  profile: ProfileScreen,
  editProfile: EditProfileScreen,
  changePassword: ChangePasswordScreen,
  reportIssue: ReportIssueScreen,
  reportBike: ReportBikeScreen,
  admin: AdminScreen,
  adminDashboard: AdminApp
};
