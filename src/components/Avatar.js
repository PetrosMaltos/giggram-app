import React, { useState } from 'react';
import './Avatar.css'; // Для стилей

const Avatar = ({ src, onUpload }) => {
    const [avatar, setAvatar] = useState(src);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
                if (onUpload) {
                    onUpload(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="avatar-container">
            <img src={avatar} alt="User Avatar" className="avatar" />
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="upload-avatar"
            />
        </div>
    );
};

export default Avatar;
