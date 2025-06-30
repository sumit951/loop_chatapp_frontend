import React, { useState } from "react";

const Chatfileupload = ({ onFileSelect,parentselectedFiles,setfilesblank }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if the total number of files exceeds 5
    if (files.length + selectedFiles.length > 3) {
      alert("You can upload a maximum of 3 files.");
      return;
    }

    // Check individual file sizes (25 MB = 25 * 1024 * 1024 bytes)
    const maxFileSize = 25 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      alert("Each file must be smaller than 25 MB.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };


  const handleRemoveFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  const handleRemoveAllFile = () => {
    setSelectedFiles([]);
  };
  //console.log(parentselectedFiles);
  
  if(parentselectedFiles)
  {
    setTimeout(() => {
    setSelectedFiles([])
    setfilesblank(false)
    },600)
  }

  return (
    <div className="file-upload">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept="image/*, .pdf, .docx, .txt"
        hidden
        id="file-input"
        style={{display:'none'}}
      />
      {/* {selectedFiles.length>0 && <button type="button" className="btn btn-danger ms-2 float-end" onClick={() => handleRemoveAllFile()} title="Remove All">Remove All <i className="fa fa-close ms-1"></i></button>} */}
      {/* <label className="badge badge-primary rounded p-2 px-3 float-end" htmlFor="file-input">
        <i className="attachment-icon"><i className="fa fa-paperclip "></i></i>
      </label> */}

      <div className="row file-preview">
        {selectedFiles.map((file, index) => (
            <div  key={index} className="file-preview-item">
            <div className="col-md-11 chip-info">{file.name}</div>
            <div>
                <button type="button" className="btn xcross" onClick={() => handleRemoveFile(index)}><i className="fa fa-close ms-1"></i></button>
            </div>
            </div>
        ))}
      </div>
      
    </div>
  );
};

export default Chatfileupload;