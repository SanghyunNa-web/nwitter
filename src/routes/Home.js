import { dbService, storage } from "../fbase";
import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import Nweet from "../components/Nweet";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";



const Home = ({ userObj }) => {
  const [nweet, setNweet] = useState("");
  const [nweets, setNweets] = useState([]);
  const [attachment, setAttachment] = useState("");
  const [theFile, setTheFile] = useState(null);

  useEffect(() => {
    const q = query(collection(dbService, "nweets"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nweetArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNweets(nweetArray);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();

    let attachmentUrl = "";
    if (attachment !== "") {
      const attachmentRef = ref(storage, `${userObj.uid}/${Date.now()}`);
      const uploadTask = uploadBytesResumable(attachmentRef, theFile);
      await uploadTask;

      attachmentUrl = await getDownloadURL(attachmentRef);
    }

    try {
      await addDoc(collection(dbService, "nweets"), {
        text: nweet,
        createdAt: Date.now(),
        creatorId: userObj.uid,
        attachmentUrl,
      });
      setNweet("");
      setAttachment("");
    } catch (error) {
      console.error("Error adding document to Firestore:", error);
    }
  };

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNweet(value);
  };

  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(file);
    setTheFile(file);
  };

  const onClearAttachment = () => setAttachment("");

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={nweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Nweet" />
        {attachment && (
          <div>
            <img src={attachment} width="100px" height="100px" alt="Nweet preview" />
            <button onClick={onClearAttachment}>Clear</button>
          </div>
        )}
      </form>
      <div>
        {nweets.map((nweet) => (
          <Nweet
            key={nweet.id}
            nweetObj={nweet}
            isOwner={nweet.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;



