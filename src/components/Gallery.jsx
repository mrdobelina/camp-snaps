import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Helmet } from 'react-helmet';
import { db } from '../firebase';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function Gallery() {
  const [gallery, setGallery] = useState(null);
  const [index, setIndex] = useState(-1);
  const { id } = useParams();

  useEffect(() => {
    const fetchGallery = async () => {
      const docRef = doc(db, "galleries", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const galleryData = docSnap.data();
        setGallery(galleryData);
      }
    };
    
    fetchGallery();
  }, [id]);

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.setAttribute('download', '');
        link.setAttribute('target', '_blank');
        link.click();
      } else {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = imageUrl.split('/').pop() || 'campsnap-image.jpg';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!gallery) {
    return (
      <>
        <Helmet>
          <title>Camp Snaps — Share your Memories</title>
          <meta property="og:title" content="Camp Snaps — Share your Memories" />
          <meta property="og:description" content="Check out these amazing memories!" />
          <meta property="og:type" content="website" />
        </Helmet>
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{gallery.title ? `${gallery.title} — Camp Snaps` : 'Camp Snaps — Share your Memories'}</title>
        <meta property="og:title" content={gallery.title ? `${gallery.title} — Camp Snaps` : 'Camp Snaps — Share your Memories'} />
        <meta property="og:description" content="Check out these amazing memories!" />
        <meta property="og:type" content="website" />
        {gallery.images && gallery.images.length > 0 && (
          <meta property="og:image" content={gallery.images[0]} />
        )}
      </Helmet>
      
      <div className="gallery-container">
        <h1 className="gallery-title">{gallery.title}</h1>
        <div className="image-grid">
          {gallery.images.map((url, i) => (
            <div key={i} className="image-container">
              <img
                src={url}
                alt={`Image ${i + 1}`}
                onClick={() => setIndex(i)}
                className="gallery-image"
              />
              <button 
                className="download-button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(url);
                }}
              >
                Download
              </button>
            </div>
          ))}
        </div>
        
        <div className="gallery-footer">
          <p>Pics taken with <a href="https://www.campsnapphoto.com/" target="_blank" rel="noopener noreferrer">Camp Snap Camera</a></p>
        </div>
        
        <Lightbox
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          slides={gallery.images.map(url => ({ src: url }))}
        />
      </div>
    </>
  );
}

export default Gallery;