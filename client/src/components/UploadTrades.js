import { useState } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';

const UploadTrades = ({user}) => {
    
    let [selectedFile, setSelectedFile] = useState();

    const onChangeHandler=event=>{
        setSelectedFile(event.target.files[0])
    }

    const checkFileType=(data)=>{
        const pattern = new RegExp("^.*.(csv|CSV)$")
        if(pattern.test(data.name)){
            return true;
        } else { 
            console.log("Wrong type of file.");
            return false;
        }   
    }

    const onClickHandler = () => {
        if(checkFileType(selectedFile)){
            const data = new FormData()   
            data.append('file', selectedFile);  
            data.append('user', user)   
            axios.post("http://"+window.location.hostname+":3001/upload-csv", data, {
            }).then(res => {
                console.log("Upload Complete")
                setSelectedFile(null)
                // updateData();
            })
        }
    }

    return (
        <>
            <label className="input-upload">
                <input type="file" onChange={onChangeHandler}/>
            </label>
            <p>{ selectedFile && selectedFile.name }</p>
            <button className="" onClick={onClickHandler}>Upload Trades</button> 
        </>
    )
}

export default UploadTrades;