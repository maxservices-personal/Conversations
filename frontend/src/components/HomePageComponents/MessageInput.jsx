import {
  ChevronLeft,
  ChevronRight,
  File,
  FileText,
  Image,
  Loader2,
  Music,
  Plus,
  Reply,
  Sticker,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useMessageStore } from "../../store/useMessagestore";
import { useChatStore } from "../../store/useChatStore";
import { getLinkPreview } from "link-preview-js";
import { motion, AnimatePresence } from "framer-motion";
import EmojiButton from "../UIComponents/EmojiPicker";
import { axiosInstance } from "../../lib/axios";
import SingleTypeButton from "../UIComponents/SingleTypeButton";
import { socket } from "../../lib/socket";

const MessageInput = () => {
  const { authUser } = useAuthStore();
  const { selectedFriend } = useChatStore();
  const {
    sendMessage,
    replyingData,
    setReplyingData,
    uploadFile,
    setUploadFilesSelected,
  } = useMessageStore();
  const [messageInputValue, setMessageInputValue] = useState("");
  const userInputRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [isReply, setIsReply] = useState(false);
  const [urlPreview, setUrlPreview] = useState(null);
  const [isUrlPreviewLoading, setIsUrlPreviewLoading] = useState(false);
  const [isAttachmentsDropdown, setIsAttachmentsDropdown] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const handleSendMessage = () => {
    if (userInput == "") return;
    if (replyingData.name) {
      setIsReply(true);
    } else {
      setReplyingData(null);
    }
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(
      now.getSeconds()
    )}`;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedFriend._id,
    });

    sendMessage(
      authUser._id,
      selectedFriend._id,
      userInput,
      replyingData,
      timestamp
    );
    setUserInput("");
    userInputRef.current.innerHTML = "";
    setIsEmpty(true);
    setReplyingData({});
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    if (e.key === "Enter" && e.shiftKey) {
      document.execCommand("insertLineBreak");
      e.preventDefault();
    }
  };

  const handleInput = async (e) => {
    const textContent = e.target.textContent;
    const htmlContent = e.target.innerHTML.trim();
    // console.log(textContent)
    setUserInput(e.target.innerText);
    handleTyping();

    if (textContent === "" && (htmlContent === "" || htmlContent === "<br>")) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlMatch = textContent.match(urlRegex);

    if (!urlPreview) {
      if (urlMatch && urlMatch[0] !== (urlPreview?.url || "")) {
        try {
          setIsUrlPreviewLoading(true);
          const data = await axiosInstance.post("/auth/get/linkpreview", {
            link: urlMatch[0],
          });

          console.log(data.data);

          setIsUrlPreviewLoading(false);
          setUrlPreview({
            url: urlMatch[0],
            title: data.data.title || "",
            description: data.data.description || "",
            image: data.data.images?.[0] || null,
          });
        } catch (err) {
          console.error("Failed to fetch link preview:", err);
          setUrlPreview(null);
          setIsUrlPreviewLoading(false);
        }
      } else if (!urlMatch) {
        setUrlPreview(null);
      }
    }
  };

  function handlePaste(event) {
    event.preventDefault();
    const clipboardData = event.clipboardData || window.clipboardData;

    if (clipboardData.items && clipboardData.items.length > 0) {
      const hasImageData = Array.from(clipboardData.items).some((item) =>
        item.type.startsWith("image/")
      );

      if (hasImageData) {
        console.log("Image data detected on the clipboard!");
        // const imageFile = Array.from(clipboardData.items)
        //   .find((item) => item.type.startsWith("image/"))
        //   .getAsFile();

        // if (imageFile) {
        //   console.log("Image file found:", imageFile);
        //   setFiles([...files, imageFile]);
        //   setIsFileSelected(true);
        //   uploadImage();
        //   return;
        // }
        return;
      }
    }

    const textData = clipboardData.getData("text/plain");
    if (textData) {
      document.execCommand("insertText", false, textData);
    }
  }

  let typingTimeout = useRef(null);

  const handleTyping = () => {
    socket.emit("typing", {
      senderId: authUser._id,
      receiverId: selectedFriend._id,
    });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: authUser._id,
        receiverId: selectedFriend._id,
      });
    }, 1500);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (event, fileType) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setIsAttachmentsDropdown(false);

    for (const file of files) {
      const fileData = {
        id: `imgm-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: fileType,
        file: file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        uploadProgress: 0,
      };

      setUploadedFiles((prev) => [...prev, fileData]);
    }
    console.log(uploadFile);
    event.target.value = "";

    for (const file of files) {
      const fileD = {
        id: `imgm-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: fileType,
        file: file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        uploadProgress: 0,
      };
      setUploadFilesSelected((prev) => [...prev, fileData]);
      await uploadFile();
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadFilesSelected((prev) => prev.filter((f) => f.id !== fileId));
  };

  const nextImage = () => {
    const imageFiles = uploadedFiles.filter((f) => f.type === "image");
    setCurrentImageIndex((prev) => (prev + 1) % imageFiles.length);
  };

  const prevImage = () => {
    const imageFiles = uploadedFiles.filter((f) => f.type === "image");
    setCurrentImageIndex(
      (prev) => (prev - 1 + imageFiles.length) % imageFiles.length
    );
  };

  const imageFiles = uploadedFiles.filter((f) => f.type === "image");
  const nonImageFiles = uploadedFiles.filter((f) => f.type !== "image");

  const getFileIcon = (type) => {
    switch (type) {
      case "image":
        return <Image size={20} className="text-blue-500" />;
      case "audio":
        return <Music size={20} className="text-purple-500" />;
      case "document":
        return <File size={20} className="text-green-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  return (
    <>
      {uploadedFiles.length != 0 && (
        <div className="w-full h-full absolute top-0 left-0 bg-[#cdcdcd49] backdrop-blur-xl  flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-6 border-b border-token-border-medium bg-transparent">
            <span className="font-semibold text-xl ">
              {imageFiles.length > 0 ? "Image Preview" : "File Preview"}
            </span>
            <SingleTypeButton OnChick={() => setUploadedFiles([])}>
              <X size={24} />
            </SingleTypeButton>
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            {imageFiles.length > 0 ? (
              // Image Slider
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative max-w-5xl max-h-full"
                  >
                    <img
                      src={imageFiles[currentImageIndex]?.preview}
                      alt={imageFiles[currentImageIndex]?.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                    />

                    {/* Image Info */}
                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
                      <p className="text-sm font-medium">
                        {imageFiles[currentImageIndex]?.name}
                      </p>
                      <p className="text-xs text-gray-300">
                        {imageFiles[currentImageIndex]?.size}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() =>
                        removeFile(imageFiles[currentImageIndex]?.id)
                      }
                      className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors text-white"
                    >
                      <X size={20} />
                    </button>
                  </motion.div>
                </AnimatePresence>

                {imageFiles.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
                    >
                      <ChevronLeft size={32} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
                    >
                      <ChevronRight size={32} />
                    </button>
                  </>
                )}

                {imageFiles.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                    {currentImageIndex + 1} / {imageFiles.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-2xl">
                <div className="space-y-4">
                  {nonImageFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-gray-700 rounded-lg">
                          {file.type === "audio" ? (
                            <Music size={32} className="text-purple-400" />
                          ) : (
                            <FileText size={32} className="text-green-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 truncate">
                            {file.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-2">
                            {file.type === "audio" ? "Audio File" : "Document"}{" "}
                            • {file.size}
                          </p>

                          {file.type === "document" && (
                            <div className="mt-4 bg-gray-900/50 rounded-lg p-4">
                              <p className="text-gray-300 text-sm">
                                Document ready for upload
                              </p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Strip for Images */}
          {imageFiles.length > 1 && (
            <div className="border-t border-token-border-medium bg-[#ffffffea] p-1 pb-[70px]">
              <div className="flex gap-3 items-center justify-center pt-2 overflow-x-auto pb-2">
                {imageFiles.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-token-primary"
                        : "border-transparent hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="w-full flex items-center justify-center gradient-blur-2 z-[200] p-5 pt-0 absolute bottom-0 left-0 ">
        <div className="w-[98%] transition-all backdrop-blur-lg shadow-lg bg-[#ffffff5e] flex-col items-end gap-0 p-2 rounded-[30px] border border-token-border-medium">
          <AnimatePresence mode="wait">
            {replyingData?.text && (
              <motion.div
                key="reply-container"
                initial={{ opacity: 0, y: 10, scale: 0.98, height: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  height: "auto",
                  transition: {
                    duration: 0.35,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                  height: 0,
                  transition: {
                    duration: 0.3,
                    ease: "easeInOut",
                  },
                }}
                className="overflow-hidden min-h-[80px] pt-2 rounded-t-3xl rounded-b-lg mb-2 pb-1 mx-[1px] bg-[#bababa5a]"
              >
                <div className="ml-4 flex items-center justify-between">
                  <div
                    className={`flex items-center gap-2 ${
                      replyingData.replying_to === authUser.name && ""
                    }`}
                  >
                    <Reply className="rotate-180" size={18} />
                    <span className="font-semibold text-[14px]">
                      {replyingData.replying_to}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingData({})}
                    className="mr-3 p-1 active:scale-90 transition-transform"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  className={`mb-2 mt-2 h-full ml-4 pl-5 max-h-[150px] rounded-md flex items-center border-l-4 ${
                    replyingData.replying_to === authUser.name
                      ? "border-token-primary"
                      : "border-[#393939]"
                  }`}
                >
                  <span className="max-h-[120px] max-w-[95%]  overflow-hidden text-[#5d5d5d] text-ellipsis">
                    {replyingData.text}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {urlPreview && (
            <div className="flex relative p-3 px-4 gap-2 rounded-b-md bg-gray-200 rounded-t-3xl mb-2">
              {urlPreview.image && (
                <img
                  src={urlPreview.image}
                  alt="preview"
                  className="w-16 h-16 rounded-md object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="font-semibold mb-1 text-sm">
                  {urlPreview.title}
                </span>
                <span className="text-xs mb-2 text-[#4d4d4d]">
                  {urlPreview.description}
                </span>
                <a
                  href={urlPreview.url}
                  target="_blank"
                  className="text-token-primary text-xs truncate"
                >
                  {urlPreview.url}
                </a>
              </div>
              <button
                onClick={() => setUrlPreview(null)}
                className="p-1 absolute z-10 top-2 right-2"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-0">
            <div className="relative">
              <button
                onClick={() => setIsAttachmentsDropdown(!isAttachmentsDropdown)}
                className="p-2 hover:bg-[#d2d2d2a5] border-token-border-medium rounded-full"
              >
                <Plus />
              </button>
              <AnimatePresence mode="wait">
                {isAttachmentsDropdown && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      transition: {
                        duration: 0.35,
                        ease: [0.25, 0.1, 0.25, 1], // smooth cubic-bezier easing
                      },
                    }}
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.3,
                        ease: "easeInOut",
                      },
                    }}
                    className="absolute rounded-2xl border border-token-border-medium w-[200px] bottom-10 left-0 p-1 bg-[#f7f7f7dd] backdrop-blur-lg"
                  >
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileSelect(e, "image")}
                      className="hidden"
                    />
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      onChange={(e) => handleFileSelect(e, "audio")}
                      className="hidden"
                    />
                    <input
                      ref={documentInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                      multiple
                      onChange={(e) => handleFileSelect(e, "document")}
                      className="hidden"
                    />
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center p-2 px-3 gap-2 hover:bg-[#7171711b] rounded-xl w-full"
                    >
                      <span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          class="icon"
                          aria-hidden="true"
                        >
                          <path d="M9.38759 8.53403C10.0712 8.43795 10.7036 8.91485 10.7997 9.59849C10.8956 10.2819 10.4195 10.9133 9.73622 11.0096C9.05259 11.1057 8.4202 10.6298 8.32411 9.94614C8.22804 9.26258 8.70407 8.63022 9.38759 8.53403Z"></path>
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M10.3886 5.58677C10.8476 5.5681 11.2608 5.5975 11.6581 5.74204L11.8895 5.83677C12.4185 6.07813 12.8721 6.46152 13.1991 6.94614L13.2831 7.07993C13.4673 7.39617 13.5758 7.74677 13.6571 8.14048C13.7484 8.58274 13.8154 9.13563 13.8993 9.81919L14.245 12.6317L14.3554 13.5624C14.3852 13.8423 14.4067 14.0936 14.4159 14.3192C14.4322 14.7209 14.4118 15.0879 14.3095 15.4393L14.2606 15.5887C14.0606 16.138 13.7126 16.6202 13.2577 16.9823L13.0565 17.1297C12.7061 17.366 12.312 17.4948 11.8622 17.5877C11.6411 17.6334 11.3919 17.673 11.1132 17.7118L10.1835 17.8299L7.37098 18.1756C6.68748 18.2596 6.13466 18.3282 5.68348 18.3465C5.28176 18.3628 4.9148 18.3424 4.56337 18.2401L4.41395 18.1913C3.86454 17.9912 3.38258 17.6432 3.0204 17.1883L2.87294 16.9872C2.63655 16.6367 2.50788 16.2427 2.41493 15.7928C2.36926 15.5717 2.32964 15.3226 2.29091 15.0438L2.17274 14.1141L1.82704 11.3016C1.74311 10.6181 1.67455 10.0653 1.65614 9.61411C1.63747 9.15518 1.66697 8.74175 1.81141 8.34458L1.90614 8.11313C2.14741 7.58441 2.53115 7.13051 3.01552 6.80356L3.1493 6.71958C3.46543 6.53545 3.8163 6.42688 4.20985 6.34556C4.65206 6.25423 5.20506 6.18729 5.88856 6.10337L8.70106 5.75767L9.63173 5.64731C9.91161 5.61744 10.163 5.59597 10.3886 5.58677ZM6.75673 13.0594C6.39143 12.978 6.00943 13.0106 5.66298 13.1522C5.5038 13.2173 5.32863 13.3345 5.06923 13.5829C4.80403 13.8368 4.49151 14.1871 4.04091 14.6932L3.64833 15.1327C3.67072 15.2763 3.69325 15.4061 3.71766 15.5243C3.79389 15.893 3.87637 16.0961 3.97548 16.243L4.06141 16.3602C4.27134 16.6237 4.5507 16.8253 4.86903 16.9413L5.00477 16.9813C5.1536 17.0148 5.34659 17.0289 5.6288 17.0174C6.01317 17.0018 6.50346 16.9419 7.20888 16.8553L10.0214 16.5106L10.9306 16.3944C11.0173 16.3824 11.0997 16.3693 11.1776 16.3573L8.61513 14.3065C8.08582 13.8831 7.71807 13.5905 7.41395 13.3846C7.19112 13.2338 7.02727 13.1469 6.88856 13.0975L6.75673 13.0594ZM10.4432 6.91587C10.2511 6.9237 10.0319 6.94288 9.77333 6.97056L8.86317 7.07798L6.05067 7.42271C5.34527 7.50932 4.85514 7.57047 4.47841 7.64829C4.20174 7.70549 4.01803 7.76626 3.88173 7.83481L3.75966 7.9061C3.47871 8.09575 3.25597 8.35913 3.1161 8.66587L3.06141 8.79966C3.00092 8.96619 2.96997 9.18338 2.98524 9.55942C3.00091 9.94382 3.06074 10.4341 3.14735 11.1395L3.42274 13.3895L3.64442 13.1434C3.82631 12.9454 3.99306 12.7715 4.1493 12.6219C4.46768 12.3171 4.78299 12.0748 5.16005 11.9208L5.38661 11.8377C5.92148 11.6655 6.49448 11.6387 7.04579 11.7616L7.19325 11.7987C7.53151 11.897 7.8399 12.067 8.15907 12.2831C8.51737 12.5256 8.9325 12.8582 9.4452 13.2684L12.5966 15.7889C12.7786 15.6032 12.9206 15.3806 13.0106 15.1336L13.0507 14.9979C13.0842 14.8491 13.0982 14.6561 13.0868 14.3739C13.079 14.1817 13.0598 13.9625 13.0321 13.704L12.9247 12.7938L12.58 9.9813C12.4933 9.27584 12.4322 8.78581 12.3544 8.40903C12.2972 8.13219 12.2364 7.94873 12.1679 7.81235L12.0966 7.69028C11.9069 7.40908 11.6437 7.18669 11.3368 7.04673L11.203 6.99204C11.0364 6.93147 10.8195 6.90059 10.4432 6.91587Z"
                          ></path>
                          <path d="M9.72841 1.5897C10.1797 1.60809 10.7322 1.67665 11.4159 1.7606L14.2284 2.1063L15.1581 2.22446C15.4371 2.26322 15.6859 2.3028 15.9071 2.34849C16.3571 2.44144 16.7509 2.57006 17.1015 2.80649L17.3026 2.95396C17.7576 3.31618 18.1055 3.79802 18.3056 4.34751L18.3544 4.49692C18.4567 4.84845 18.4772 5.21519 18.4608 5.61704C18.4516 5.84273 18.4292 6.09381 18.3993 6.37388L18.2899 7.30454L17.9442 10.117C17.8603 10.8007 17.7934 11.3535 17.702 11.7958C17.6207 12.1895 17.5122 12.5401 17.328 12.8563L17.244 12.9901C17.0958 13.2098 16.921 13.4086 16.7255 13.5829L16.6171 13.662C16.3496 13.8174 16.0009 13.769 15.787 13.5292C15.5427 13.255 15.5666 12.834 15.8407 12.5897L16.0018 12.4276C16.0519 12.3703 16.0986 12.3095 16.1415 12.2459L16.2128 12.1239C16.2813 11.9875 16.3421 11.8041 16.3993 11.5272C16.4771 11.1504 16.5383 10.6605 16.6249 9.95493L16.9696 7.14243L17.077 6.23228C17.1047 5.97357 17.1239 5.7546 17.1317 5.56235C17.1432 5.27997 17.1291 5.08722 17.0956 4.93833L17.0556 4.80259C16.9396 4.4842 16.7381 4.20493 16.4745 3.99497L16.3573 3.90903C16.2103 3.80991 16.0075 3.72745 15.6386 3.65122C15.4502 3.61231 15.2331 3.57756 14.9755 3.54185L14.0663 3.42563L11.2538 3.08091C10.5481 2.99426 10.0582 2.93444 9.67372 2.9188C9.39129 2.90732 9.19861 2.92142 9.0497 2.95493L8.91395 2.99497C8.59536 3.11093 8.31538 3.31224 8.10536 3.57603L8.0204 3.69321C7.95293 3.79324 7.89287 3.91951 7.83778 4.10532L7.787 4.23032C7.64153 4.50308 7.31955 4.64552 7.01161 4.55454C6.65948 4.45019 6.45804 4.07952 6.56239 3.72739L6.63075 3.52036C6.70469 3.31761 6.79738 3.12769 6.91786 2.94907L7.06532 2.7479C7.42756 2.29294 7.90937 1.94497 8.45888 1.74497L8.60829 1.69614C8.95981 1.59385 9.32655 1.57335 9.72841 1.5897Z"></path>
                        </svg>
                      </span>
                      <span className="text-[14px]">Images & Photos</span>
                    </button>
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="flex items-center p-2 px-3 gap-2 hover:bg-[#7171711b] rounded-xl w-full"
                    >
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18"
                          viewBox="0 -960 960 960"
                          width="18"
                          strokeWidth={1}
                          fill="currentColor"
                        >
                          <path d="M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-28-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
                        </svg>
                      </span>
                      <span className="text-[14px]">Audio Files</span>
                    </button>
                    <button
                      onClick={() => documentInputRef.current?.click()}
                      className="flex items-center p-2 px-3 gap-2 hover:bg-[#7171711b] rounded-xl w-full"
                    >
                      <span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18"
                          viewBox="0 -960 960 960"
                          width="18"
                          fill="currentColor"
                        >
                          <path d="M280-280h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm-80 480q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
                        </svg>
                      </span>
                      <span className="text-[14px]">Documents</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <EmojiButton
              onSelect={(emoji) => {
                setUserInput(userInput + emoji);
                setIsEmpty(false);
                userInputRef.current.innerText = userInput + emoji;
              }}
            />
            <div className="relative w-full">
              {isEmpty && (
                <div
                  className={`absolute top-2 left-2 text-[#676767] pointer-events-none select-none`}
                >
                  Type a message
                </div>
              )}
              <div
                ref={userInputRef}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className="w-full border-none outline-none max-h-[250px] overflow-y-auto overflow-x-hidden p-2"
                contentEditable
                suppressContentEditableWarning
              ></div>
            </div>
            <button
              disabled={!uploadedFiles?.length != 0 ? isEmpty : uploading}
              onClick={() => handleSendMessage()}
              className="p-2 border-token-border-medium rounded-full bg-accent-100 disabled:bg-[#c0bdbd] disabled:hover:scale-100 active:scale-90 disabled:active:scale-100 transition-colors text-white disabled:opacity-80 hover:scale-105"
            >
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  height="24"
                  width="24"
                  preserveAspectRatio="xMidYMid meet"
                  class=""
                  fill="none"
                >
                  <path
                    d="M5.4 19.425C5.06667 19.5583 4.75 19.5291 4.45 19.3375C4.15 19.1458 4 18.8666 4 18.5V14L12 12L4 9.99997V5.49997C4 5.1333 4.15 4.85414 4.45 4.66247C4.75 4.4708 5.06667 4.44164 5.4 4.57497L20.8 11.075C21.2167 11.2583 21.425 11.5666 21.425 12C21.425 12.4333 21.2167 12.7416 20.8 12.925L5.4 19.425Z"
                    fill="currentColor"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageInput;
