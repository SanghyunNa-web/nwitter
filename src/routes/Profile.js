import { signOut, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { authService, dbService } from "../fbase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ userObj, refreshUser }) => {
  const navigate = useNavigate();
  const [myNweets, setMyNweets] = useState([]);
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);

  const onLogOutClick = () => {
    signOut(authService);
    navigate("/");
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewDisplayName(value);
  };

  useEffect(() => {
    const getMyNweets = async () => {
      const nweetsRef = collection(dbService, "nweets");
      const q = query(nweetsRef, where("creatorId", "==", userObj.uid));
      const querySnapshot = await getDocs(q);
      const nweets = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Add this line
        ...doc.data(),
      }));
      setMyNweets(nweets);
    };

    getMyNweets();
  }, [userObj.uid]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (userObj.displayName !== newDisplayName) {
      await updateProfile(userObj, { displayName: newDisplayName });
      refreshUser();
    }
  };

  return (
    <>
      <div>
        {myNweets.map((nweet) => (
          <div key={nweet.id}>
            <h4>{nweet.text}</h4>
            {nweet.attachmentUrl && (
              <img src={nweet.attachmentUrl} width="100px" height="100px" alt="" />
            )}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit}>
        <input onChange={onChange} type="text" placeholder="Display name" value={newDisplayName} />
        <input type="submit" value="Update Profile" />
      </form>
      <button onClick={onLogOutClick}>Log Out</button>
    </>
  );
};

export default Profile;
