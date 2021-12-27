import logo from './logo.svg';
import './App.css';
import Main from './components/Main';
import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';

function App() {
  return (
    <div>

      <Main/>
      <Alert stack={{limit: 3}} />
    </div>
  );
}

export default App;
