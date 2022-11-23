import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadTrades = ({user, callback}) => {
    
    const onChangeHandler=event=>{
        if(checkFileType(event.target.files[0])){
            const data = new FormData()   
            data.append('file', event.target.files[0]);  
            data.append('user', user)   
            axios.post("http://"+window.location.hostname+":3001/upload-csv", data, {
            }).then(res => {
                if (res.status === 200) {
                    const data = res.data.data
                    const message = `${data.total_imported} Trades imported and ${data.total_skipped} Trades Skipped`
                    toast.success(message, {
                        position: "top-left",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                } else {
                    toast.error(res.data.message, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                }

                callback(true)
            })
        } else {
            callback(false)
        }
    }

    const checkFileType=(data)=>{
        const pattern = new RegExp("^.*.(csv|CSV)$")
        if(pattern.test(data.name)){
            return true;
        } else { 
            toast.error('Wrong type of file!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
            return false;
        }   
    }

    return (
        <>
            <input type="file" onChange={onChangeHandler}/>
            <ToastContainer />
        </>
    )
    
}

export default UploadTrades;