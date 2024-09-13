import React, { useState, useEffect } from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { db, doc, updateDoc, getDoc } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import './ProjectCard.css';

const ProjectCard = ({ id, title, image, authorName, authorAvatar, description }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      const projectRef = doc(db, 'projects', id);
      const projectDoc = await getDoc(projectRef);
      if (projectDoc.exists()) {
        const data = projectDoc.data();
        setLikeCount(data.likes || 0);
        
        if (currentUser && data.likedBy && data.likedBy.includes(currentUser.uid)) {
          setLiked(true);
        }
      }
    };
    if (currentUser) {
      fetchLikes();
    }
  }, [id, currentUser]);

  const handleLikeClick = async (e) => {
    e.stopPropagation();

    if (!currentUser) {
      alert("Необходимо войти в аккаунт, чтобы ставить лайки.");
      return;
    }

    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);

    const projectRef = doc(db, 'projects', id);
    const projectDoc = await getDoc(projectRef);

    if (projectDoc.exists()) {
      const data = projectDoc.data();
      let updatedLikedBy = data.likedBy || [];

      if (liked) {
        updatedLikedBy = updatedLikedBy.filter(uid => uid !== currentUser.uid);
      } else {
        updatedLikedBy.push(currentUser.uid);
      }

      await updateDoc(projectRef, {
        likes: liked ? likeCount - 1 : likeCount + 1,
        likedBy: updatedLikedBy,
      });
    }
  };

  return (
    <div className="project-card">
      <Link to={`/projects/${id}`} className="project-card-link">
        <div className="project-image-wrapper">
          <img src={image} alt={title} className="project-image" />
        </div>
        <div className="project-details">
          <div className="author-info">
            <img src={authorAvatar} alt={authorName} className="author-avatar" />
            <p className="author-name">{authorName}</p>
          </div>
          <h2 className="project-title">{title}</h2>
          <p className="project-description">{description}</p>
        </div>
      </Link>
      <button 
        className={`like-button ${liked ? 'liked' : ''}`} 
        onClick={handleLikeClick}
      >
        {liked ? <AiFillHeart className="like-icon" /> : <AiOutlineHeart className="like-icon" />}
        <span className="like-count">{likeCount}</span>
      </button>
    </div>
  );
};

export default ProjectCard;
