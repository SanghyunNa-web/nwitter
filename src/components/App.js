import { useEffect, useState } from 'react';
import AppRouter from "./Router";
import { authService } from '../fbase';
import { getAuth } from "firebase/auth";

function App() {
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userObj, setUserObj] = useState(null);

  const refreshUser = () => {
    const user = getAuth().currentUser;
    if (user) {
      setUserObj({
        ...user,
        displayName: user.displayName,
      });
    }
  };

  useEffect(() => {
    authService.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(user);
        setUserObj(user);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, []);

  return (
    <>
      {init ? (
      <AppRouter isLoggedIn={isLoggedIn} userObj={userObj} refreshUser={refreshUser}  />
      ) : (
        "initializing..."
        )}
    </>
  );
}

export default App;

