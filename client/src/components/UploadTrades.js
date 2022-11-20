import { useState } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
const UploadTrades = ({user, updateData}) => {
    
    const onChangeHandler=event=>{
        const pattern = new RegExp("^.*.(csv|CSV)$")
        if(pattern.test(event.target.files[0].name)) {
            const data = new FormData()   
            data.append('file', event.target.files[0]);  
            data.append('user', user)   
            axios.post("http://"+window.location.hostname+":3001/upload-csv", data, {
            }).then(res => {
                console.log("Upload Complete")
                // updateData();
            })
        } else {
            console.log("Wrong type of file.");
        }
    }

    return (
        <>
            <label className="input-upload">
                <input type="file" onChange={onChangeHandler}/>
            </label>
        </>
    )
}

export default UploadTrades;