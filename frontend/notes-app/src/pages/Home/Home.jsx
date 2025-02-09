/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import NotesCard from "../../components/Cards/NotesCard";
import moment from "moment";
import { MdAdd, MdCurtains } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import addNotesImg from "../../utils/Images/addNotes.png";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import emptyNotes from "../../utils/Images/emptyNotes.png";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToast, setShowToast] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const [isSearch, setIsSearch] = useState(false);
  const [query, setQuery] = useState("");

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({
      isShown: true,
      type: "edit",
      data: noteDetails,
    });
  };

  const handleCloseToast = () => {
    setShowToast({
      isShown: false,
      message: "",
    });
  };

  const showToastMessage = (message, type) => {
    setShowToast({
      isShown: true,
      message: message,
      type: type,
    });
  };

  //Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/api/users/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  //Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/api/notes/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error, please try again.");
    }
  };

  //Delete note
  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete(
        "/api/notes/delete-note/" + noteId
      );

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted successfully.", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.log("An unexpected error, please try again.");
      }
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(
        "/api/notes/update-note-pinned/" + noteId,
        {
          isPinned: !noteData.isPinned,
        }
      );

      if (response.data && response.data.note) {
        showToastMessage("Note Updated successfully.");
        getAllNotes();
      }
    } catch (error) {
      console.log(error);
    }
  };

  //Search notes
  const onSearchNote = async (query) => {
    setQuery(query);
    try {
      const response = await axiosInstance.get("/api/notes/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error, please try again.");
    }
  };

  const handClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handClearSearch={handClearSearch}
      />
      <div className="container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item, index) => (
              <NotesCard
                key={item.id}
                title={item.title}
                date={moment(item.createdOn).format("Do MMM YYYY")}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? emptyNotes : addNotesImg}
            message={
              isSearch
                ? `Oops, we couldn't find any notes for "${query}".`
                : `Start adding your first notes! Click the 'Add' button to get started.`
            }
          />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center cursor-pointer rounded-2xl bg-violet-500 hover:bg-black absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-hidden"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToast.isShown}
        message={showToast.message}
        type={showToast.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
