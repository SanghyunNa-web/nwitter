import { dbService, storage } from "../fbase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import {  ref, deleteObject } from "firebase/storage";
import { useState } from "react";
import React from "react";
import "./Nweet.module.css"; // Import the CSS file
import styles from "./Nweet.module.css"; // Import the CSS styles

const Nweet = ({ nweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [newNweet, setNewNweet] = useState(nweetObj.text);
  const onDeleteClick = async () => {
    const ok = window.confirm("삭제하시겠습니까?");
    if (ok) {
      await deleteDoc(doc(dbService, "nweets", nweetObj.id));

      if (nweetObj.attachmentUrl !== "") {
        const attachmentRef = ref(storage, nweetObj.attachmentUrl);
        await deleteObject(attachmentRef);
      }
    }
  };

  const toggleEditing = () => setEditing((prev) => !prev);

  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewNweet(value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await updateDoc(doc(dbService, "nweets", nweetObj.id), { text: newNweet, });
    setEditing(false);
  };

  return (
    <div  className={styles.nweetContainer}>
      {editing ? (
        <>
          <form onSubmit={onSubmit}>
            <input onChange={onChange} value={newNweet} required />
            <input type="submit" value="Update Nweet" />
          </form>
          <button onClick={toggleEditing}>Cancel</button>
        </>
      ) : (
        <>
          <h4>{nweetObj.text}</h4>
          {nweetObj.attachmentUrl && (
            <img src={nweetObj.attachmentUrl} width="100px" height="100px" alt="Nweet attachment" />
          )}
          {isOwner && (
            <>
              <button onClick={onDeleteClick}>Delete Nweet</button>
              <button onClick={toggleEditing}>Edit Nweet</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Nweet;
